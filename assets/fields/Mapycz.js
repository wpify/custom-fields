import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMapyCzApiKey, useMapyCzReverseGeocode, useMapyCzSuggestions } from '@/helpers/hooks';
import { Button } from '@/components/Button';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import { useLeafletContext } from '@react-leaflet/core';
import L from 'leaflet';

const markerIcon = L.icon({
  iconUrl: 'https://api.mapy.cz/img/api/marker/drop-red.png',
  iconSize: [22, 31],
  iconAnchor: [11, 31],
});

const defaultValue = {
  latitude: 50.0874654,
  longitude: 14.4212535,
  zoom: 13,
}

export function Mapycz ({ id, htmlId, name, value = {}, onChange, lang = 'en' }) {
  const mapycz = useMapyCzApiKey();

  return (
    <span className="wpifycf-field-mapycz">
      {name && (
        <input type="hidden" name={name} value={JSON.stringify(value)} />
      )}
      {mapycz.isFetching ? (
        <span>{__('Loading MapyCZ field...', 'wpify-custom-field')}</span>
      ) : mapycz.isError ? (
        <span>{__('Error in loading MapyCZ field...', 'wpify-custom-field')}</span>
      ) : mapycz.apiKey ? (
        <MapyczMap apiKey={mapycz.apiKey} value={value} onChange={onChange} lang={lang} />
      ) : (
        <SetApiKey mapycz={mapycz} htmlId={htmlId} />
      )}
    </span>
  );
}

function MapyczMap ({ apiKey, value = {}, onChange, lang }) {
  const [map, setMap] = useState(null);
  const latitude = value.latitude || defaultValue.latitude;
  const longitude = value.longitude || defaultValue.longitude;
  const zoom = value.zoom || defaultValue.zoom;
  const center = [latitude, longitude];

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
    const marker = event.target;
    const position = marker.getLatLng();
    onChange({ ...value, latitude: position.lat, longitude: position.lng });
    setCenter(position);
  }, [onChange, value, setCenter]);

  const handleZoomEnd = useCallback((event) => {
    onChange({ ...value, zoom: event.target.getZoom() });
  }, [onChange, value]);

  const handleMoveEnd = useCallback((event) => {
    const center = event.target.getCenter();
    onChange({ ...value, latitude: center.lat, longitude: center.lng });
  }, [onChange, value]);

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
  }, [map, handleZoomEnd, handleMoveEnd]);

  const mapContainer = useMemo(() => (
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
        draggable
        eventHandlers={{ dragend: handleMarkerDrag }}
      />
      <SeznamCzLogo />
    </MapContainer>
  ), [apiKey, handleMarkerDrag]);

  return (
    <span className="wpifycf-field-mapycz__map">
      <AutoComplete value={value} onChange={onChange} apiKey={apiKey} lang={lang} setCenter={setCenter} />
      {mapContainer}
      <Address value={value} className="wpifycf-field-mapycz__address" />
    </span>
  );
}

function Address ({ value, className }) {
  if (!value?.latitude || !value?.longitude) {
    return null;
  }

  return (
    <span className={className}>
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
      {value.latitude}, {value.longitude}
    </span>
  )
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
    onChange({
      ...value,
      latitude: suggestions.items[index].position.lat,
      longitude: suggestions.items[index].position.lon,
    });
    setActive(null);
    setCenter([suggestions.items[index].position.lat, suggestions.items[index].position.lon]);
    setQuery(suggestions.items[index].name);
  }, [onChange, suggestions.items, setCenter, value]);

  const length = suggestions.items.length;

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'ArrowUp' && active > 0) {
      setActive((active + length - 1) % length);
    } else if (event.key === 'ArrowDown' && active < length - 1) {
      setActive((active + length + 1) % length);
    } else if (event.key === 'Enter' && active !== null) {
      event.stopPropagation();
      event.preventDefault();
      handleSelect(active);
      setActive(null);
    }
  }, [active, handleSelect, length]);

  const handleFocus = useCallback(() => {
    setActive(0);
  }, []);

  return (
    <span className="wpifycf-field-mapycz__autocomplete" ref={rootRef}>
      <input
        value={query}
        onChange={handleTermChange}
        className="wpifycf-field-mapycz__autocomplete-input"
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onMouseOver={() => setActive(0)}
      />
      {active !== null && suggestions.items.length > 0 && (
        <span className="wpifycf-field-mapycz__suggestions">
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
          <span className="wpifycf-field-mapycz__suggestions-attribution">
            {__('Powered by', 'wpify-custom-fields')}
            <a href="https://api.mapy.cz/" target="_blank" rel="noreferrer noopenner">
              <img src="https://api.mapy.cz/img/api/logo-small.svg" width={50} alt="Mapy.cz" />
            </a>
          </span>
        </span>
      )}
    </span>
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

function SeznamCzLogo () {
  const context = useLeafletContext();

  useEffect(() => {
    const LogoControl = L.Control.extend({
      options: {
        position: 'bottomleft',
      },
      onAdd: (map) => {
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

    new LogoControl().addTo(context.map);
  }, []);

  return null;
}

function SetApiKey ({ mapycz, htmlId }) {
  const [apiKey, setApiKey] = useState('');

  const handleApiKeyChange = useCallback((event) => {
    setApiKey(event.target.value);
  }, []);

  const handleApiKeyUpdate = useCallback(() => {
    mapycz.handleUpdate(apiKey);
  }, [mapycz, apiKey]);

  useEffect(() => {
    if (mapycz.apiKey !== apiKey) {
      setApiKey(mapycz.apiKey ? mapycz.apiKey : '');
    }
  }, [mapycz, apiKey]);

  return (
    <span className="wpifycf-field-mapycz__set-key">
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
    </span>
  );
}

addFilter('wpifycf_field_mapycz', 'wpify_custom_fields', () => Mapycz);
