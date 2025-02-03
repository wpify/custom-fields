import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useMapyCzApiKey, useMapyCzReverseGeocode, useMapyCzSuggestions } from '@/helpers/hooks';
import { Button } from '@/components/Button';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import clsx from 'clsx';
import { AppContext } from '@/custom-fields';

const markerIcon = L.icon({
  iconUrl: 'https://api.mapy.cz/img/api/marker/drop-red.png',
  iconSize: [22, 31],
  iconAnchor: [11, 31],
});

const defaultValue = {
  latitude: 50.078625,
  longitude: 14.460411,
  zoom: 13,
};

export function Mapycz ({
  id,
  htmlId,
  value = {},
  onChange,
  lang = 'en',
  className,
  disabled = false,
  setTitle,
}) {
  const mapycz = useMapyCzApiKey();

  useEffect(() => {
    if (value.longitude && value.latitude) {
      setTitle(`${value.longitude}:${value.latitude}`);
    } else {
      setTitle('');
    }
  }, [value]);

  return (
    <div className={clsx('wpifycf-field-mapycz', `wpifycf-field-mapycz--${id}`, className)}>
      {mapycz.isFetching ? (
        <div>{__('Loading MapyCZ field...', 'wpify-custom-field')}</div>
      ) : mapycz.isError ? (
        <div>{__('Error in loading MapyCZ field...', 'wpify-custom-field')}</div>
      ) : mapycz.apiKey ? (
        <MapyczMap apiKey={mapycz.apiKey} value={value} onChange={onChange} lang={lang} disabled={disabled} />
      ) : (
        <SetApiKey mapycz={mapycz} htmlId={htmlId} />
      )}
    </div>
  );
}

Mapycz.checkValidity = function (value, field) {
  const validity = [];

  if (field.required && (typeof value === 'object' && ((!value.latitude || !value.longitude)) || typeof value !== 'object')) {
    validity.push(__('This field is required.', 'wpify-custom-fields'));
  }

  return validity;
};

