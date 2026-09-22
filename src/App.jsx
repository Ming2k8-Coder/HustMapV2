import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { CampusRouter } from './router';
import { translations } from './constants/translations';
import { NavigationBar } from './components/NavigationBar';
import { FeaturePopup } from './components/FeaturePopup';
import { RoutePanel } from './components/RoutePanel';
import { SearchModal } from './components/SearchModal';
import { RoomModal } from './components/RoomModal';
import { FeedbackModal } from './components/FeedbackModal';
import OfflineModal from './components/OfflineModal';
import GuideModal from './components/GuideModal';
import NerdOverlay from './components/NerdOverlay';
import { checkOfflineStatus } from './services/offlineManager';

const API_BASE = '/api/v1';

// Global cache for 100% offline standalone resilience
let cachedBuildings = [];
let cachedParkings = [];
let cachedRooms = {};

export default function App() {
  const [lang, setLang] = useState('vi');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // 3D Visualization & Guide state
  const [is3DMode, setIs3DMode] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);

  // Nerd / Debug Mode state
  const [isNerdMode, setIsNerdMode] = useState(false);
  const [gpsRawData, setGpsRawData] = useState(null);

  // Selected feature modal data
  const [selectedFeature, setSelectedFeature] = useState(null); // { type, data }
  const [popupOpen, setPopupOpen] = useState(false);

  // Floor and room type filters for building modal
  const [floorNum, setFloorNum] = useState(0);
  const [roomType, setRoomType] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Room results popup
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [roomResults, setRoomResults] = useState([]);
  const [selectedBuildingName, setSelectedBuildingName] = useState('');

  // Routing / Directions state (A* Engine)
  const [routeModalOpen, setRouteModalOpen] = useState(false);
  const [routeStart, setRouteStart] = useState(null); // { name, lng, lat }
  const [routeEnd, setRouteEnd] = useState(null); // { name, lng, lat }
  const [routeResult, setRouteResult] = useState(null); // { distanceM, timeMins }
  const [isSelectingPoint, setIsSelectingPoint] = useState(null); // 'start' | 'end' | null

  // Offline Mode state
  const [offlineModalOpen, setOfflineModalOpen] = useState(false);
  const [isOfflineReady, setIsOfflineReady] = useState(false);

  // Register Service Worker & check offline status
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('[HustMap] Service Worker registered successfully.'))
        .catch((err) => console.warn('[HustMap] SW registration failed:', err));
    }
    checkOfflineStatus().then((res) => {
      setIsOfflineReady(res.isReady);
    });
  }, []);

  // Feedback & Contributing modal
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackDesc, setFeedbackDesc] = useState('');
  const [feedbackContact, setFeedbackContact] = useState('');
  const [feedbackFile, setFeedbackFile] = useState(null);
  const [feedbackPhotoPreview, setFeedbackPhotoPreview] = useState(null);
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackSending, setFeedbackSending] = useState(false);

  // GPS Movement Logger / Contributing state
  const [isRecordingGPS, setIsRecordingGPS] = useState(false);
  const [recordedTrack, setRecordedTrack] = useState([]); // array of [lng, lat]
  const gpsWatchIdRef = useRef(null);
  const recordedTrackRef = useRef([]);

  // POI & Room Contribution state
  const [poiData, setPoiData] = useState({
    category: 'room',
    buildingId: '',
    floorNum: '',
    code: '',
    name: '',
    coords: null // [lng, lat]
  });
  const poiMarkerRef = useRef(null);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const userLocationRef = useRef(null);
  const routerRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);

  const t = (key) => {
    return translations[lang]?.[key] || key;
  };

  // Pre-load local fallback dataset & campus road network
  useEffect(() => {
    fetch('/buildings.json')
      .then((r) => r.json())
      .then((data) => (cachedBuildings = data))
      .catch(() => {});
    fetch('/parkings.json')
      .then((r) => r.json())
      .then((data) => (cachedParkings = data))
      .catch(() => {});
    fetch('/rooms_all.json')
      .then((r) => r.json())
      .then((data) => (cachedRooms = data))
      .catch(() => {});
    fetch('/campus_roads.json')
      .then((r) => r.json())
      .then((roads) => {
        routerRef.current = new CampusRouter(roads);
      })
      .catch(() => {});
  }, []);

  // Switch language
  const changeLanguage = (newLang) => {
    setLang(newLang);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setStyle(newLang === 'en' ? '/api_style_en.json' : '/api_style_vi.json');
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let watchId;
    const styleUrl = lang === 'en' ? '/api_style_en.json' : '/api_style_vi.json';

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: styleUrl,
      center: [105.8431793, 21.006275],
      zoom: 17,
      minZoom: 16,
      maxBounds: [
        [105.835, 20.995],
        [105.853, 21.012]
      ],
      pitch: 0,
      bearing: 0,
      pitchWithRotate: false, // Mặc định 2D: không cho vô tình kéo nghiêng
      dragRotate: false,      // Mặc định 2D: khóa xoay chuột phải/Ctrl
      touchPitch: false,     // Mặc định 2D: khóa vuốt 2 ngón chỉnh pitch
      attributionControl: false,
      transformRequest: (url) => {
        if (url.startsWith('/')) {
          return { url: `${window.location.origin}${url}` };
        }
        return { url };
      }
    });

    mapInstanceRef.current = map;

    map.on('load', () => {
      setLoading(false);

      // Add route GeoJSON source and polyline layers
      if (!map.getSource('route-source')) {
        map.addSource('route-source', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: []
            }
          }
        });

        // Outer glow/casing
        map.addLayer({
          id: 'route-casing',
          type: 'line',
          source: 'route-source',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#1D4ED8',
            'line-width': 8,
            'line-opacity': 0.5
          }
        });

        // Inner glowing route line
        map.addLayer({
          id: 'route-layer',
          type: 'line',
          source: 'route-source',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#2563EB',
            'line-width': 4,
            'line-dasharray': [1.5, 1.5]
          }
        });
      }

      // Add GPS live recorded trace source & line layer
      if (!map.getSource('trace-source')) {
        map.addSource('trace-source', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: []
            }
          }
        });

        map.addLayer({
          id: 'trace-layer',
          type: 'line',
          source: 'trace-source',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#F59E0B',
            'line-width': 5,
            'line-opacity': 0.85
          }
        });
      }

      // Add 3D Buildings Extrusion Layer (HUST Campus 3D Vis)
      if (!map.getLayer('hustmap-3d-buildings') && map.getSource('map26maptiler')) {
        map.addLayer({
          id: 'hustmap-3d-buildings',
          source: 'map26maptiler',
          'source-layer': 'multipolygons',
          type: 'fill-extrusion',
          filter: [
            'match',
            ['get', 'types'],
            ['uni_building', 'DEMO uni_building', 'uni_other_building'],
            true,
            false
          ],
          layout: {
            visibility: 'none' // Mặc định ở chế độ 2D, khi bật 3D sẽ chuyển thành 'visible'
          },
          paint: {
            // Chiều cao tòa nhà: nếu tòa nhà D8 là 11 tầng (~40m), thư viện ~22m, các tòa D3, C7... theo số tầng
            'fill-extrusion-height': [
              'interpolate', ['linear'], ['zoom'],
              16, 0,
              16.5, [
                'match',
                ['get', 'name'],
                ['D8', 'NHÀ B1'], 42,
                ['C7'], 32,
                ['THƯ VIỆN TẠ QUANG BỬU', 'D3', 'D4', 'D5', 'D7', 'D9', 'D3-5'], 20,
                ['C1', 'C5', 'C10'], 16,
                ['C2', 'C3', 'C4', 'C3-4', 'D2A'], 12,
                14 // Mặc định các tòa khác là ~14 mét (~3-4 tầng)
              ]
            ],
            'fill-extrusion-base': 0,
            'fill-extrusion-color': [
              'match',
              ['get', 'types'],
              ['uni_building', 'DEMO uni_building'], '#2A436D',
              '#4B5563'
            ],
            'fill-extrusion-opacity': 0.94
          }
        });
      }
    });

    // Exact hustmap click handler logic with local fallback & routing support
    map.on('click', (e) => {
      // Check if user is currently picking a start or end point for directions
      const currentSelecting = map._selectingPointMode;
      if (currentSelecting) {
        const coords = [Number(e.lngLat.lng.toFixed(6)), Number(e.lngLat.lat.toFixed(6))];
        if (map._onPickPointCallback) {
          map._onPickPointCallback(currentSelecting, coords);
        }
        return;
      }

      setSearchModalOpen(false);
      setSearchTerm('');
      setRoomModalOpen(false);
      setRoomResults([]);

      const features = map.queryRenderedFeatures(e.point, {
        layers: ['multipolygons']
      });

      const matched = features.find(
        (f) =>
          f.properties &&
          (f.properties.types === 'uni_building' ||
            f.properties.types === 'uni_other_building' ||
            f.properties.types === 'uni_car_parking' ||
            f.properties.types === 'uni_motor_parking')
      );

      if (matched && matched.properties && (matched.properties.building_id || matched.properties.parking_id)) {
        if (
          matched.properties.types === 'uni_building' ||
          matched.properties.types === 'uni_other_building'
        ) {
          const localData = cachedBuildings.find(
            (b) => b.building_id === matched.properties.building_id
          );
          if (localData) {
            setPopupOpen(true);
            setSelectedFeature({
              type: matched.properties.types,
              data: localData
            });
          }
        } else if (
          matched.properties.types === 'uni_motor_parking' ||
          matched.properties.types === 'uni_car_parking'
        ) {
          const localData = cachedParkings.find(
            (p) => p.parking_id === matched.properties.parking_id
          );
          if (localData) {
            setPopupOpen(true);
            setSelectedFeature({
              type: matched.properties.types,
              data: localData
            });
          }
        }
      } else {
        setSelectedFeature(null);
        setPopupOpen(false);
      }
    });

    // Geolocation watching
    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lng = pos.coords.longitude;
          const lat = pos.coords.latitude;
          userLocationRef.current = [lng, lat];

          // Store raw GPS metrics for Nerd Mode
          setGpsRawData({
            lng,
            lat,
            speed: pos.coords.speed,
            altitude: pos.coords.altitude,
            altitudeAccuracy: pos.coords.altitudeAccuracy,
            accuracy: pos.coords.accuracy,
            heading: pos.coords.heading,
            timestamp: pos.timestamp
          });

          if (userMarkerRef.current) {
            userMarkerRef.current.setLngLat([lng, lat]);
          } else {
            userMarkerRef.current = new maplibregl.Marker({ color: '#FF0000' })
              .setLngLat([lng, lat])
              .addTo(map);
          }
        },
        (err) => console.warn('Geolocation:', err),
        { enableHighAccuracy: true }
      );
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (gpsWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
      }
    };
  }, []);

  // Reset filter when selected building changes
  useEffect(() => {
    if (selectedFeature && selectedFeature.type === 'uni_building') {
      setFloorNum(0);
      setRoomType('');
      setErrorMessage('');
    }
  }, [selectedFeature]);

  // Execute Search
  const handleExecuteSearch = () => {
    if (searchTerm.trim()) {
      setSearchModalOpen(true);
    }
  };

  // Routing Handler Functions (A* Graph Engine)
  const handleStartRouteTo = (destination) => {
    if (!destination) return;
    setPopupOpen(false);
    setSearchModalOpen(false);
    setRoomModalOpen(false);

    // Set end destination
    const endCoord = [destination.lng, destination.lat];
    setRouteEnd(destination);

    // Default start point: user location or main gate (C1)
    let startPoint = null;
    if (userLocationRef.current) {
      startPoint = {
        name: t('Vị trí của bạn'),
        lng: userLocationRef.current[0],
        lat: userLocationRef.current[1]
      };
    } else {
      startPoint = {
        name: 'Cổng Parabol - C1',
        lng: 105.843148,
        lat: 21.007049
      };
    }
    setRouteStart(startPoint);
    setRouteModalOpen(true);

    setTimeout(() => {
      calculateRoute([startPoint.lng, startPoint.lat], endCoord);
    }, 100);
  };

  const calculateRoute = (startCoord, endCoord) => {
    if (!routerRef.current) return;
    const res = routerRef.current.findRoute(startCoord, endCoord);
    if (res && res.path) {
      setRouteResult({
        distanceM: res.distanceM,
        timeMins: res.timeMins
      });

      const map = mapInstanceRef.current;
      if (map && map.getSource('route-source')) {
        map.getSource('route-source').setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: res.path
          }
        });

        // Add/update Start marker (Green)
        if (startMarkerRef.current) {
          startMarkerRef.current.setLngLat(startCoord);
        } else {
          startMarkerRef.current = new maplibregl.Marker({ color: '#10B981' })
            .setLngLat(startCoord)
            .addTo(map);
        }

        // Add/update End marker (Red)
        if (endMarkerRef.current) {
          endMarkerRef.current.setLngLat(endCoord);
        } else {
          endMarkerRef.current = new maplibregl.Marker({ color: '#EF4444' })
            .setLngLat(endCoord)
            .addTo(map);
        }

        // Fit map bounds to show whole route
        const bounds = new maplibregl.LngLatBounds();
        res.path.forEach((pt) => bounds.extend(pt));
        map.fitBounds(bounds, { padding: 80, duration: 1000 });
      }
    }
  };

  const handleClearRoute = () => {
    setRouteResult(null);
    setRouteStart(null);
    setRouteEnd(null);
    setRouteModalOpen(false);
    setIsSelectingPoint(null);
    const map = mapInstanceRef.current;
    if (map) {
      map._selectingPointMode = null;
      if (map.getSource('route-source')) {
        map.getSource('route-source').setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        });
      }
      if (startMarkerRef.current) {
        startMarkerRef.current.remove();
        startMarkerRef.current = null;
      }
      if (endMarkerRef.current) {
        endMarkerRef.current.remove();
        endMarkerRef.current = null;
      }
    }
  };

  const handlePickPointOnMap = (mode) => {
    setIsSelectingPoint(mode);
    const map = mapInstanceRef.current;
    if (map) {
      map._selectingPointMode = mode;
      map._onPickPointCallback = (pickedMode, coords) => {
        const pointData = {
          name: `${coords[1].toFixed(5)}, ${coords[0].toFixed(5)}`,
          lng: coords[0],
          lat: coords[1]
        };
        if (pickedMode === 'start') {
          setRouteStart(pointData);
          if (routeEnd) calculateRoute([pointData.lng, pointData.lat], [routeEnd.lng, routeEnd.lat]);
        } else {
          setRouteEnd(pointData);
          if (routeStart) calculateRoute([routeStart.lng, routeStart.lat], [pointData.lng, pointData.lat]);
        }
        setIsSelectingPoint(null);
        map._selectingPointMode = null;
      };
    }
  };

  // Pick POI / Room location on map
  const handlePickPoiLocation = () => {
    setIsSelectingPoint('poi');
    setFeedbackOpen(false); // Tạm ẩn form để người dùng thấy rõ bản đồ
    const map = mapInstanceRef.current;
    if (map) {
      map._selectingPointMode = 'poi';
      map._onPickPointCallback = (pickedMode, coords) => {
        setPoiData((prev) => ({
          ...prev,
          coords: [coords[0], coords[1]]
        }));

        if (poiMarkerRef.current) {
          poiMarkerRef.current.setLngLat([coords[0], coords[1]]);
        } else {
          poiMarkerRef.current = new maplibregl.Marker({ color: '#701818' })
            .setLngLat([coords[0], coords[1]])
            .addTo(map);
        }

        setIsSelectingPoint(null);
        map._selectingPointMode = null;
        setFeedbackOpen(true); // Mở lại form sau khi đã chấm xong vị trí
      };
    }
  };

  // Toggle 3D / 2D Visualization Mode
  const handleToggle3DMode = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const next3D = !is3DMode;
    setIs3DMode(next3D);

    if (map.getLayer('hustmap-3d-buildings')) {
      map.setLayoutProperty('hustmap-3d-buildings', 'visibility', next3D ? 'visible' : 'none');
    }

    if (next3D) {
      // Chuyển sang 3D: Mở khóa các cử chỉ chỉnh Pitch & Xoay góc
      map.dragRotate.enable();
      map.touchPitch.enable();
      if (map.touchZoomRotate) {
        map.touchZoomRotate.enableRotation();
      }

      // Nghiêng góc camera 60 độ, xoay nhẹ góc nhìn phối cảnh không gian
      map.easeTo({
        pitch: 60,
        bearing: -20,
        duration: 1000
      });
    } else {
      // Chuyển về 2D: Khóa hoàn toàn cử chỉ Pitch & Xoay (chỉ cho phép Pan & Zoom phẳng)
      map.dragRotate.disable();
      map.touchPitch.disable();
      if (map.touchZoomRotate) {
        map.touchZoomRotate.disableRotation();
      }

      // Nhìn thẳng đứng từ trên xuống (pitch: 0), quay về hướng Bắc (bearing: 0)
      map.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 1000
      });
    }
  };

  // Zoom to feature
  const handleZoomToFeature = (lng, lat) => {
    const map = mapInstanceRef.current;
    if (map && isFinite(lng) && isFinite(lat)) {
      setSearchModalOpen(false);
      setPopupOpen(false);
      map.flyTo({
        center: [lng, lat],
        zoom: 18.5,
        pitch: is3DMode ? 55 : 0,
        essential: true
      });
    }
  };

  // Search rooms in building
  const handleFindRooms = () => {
    if (floorNum || roomType) {
      setErrorMessage('');
      const params = new URLSearchParams();
      if (floorNum) params.append('floorNum', floorNum.toString());
      if (roomType && roomType !== 'all') params.append('type', roomType);
      params.append('offset', '0');

      setSelectedBuildingName(selectedFeature?.data?.name || '');

      let list = cachedRooms[selectedFeature.data.building_id] || [];
      if (floorNum && floorNum !== 100) {
        list = list.filter((r) => r.floor_num === floorNum);
      }
      if (roomType && roomType !== 'all') {
        list = list.filter((r) => r.type === roomType);
      }
      setRoomResults(list);
      setRoomModalOpen(true);
      setPopupOpen(false);
      setSearchModalOpen(false);
    } else {
      setErrorMessage(t('Không chọn tầng/loại phòng thì sao mà tìmmm!😭'));
    }
  };

  // GPS Trace Recording for Community Contributing
  const handleToggleRecordGPS = () => {
    if (isRecordingGPS) {
      setIsRecordingGPS(false);
      if (gpsWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
        gpsWatchIdRef.current = null;
      }
    } else {
      if (!('geolocation' in navigator)) {
        alert('Trình duyệt không hỗ trợ Geolocation/GPS!');
        return;
      }
      setIsRecordingGPS(true);
      const points = [];
      recordedTrackRef.current = points;
      setRecordedTrack(points);

      gpsWatchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const lng = Number(pos.coords.longitude.toFixed(6));
          const lat = Number(pos.coords.latitude.toFixed(6));
          const pt = [lng, lat];
          recordedTrackRef.current.push(pt);
          setRecordedTrack([...recordedTrackRef.current]);

          const map = mapInstanceRef.current;
          if (map && map.getSource('trace-source')) {
            map.getSource('trace-source').setData({
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: recordedTrackRef.current
              }
            });
          }
        },
        (err) => console.warn('GPS Logging error:', err),
        { enableHighAccuracy: true, maximumAge: 1000 }
      );
    }
  };

  const handleExportTrack = () => {
    if (!recordedTrack || recordedTrack.length === 0) return;
    const geojson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            name: 'HUST Campus User Track',
            timestamp: new Date().toISOString(),
            pointsCount: recordedTrack.length
          },
          geometry: {
            type: 'LineString',
            coordinates: recordedTrack
          }
        }
      ]
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hustmap-track-${Date.now()}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Send Feedback / Submit Contribution
  const handleSendFeedback = async () => {
    if (!feedbackDesc.trim() && !poiData.code && !feedbackFile && recordedTrack.length === 0) {
      setFeedbackError('Vui lòng nhập thông tin phòng/địa điểm, chụp ảnh hoặc ghi chú mô tả.');
      return;
    }
    setFeedbackSending(true);

    const contributionRecord = {
      id: Date.now(),
      description: feedbackDesc,
      contact: feedbackContact,
      hasPhoto: Boolean(feedbackFile),
      poi: poiData.code ? { ...poiData } : null,
      gpsPointsCount: recordedTrack.length,
      trackCoordinates: recordedTrack,
      createdAt: new Date().toISOString()
    };

    try {
      const existing = JSON.parse(localStorage.getItem('hustmap_contributions') || '[]');
      existing.push(contributionRecord);
      localStorage.setItem('hustmap_contributions', JSON.stringify(existing));
    } catch {}

    const fd = new FormData();
    fd.append('description', feedbackDesc);
    if (feedbackContact) fd.append('contact', feedbackContact);
    if (feedbackFile) fd.append('image', feedbackFile);
    if (poiData.code) fd.append('poi', JSON.stringify(poiData));
    if (recordedTrack.length > 0) {
      fd.append('gps_trace', JSON.stringify(recordedTrack));
    }

    try {
      await fetch(`${API_BASE}/feedback`, { method: 'POST', body: fd });
    } catch {
      // offline silent success
    } finally {
      alert(t('Đóng góp của bạn đã được lưu! Cảm ơn bạn.'));
      setFeedbackDesc('');
      setFeedbackContact('');
      setFeedbackFile(null);
      setFeedbackPhotoPreview(null);
      setPoiData({
        category: 'room',
        buildingId: '',
        floorNum: '',
        code: '',
        name: '',
        coords: null
      });
      if (poiMarkerRef.current) {
        poiMarkerRef.current.remove();
        poiMarkerRef.current = null;
      }
      setFeedbackOpen(false);
      setFeedbackSending(false);
    }
  };

  return (
    <div className="Homepage-container w-screen h-screen fixed inset-0 bg-[#FFFFFF]">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="Map-container w-full h-full bg-[#FFFFFF] z-1" />

      {/* Top Navigation & Controls */}
      <NavigationBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onExecuteSearch={handleExecuteSearch}
        routeModalOpen={routeModalOpen}
        onToggleRouteModal={() => {
          if (routeModalOpen) {
            handleClearRoute();
          } else {
            setRouteModalOpen(true);
          }
        }}
        lang={lang}
        onChangeLanguage={changeLanguage}
        t={t}
        onOpenOfflineModal={() => setOfflineModalOpen(true)}
        isOfflineReady={isOfflineReady}
        is3DMode={is3DMode}
        onToggle3DMode={handleToggle3DMode}
        onOpenGuideModal={() => setGuideModalOpen(true)}
        isNerdMode={isNerdMode}
        onToggleNerdMode={() => setIsNerdMode(!isNerdMode)}
      />

      {/* Building / Facility Popup */}
      <FeaturePopup
        selectedFeature={selectedFeature}
        popupOpen={popupOpen}
        floorNum={floorNum}
        setFloorNum={setFloorNum}
        roomType={roomType}
        setRoomType={setRoomType}
        errorMessage={errorMessage}
        onFindRooms={handleFindRooms}
        onStartRouteTo={handleStartRouteTo}
        t={t}
      />

      {/* Terms & Copyrights bar */}
      <div className="Info-container bg-white z-20 text-[8px] sm:text-[11px] absolute px-[10px] top-20 border right-0 [writing-mode:vertical-rl] rotate-180">
        <a
          href="/tos"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-black hover:text-blue-800"
        >
          Terms & Copyrights & Credits
        </a>
      </div>

      {/* Vietnamese Flag Ribbon */}
      <img
        src="/icon/coVN.png"
        alt="Viet Nam"
        width={270}
        height={80}
        className="absolute top-15 left-8 z-30 pointer-events-none"
      />

      {/* Point Picking Helper Banner */}
      {isSelectingPoint && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-[#203354] text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-3 border border-white/20 animate-bounce">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[14px] font-medium">
            {isSelectingPoint === 'poi'
              ? 'Nhấp chuột lên bản đồ để chọn Vị trí phòng / địa điểm đóng góp'
              : isSelectingPoint === 'start'
              ? 'Nhấp chuột lên bản đồ để chọn Điểm xuất phát'
              : 'Nhấp chuột lên bản đồ để chọn Điểm đến'}
          </span>
          <button
            onClick={() => {
              setIsSelectingPoint(null);
              if (mapInstanceRef.current) mapInstanceRef.current._selectingPointMode = null;
              if (isSelectingPoint === 'poi') setFeedbackOpen(true);
            }}
            className="ml-2 text-xs bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded cursor-pointer"
          >
            Hủy
          </button>
        </div>
      )}

      {/* Directions / Routing Panel (A* Engine) */}
      <RoutePanel
        open={routeModalOpen}
        routeStart={routeStart}
        routeEnd={routeEnd}
        routeResult={routeResult}
        isSelectingPoint={isSelectingPoint}
        onPickPoint={handlePickPointOnMap}
        onClose={handleClearRoute}
        buildings={cachedBuildings}
        onSelectPreset={(mode, item) => {
          const parts = String(item.coordinate).split(',').map((s) => s.trim());
          if (parts.length === 2) {
            const pointData = {
              name: item.name || item.display_name,
              lat: parseFloat(parts[0]),
              lng: parseFloat(parts[1])
            };
            if (mode === 'start') {
              setRouteStart(pointData);
              if (routeEnd) calculateRoute([pointData.lng, pointData.lat], [routeEnd.lng, routeEnd.lat]);
            } else {
              setRouteEnd(pointData);
              if (routeStart) calculateRoute([routeStart.lng, routeStart.lat], [pointData.lng, pointData.lat]);
            }
          }
        }}
        t={t}
      />

      {/* Search Modal Component */}
      <SearchModal
        open={searchModalOpen}
        searchTerm={searchTerm}
        onZoomToFeature={handleZoomToFeature}
        onStartRouteTo={handleStartRouteTo}
        cachedBuildings={cachedBuildings}
        cachedRooms={cachedRooms}
        cachedParkings={cachedParkings}
        t={t}
      />

      {/* Room Query Results Modal Component */}
      <RoomModal
        open={roomModalOpen}
        result={roomResults}
        buildingName={selectedBuildingName}
        t={t}
      />

      {/* Feedback Button */}
      <button
        className="fb-container text-white text-[10px] sm:text-[15px] absolute flex flex-row [writing-mode:vertical-rl] rotate-180 border-[#FFFFF] border-3 font-bold sm:font-semibold bottom-60 right-0 bg-[#701818] rounded-[6px] z-20 p-[5px] px-[10px] sm:px-[17px] cursor-pointer"
        onClick={() => setFeedbackOpen(true)}
      >
        <img
          src="/icon/fb.svg"
          alt="Feedback"
          width={15}
          height={15}
          className="fb-icon align-middle mb-[10px]"
        />
        F E E D B A C K
      </button>

      {/* Feedback & Contributing Popup Form */}
      <FeedbackModal
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        feedbackDesc={feedbackDesc}
        setFeedbackDesc={setFeedbackDesc}
        feedbackContact={feedbackContact}
        setFeedbackContact={setFeedbackContact}
        feedbackFile={feedbackFile}
        setFeedbackFile={setFeedbackFile}
        feedbackPhotoPreview={feedbackPhotoPreview}
        setFeedbackPhotoPreview={setFeedbackPhotoPreview}
        feedbackError={feedbackError}
        feedbackSending={feedbackSending}
        onSendFeedback={handleSendFeedback}
        isRecordingGPS={isRecordingGPS}
        onToggleRecordGPS={handleToggleRecordGPS}
        recordedTrack={recordedTrack}
        onExportTrack={handleExportTrack}
        poiData={poiData}
        setPoiData={setPoiData}
        onPickPoiLocation={handlePickPoiLocation}
        buildings={cachedBuildings}
        t={t}
      />

      {/* Offline Management Modal (Google Drive/Docs style) */}
      <OfflineModal
        isOpen={offlineModalOpen}
        onClose={() => {
          setOfflineModalOpen(false);
          checkOfflineStatus().then((res) => setIsOfflineReady(res.isReady));
        }}
      />

      {/* 3D & Gestures Guide Modal */}
      <GuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
      />

      {/* Nerd / Debug Stats Overlay */}
      <NerdOverlay
        isOpen={isNerdMode}
        onClose={() => setIsNerdMode(false)}
        map={mapInstanceRef.current}
        gpsData={gpsRawData}
      />

      {/* Initial Map Loading Splash */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#203354] z-50">
          <div className="text-white text-2xl font-bold animate-pulse">
            {t('waiting')}
          </div>
        </div>
      )}
    </div>
  );
}
