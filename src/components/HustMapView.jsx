import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';

const HUST_CENTER = [105.8431793, 21.006275];
const BOUNDS = [
  [105.835, 20.995],
  [105.853, 21.012]
];

export default function HustMapView({
  buildings,
  parkings,
  onSelectBuilding,
  onSelectParking,
  mapRef
}) {
  const containerRef = useRef(null);
  const activeMarkerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: '/style.json',
      center: HUST_CENTER,
      zoom: 17,
      minZoom: 15,
      maxZoom: 20,
      maxBounds: BOUNDS,
      attributionControl: false
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: true, showZoom: true }),
      'top-right'
    );

    mapRef.current = map;

    map.on('load', () => {
      // Ensure campus building coordinates have interactive click targets
      // Add custom GEOJSON source for buildings & parkings to guarantee markers & clickability
      const geojsonFeatures = [];

      buildings.forEach((b) => {
        if (!b.coordinate) return;
        const [lat, lng] = b.coordinate.split(',').map((x) => parseFloat(x.trim()));
        if (!isFinite(lat) || !isFinite(lng)) return;
        geojsonFeatures.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          properties: {
            id: b.building_id,
            name: b.name,
            kind: 'building',
            data: b
          }
        });
      });

      parkings.forEach((p) => {
        if (!p.coordinate) return;
        const [lat, lng] = p.coordinate.split(',').map((x) => parseFloat(x.trim()));
        if (!isFinite(lat) || !isFinite(lng)) return;
        geojsonFeatures.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          properties: {
            id: p.parking_id,
            name: p.name,
            kind: 'parking',
            data: p
          }
        });
      });

      if (!map.getSource('hust-interactive-pois')) {
        map.addSource('hust-interactive-pois', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: geojsonFeatures
          }
        });

        // Add soft glowing circles for interactive POIs
        map.addLayer({
          id: 'poi-glow',
          type: 'circle',
          source: 'hust-interactive-pois',
          paint: {
            'circle-radius': 14,
            'circle-color': [
              'match',
              ['get', 'kind'],
              'building',
              '#8b1515',
              '#1d4ed8'
            ],
            'circle-opacity': 0.15,
            'circle-stroke-width': 1.5,
            'circle-stroke-color': [
              'match',
              ['get', 'kind'],
              'building',
              '#b91c1c',
              '#2563eb'
            ],
            'circle-stroke-opacity': 0.6
          }
        });

        // Add label layer
        map.addLayer({
          id: 'poi-labels',
          type: 'symbol',
          source: 'hust-interactive-pois',
          layout: {
            'text-field': ['get', 'name'],
            'text-size': 11,
            'text-offset': [0, 1.2],
            'text-anchor': 'top',
            'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular']
          },
          paint: {
            'text-color': '#203354',
            'text-halo-color': '#FDFFF5',
            'text-halo-width': 2
          }
        });
      }

      // Handle map vector layer clicks from hustmap's multipolygons
      map.on('click', (e) => {
        // Query multipolygons or interactive pois
        const features = map.queryRenderedFeatures(e.point, {
          layers: ['multipolygons', 'poi-glow', 'poi-labels', 'uni_building', 'uni_other_building']
        });

        if (features && features.length > 0) {
          const feat = features[0];
          const props = feat.properties || {};

          // Check if custom POI
          if (props.kind === 'building') {
            const bData = typeof props.data === 'string' ? JSON.parse(props.data) : props.data;
            onSelectBuilding(bData);
            return;
          }
          if (props.kind === 'parking') {
            const pData = typeof props.data === 'string' ? JSON.parse(props.data) : props.data;
            onSelectParking(pData, 'uni_motor_parking');
            return;
          }

          // Check if original vector tile property
          if (props.building_id) {
            const matched = buildings.find((b) => b.building_id === props.building_id);
            if (matched) {
              onSelectBuilding(matched);
              return;
            }
          }

          if (props.types === 'uni_building' || props.types === 'uni_other_building') {
            const matched = buildings.find((b) => b.name === props.name || b.building_id === props.building_id);
            if (matched) {
              onSelectBuilding(matched);
              return;
            }
          }

          if (props.types === 'uni_car_parking' || props.types === 'uni_motor_parking') {
            const matched = parkings.find((p) => p.parking_id === props.parking_id || p.name === props.name);
            if (matched) {
              onSelectParking(matched, props.types);
              return;
            }
          }
        }
      });

      // Cursor change on hover
      map.on('mouseenter', 'poi-glow', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'poi-glow', () => {
        map.getCanvas().style.cursor = '';
      });
    });

    return () => {
      map.remove();
    };
  }, [buildings, parkings]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full bg-[#f4ebd0]" />
    </div>
  );
}