function MapyczMap ({
  apiKey,
  value = {},
  onChange,
  lang,
  disabled = false,
}) {
  const [map, setMap] = useState(null);
  const latitude = value.latitude || defaultValue.latitude;
  const longitude = value.longitude || defaultValue.longitude;
  const zoom = value.zoom || defaultValue.zoom;
  const center = [latitude, longitude];
  const root = useRef();
  const { context } = useContext(AppContext);

  const { data: geocoded } = useMapyCzReverseGeocode({
    latitude,
    longitude,
    apiKey,
    lang,
  });

  useEffect(() => {
    if (Array.isArray(geocoded?.items)) {
      const location = geocoded.items[0];
      let street = '';
      let number = '';
      let zip = '';
      let city = '';
      let cityPart = '';
      let country = '';

      location.regionalStructure?.forEach((item) => {
        if (item.type === 'regional.address') {
          number = item.name;
        } else if (item.type === 'regional.street') {
          street = item.name;
        } else if (item.type === 'regional.municipality_part') {
          cityPart = item.name;
        } else if (item.type === 'regional.municipality') {
          city = item.name;
        } else if (item.type === 'regional.country') {
          country = item.name;
        }
      });

      if (location.zip) {
        zip = location.zip;
      }

      if (value.street !== street || value.number !== number || value.zip !== zip || value.city !== city || value.cityPart !== cityPart || value.country !== country) {
        onChange({ ...value, street, number, zip, city, cityPart, country });
      }
    }
  }, [onChange, value, geocoded]);

  const setCenter = useCallback((position) => {
    if (map) {
      map.setView(position);
    }
  }, [map]);

  const handleMarkerDrag = useCallback((event) => {
    if (!disabled) {
      const marker = event.target;
      const position = marker.getLatLng();
      onChange({ ...value, latitude: position.lat.toFixed(6), longitude: position.lng.toFixed(6) });
      setCenter(position);
    }
  }, [onChange, value, setCenter, disabled]);

  const handleZoomEnd = useCallback((event) => {
    if (!disabled) {
      onChange({ ...value, zoom: event.target.getZoom() });
    }
  }, [onChange, value, disabled]);

  const handleMoveEnd = useCallback((event) => {
    if (!disabled) {
      const center = event.target.getCenter();
      onChange({ ...value, latitude: center.lat.toFixed(6), longitude: center.lng.toFixed(6) });
    }
  }, [onChange, value, disabled]);

  useEffect(() => {
    if (map) {
      map.on('zoomend', handleZoomEnd);
      map.on('moveend', handleMoveEnd);
    }

    return () => {
      if (map) {
        map.off('zoomend', handleZoomEnd);
        map.off('moveend', handleMoveEnd);
      }
    };
  }, [map, handleZoomEnd, handleMoveEnd, context]);

  const mapContainer = useMemo(() => {
    return (
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '300px', width: '100%' }}
        scrollWheelZoom={false}
        ref={setMap}
      >
        <TileLayerMapycz apiKey={apiKey} />
        <Marker
          position={center}
          icon={markerIcon}
          draggable={!disabled}
          eventHandlers={{ dragend: handleMarkerDrag }}
        />
      </MapContainer>
    );
  }, [apiKey, map, handleMarkerDrag]);

  useEffect(() => {
    if (map) {
      const LogoControl = L.Control.extend({
        options: { position: 'bottomleft' },
        onAdd: () => {
          const container = L.DomUtil.create('div');
          const link = L.DomUtil.create('a', '', container);
          link.setAttribute('href', 'http://mapy.cz/');
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noreferrer noopenner');
          link.innerHTML = '<img src="https://api.mapy.cz/img/api/logo.svg" alt="Seznam.cz a.s." />';
          L.DomEvent.disableClickPropagation(link);
          return container;
        },
      });
      new LogoControl().addTo(map);
    }
  }, [map]);

  return (
    <div className="wpifycf-field-mapycz__map" ref={root}>
      {!disabled && (
        <AutoComplete value={value} onChange={onChange} apiKey={apiKey} lang={lang} setCenter={setCenter} />
      )}
      {mapContainer}
      <Address value={value} className="wpifycf-field-mapycz__address" />
    </div>
  );
}

function Address ({ value, className }) {
  if (!value?.latitude || !value?.longitude) {
    return null;
  }

  return (
    <div className={className}>
      {value.country && (
        <>
          {value.street}
          {' '}
          {value.number}
          {(value.street || value.number) && ', '}
          {value.zip}
          {' '}
          {value.city}
          {' '}
          {value.cityPart && ` - ${value.cityPart}`}
          {', '}
          {value.country}
        </>
      )}
      <br />
      {parseFloat(value.latitude).toFixed(6)}, {parseFloat(value.longitude).toFixed(6)}
    </div>
  );
}

