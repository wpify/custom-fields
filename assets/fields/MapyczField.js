import React, { useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import { load } from 'wpify-mapy-cz';
import { __, sprintf } from '@wordpress/i18n';

const MapyczField = (props) => {
	const { id, className, group_level = 0, value = {}, onChange, appContext } = props;
	const [currentValue, setCurrentValue] = useState(value);
	const suggestref = useRef();
	const ref = useRef();
	const [mapycz, setMapycz] = useState();

	const {
		description = '',
		latitude = 0,
		longitude = 0,
		zoom = 12,
	} = currentValue;

	useEffect(() => {
		if (onChange && JSON.stringify(value) !== JSON.stringify(currentValue)) {
			onChange(currentValue);
		}
	}, [onChange, value, currentValue]);

	useEffect(() => {
		load({
			element: ref.current,
			center: { longitude, latitude },
			zoom,
			sync_control: true,
			marker: { longitude, latitude },
			default_controls: true,
		}, setMapycz);
	}, [setMapycz]);

	useEffect(() => {
		if (mapycz) {
			Object.values(mapycz.markers).forEach((marker) => {
				marker.decorate(SMap.Marker.Feature.Draggable);
			});

			const signals = mapycz.getMap().getSignals();

			signals.addListener(window, 'marker-drag-stop', (e) => {
				const coords = e.target.getCoords();
				setCurrentValue({ ...currentValue, longitude: coords.x, latitude: coords.y });
			});

			mapycz.addSuggest({ input: suggestref.current }, (place) => {
				setCurrentValue({
					...currentValue,
					longitude: place.data.longitude,
					latitude: place.data.latitude,
					address: place.data.title,
				});
			});
		}
	}, [mapycz, setCurrentValue]);

	useEffect(() => {
		if (mapycz) {
			mapycz.setCenter({ latitude, longitude });

			if (Object.values(mapycz.markers).length === 0) {
				mapycz.addMarker({ longitude, latitude });
			}

			Object.values(mapycz.markers).forEach((marker) => {
				marker.setCoords(new SMap.Coords(longitude, latitude));
				marker.decorate(SMap.Marker.Feature.Draggable);
			});
		}
	}, [mapycz, latitude, longitude]);

	useEffect(() => {
		if (mapycz) {
			const handleMapChange = (e) => {
				const newZoom = e.target.getZoom();

				setCurrentValue((currentValue) => ({
					...currentValue,
					zoom: newZoom
				}));
			};

			mapycz.getMap().getSignals().addListener(window, 'map-redraw', handleMapChange);
		}
	}, [mapycz, setCurrentValue]);

	return (
		<React.Fragment>
			{group_level === 0 && ( // We need to have the input with the name only if not in group
				<input type="hidden" name={appContext.hooks.name(id)} value={JSON.stringify(currentValue)}/>
			)}
			<div style={{ marginBottom: '1rem' }}>
				<input
					id={appContext.hooks.id(id)}
					type="text"
					ref={suggestref}
					className={classnames('regular-text', className)}
					style={{ width: '100%' }}
					placeholder={__('Type to search...', 'wpify-mapy-cz')}
				/>
			</div>
			{latitude > 0 && longitude > 0 && (
				<div style={{ marginBottom: '1rem' }}>
					<small>{sprintf(__('latitude: %s, longitude: %s', 'wpify-mapy-cz'), latitude, longitude)}</small>
				</div>
			)}
			<div className="mapycz" style={{ height: '400px', marginBottom: '1rem' }} ref={ref}/>
			{description && (
				<p>{description}</p>
			)}
		</React.Fragment>
	);
};

export default MapyczField;