function AutoComplete ({ value, onChange, apiKey, lang, setCenter }) {
  const rootRef = useRef();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(null);
  const { data: suggestions } = useMapyCzSuggestions({
    query,
    apiKey,
    lang,
  });

  const handleTermChange = useCallback((event) => {
    setQuery(event.target.value);
  }, []);

  const handleMouseOver = useCallback((index) => {
    setActive(index);
  }, []);

  const handleSelect = useCallback((index) => {
    if (suggestions.items[index]) {
      onChange({
        ...value,
        latitude: suggestions.items[index].position.lat.toFixed(6),
        longitude: suggestions.items[index].position.lon.toFixed(6),
      });
      setActive(null);
      setCenter([
        suggestions.items[index].position.lat.toFixed(6),
        suggestions.items[index].position.lon.toFixed(6),
      ]);
      setQuery(suggestions.items[index].name);
    }
  }, [onChange, suggestions.items, setCenter, value]);

  const length = suggestions.items.length;

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'ArrowUp' && active > 0) {
      setActive((active + length - 1) % length);
    } else if (event.key === 'ArrowDown' && active < length - 1) {
      setActive((active + length + 1) % length);
    } else if (event.key === 'Enter') {
      event.stopPropagation();
      event.preventDefault();

      const formats = [
        /(?<latitude>-?\d+(\.\d+)?)\s*[,;]\s*(?<longitude>-?\d+(\.\d+)?)/,
        /(?<latitude>-?\d+(,\d+)?)\s*;\s*(?<longitude>-?\d+(,\d+)?)/,
      ];

      for(let i = 0; i < formats.length; i++) {
        const match = event.target.value.match(formats[i]);
        if (match) {
          const { latitude, longitude } = match.groups;
          onChange({
            ...value,
            latitude: parseFloat(latitude).toFixed(6),
            longitude: parseFloat(longitude).toFixed(6),
          });
          setActive(null);
          setQuery('');
          setCenter([parseFloat(latitude).toFixed(6), parseFloat(longitude).toFixed(6)]);
          return;
        }
      }

      handleSelect(active);
      setActive(null);
    }
  }, [active, handleSelect, length, setCenter]);

  const handleFocus = useCallback(() => {
    setActive(0);
  }, []);

  return (
    <div className="wpifycf-field-mapycz__autocomplete" ref={rootRef}>
      <input
        value={query}
        onChange={handleTermChange}
        className="wpifycf-field-mapycz__autocomplete-input"
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onMouseOver={() => setActive(0)}
      />
      {active !== null && suggestions.items.length > 0 && (
        <div className="wpifycf-field-mapycz__suggestions">
          {suggestions.items.map((suggestion, index) => (
            <button
              type="button"
              key={index}
              onClick={() => handleSelect(index)}
              onMouseOver={() => handleMouseOver(index)}
              onMouseOut={() => setActive(null)}
              className={index === active ? 'active' : ''}
            >
              <strong>
                {suggestion.name}
              </strong>
              <br />
              <small>
                {suggestion.location}
              </small>
            </button>
          ))}
          <div className="wpifycf-field-mapycz__suggestions-attribution">
            {__('Powered by', 'wpify-custom-fields')}
            <a href="https://api.mapy.cz/" target="_blank" rel="noreferrer noopenner">
              <img src="https://api.mapy.cz/img/api/logo-small.svg" width={50} alt="Mapy.cz" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function TileLayerMapycz ({ apiKey }) {
  return (
    <TileLayer
      url={`https://api.mapy.cz/v1/maptiles/basic/256/{z}/{x}/{y}?apikey=${apiKey}`}
      attribution='<a href="https://api.mapy.cz/copyright" target="_blank">&copy; Seznam.cz a.s. a další</a>'
    />
  );
}

function SetApiKey ({ mapycz, htmlId }) {
  const [apiKey, setApiKey] = useState(mapycz.apiKey || '');

  const handleApiKeyChange = useCallback((event) => {
    setApiKey(event.target.value);
  }, [setApiKey]);

  const handleApiKeyUpdate = useCallback(() => {
    mapycz.handleUpdate(apiKey);
  }, [mapycz, apiKey]);

  return (
    <div className="wpifycf-field-mapycz__set-key">
      <label
        htmlFor={htmlId}
        dangerouslySetInnerHTML={{
          __html: __('To use Mapy.cz field type, please register your project in <a href="https://developer.mapy.cz/account/projects" target="_blank" rel="noreferrer noopenner">Mapy.cz portal</a><br />and get the API key, it\'s free. <strong>Enter the key bellow</strong>:', 'wpify-custom-fields'),
        }}
      />
      <input
        id={htmlId}
        type="text"
        size={46}
        value={apiKey}
        onChange={handleApiKeyChange}
      />
      <Button onClick={handleApiKeyUpdate}>
        {__('Set API key', 'wpify-custom-fields')}
      </Button>
    </div>
  );
}

addFilter('wpifycf_field_mapycz', 'wpify_custom_fields', () => Mapycz);
