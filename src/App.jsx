import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { CampusRouter } from './router';

const API_BASE = '/api/v1';

// Translation dictionary extracted directly from hustmap.com + Navigation extensions
const translations = {
  vi: {
    "waiting": "Đang tải bản đồ...",
    "Số tầng": "Số tầng",
    "select floor": "select floor",
    "select room type": "select room type",
    "Tất cả": "Tất cả",
    "Loại phòng": "Loại phòng",
    "FIND": "FIND",
    "Tìm đường": "Chỉ đường",
    "Điểm xuất phát": "Điểm xuất phát (Từ)",
    "Điểm đến": "Điểm đến (Đến)",
    "Chọn điểm trên bản đồ": "Nhấp chọn trên bản đồ",
    "Vị trí của bạn": "Vị trí của bạn (GPS)",
    "Bắt đầu": "Bắt đầu tìm đường",
    "Xóa đường đi": "Đóng chỉ đường",
    "Khoảng cách": "Khoảng cách",
    "Thời gian đi bộ": "Thời gian đi bộ",
    "Không nhận gửi qua đêm": "Không nhận gửi qua đêm",
    "Chỉ dành cho sv, cbnv nhà trường": "Chỉ dành cho sv, cbnv nhà trường",
    "Sau 18:00:": "Sau 18:00:",
    "2k: thẻ sv": "2k: thẻ sv",
    "4k: không thẻ sv": "4k: không thẻ sv",
    "3k: không thẻ sv": "3k: không thẻ sv",
    "Qua đêm": "Qua đêm",
    "Dành cho: xe máy": "Dành cho: xe máy",
    "Dành cho: ô tô": "Dành cho: ô tô",
    "Chờ 1 xíuu....": "Chờ 1 xíuu....",
    "Không tìm thấy kết quả nào": "Không tìm thấy kết quả nào",
    "SDT": "SDT",
    "Quay trở lại bản đồ": "Quay trở lại bản đồ",
    "Không chọn tầng/loại phòng thì sao mà tìmmm!😭": "Không chọn tầng/loại phòng thì sao mà tìmmm!😭",
    "Lỗi khi tải kết quả.": "Lỗi khi tải kết quả.",
    "Nghiên cứu, thí nghiệm": "Nghiên cứu, thí nghiệm",
    "Phòng học": "Phòng học",
    "Văn phòng": "Văn phòng",
    "Tự học": "Tự học",
    "Góc góp ý thay đổi": "Đóng góp dữ liệu & Phản ánh",
    "Mô tả chi tiết": "Mô tả chi tiết (Tên đường/phòng mới, lỗi bản đồ...)",
    "Thêm ảnh mô tả": "Chụp ảnh / Tải ảnh minh chứng",
    "Ghi lại lộ trình di chuyển (GPS Trace)": "Ghi lại lộ trình di chuyển (GPS Trace)",
    "Đang ghi lộ trình...": "Đang ghi nhận tọa độ di chuyển...",
    "Bắt đầu ghi GPS": "Bắt đầu ghi GPS",
    "Dừng ghi GPS": "Dừng ghi GPS",
    "Đã ghi được": "Đã ghi được",
    "điểm tọa độ": "điểm tọa độ",
    "Tải file GPX/GeoJSON": "Tải file lộ trình (.geojson)",
    "Đóng góp của bạn đã được lưu! Cảm ơn bạn.": "Đóng góp của bạn đã được ghi nhận! Cảm ơn bạn.",
    "Phương thức liên lạc (email/fb/zalo)": "Phương thức liên lạc (email/fb/zalo)",
    "contact note": "chúng tôi cam kết bảo mật thông tin liên lạc của bạn",
    "GỬI": "GỬI ĐÓNG GÓP",
    "Định vị": "Định vị",
    "Kết quả tìm kiếm": "Kết quả tìm kiếm",
    "Đang gửi": "Đang gửi",
    "Hết": "Hết"
  },
  en: {
    "waiting": "Map is loading...Hold on!",
    "Số tầng": "Floor num",
    "select floor": "select floor",
    "select room type": "select room type",
    "Tất cả": "All",
    "Loại phòng": "Room type",
    "FIND": "FIND",
    "Tìm đường": "Directions",
    "Điểm xuất phát": "Starting point (From)",
    "Điểm đến": "Destination (To)",
    "Chọn điểm trên bản đồ": "Click on map",
    "Vị trí của bạn": "Your location (GPS)",
    "Bắt đầu": "Start routing",
    "Xóa đường đi": "Clear route",
    "Khoảng cách": "Distance",
    "Thời gian đi bộ": "Walking time",
    "Không nhận gửi qua đêm": "No overnight parking",
    "Chỉ dành cho sv, cbnv nhà trường": "Only for students and staff",
    "Sau 18:00:": "After 6:00 PM:",
    "2k: thẻ sv": "2.000₫: with student card",
    "4k: không thẻ sv": "4.000₫: without student card",
    "3k: không thẻ sv": "3.000₫: without student card",
    "Qua đêm": "Overnight: ",
    "Dành cho: xe máy": "For motorbike",
    "Dành cho: ô tô": "For car",
    "Chờ 1 xíuu....": "Please wait a moment...",
    "Không tìm thấy kết quả nào": "No results found",
    "SDT": "Tel",
    "Quay trở lại bản đồ": "Back to map",
    "Không chọn tầng/loại phòng thì sao mà tìmmm!😭": "You need to select a floor or room type to search! 😭",
    "Lỗi khi tải kết quả.": "Error while loading result",
    "Nghiên cứu, thí nghiệm": "Research, Laboratory",
    "Phòng học": "Lecture",
    "Văn phòng": "Office",
    "Tự học": "Self-study",
    "Khác": "Other",
    "Góc góp ý thay đổi": "Contribute Data & Feedback",
    "Mô tả chi tiết": "Detailed description (New road/room name, map bug...)",
    "Thêm ảnh mô tả": "Take photo / Upload evidence",
    "Ghi lại lộ trình di chuyển (GPS Trace)": "Record GPS Movement Trace",
    "Đang ghi lộ trình...": "Recording movement coordinates...",
    "Bắt đầu ghi GPS": "Start GPS Track",
    "Dừng ghi GPS": "Stop GPS Track",
    "Đã ghi được": "Recorded",
    "điểm tọa độ": "track points",
    "Tải file GPX/GeoJSON": "Download trace (.geojson)",
    "Đóng góp của bạn đã được lưu! Cảm ơn bạn.": "Your contribution has been recorded! Thank you.",
    "Phương thức liên lạc (email/fb/zalo)": "Contact method (email/fb/zalo)",
    "contact note": "Only used if the HUSTMAP team needs to clarify or discuss your feedback further",
    "GỬI": "SUBMIT CONTRIBUTION",
    "Định vị": "Locate",
    "Kết quả tìm kiếm": "Search result",
    "Đang gửi": "Sending",
    "Hết": "End"
  }
};

// Global cache for 100% offline standalone resilience
let cachedBuildings = [];
let cachedParkings = [];
let cachedRooms = {};

export default function App() {
  const [lang, setLang] = useState('vi');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchModalOpen, setSearchModalOpen] = useState(false);

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

  // Routing / Directions state (A* Engine from hustmapfinal)
  const [routeModalOpen, setRouteModalOpen] = useState(false);
  const [routeStart, setRouteStart] = useState(null); // { name, lng, lat }
  const [routeEnd, setRouteEnd] = useState(null); // { name, lng, lat }
  const [routeResult, setRouteResult] = useState(null); // { distanceM, timeMins }
  const [isSelectingPoint, setIsSelectingPoint] = useState(null); // 'start' | 'end' | null

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
  const [recordedTrack, setRecordedTrack] = useState([]); // array of [lng, lat, timestamp]
  const gpsWatchIdRef = useRef(null);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const userLocationRef = useRef(null);
  const routerRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const recordedTrackRef = useRef([]);

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

      // Add route GeoJSON source and polyline layer
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
            'line-color': '#F59E0B', // Vibrant Amber/Orange for recorded trace
            'line-width': 5,
            'line-opacity': 0.85
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
      // Default to C1 cổng Parabol
      startPoint = {
        name: 'Cổng Parabol - C1',
        lng: 105.843148,
        lat: 21.007049
      };
    }
    setRouteStart(startPoint);
    setRouteModalOpen(true);

    // Calculate immediately
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

  // Zoom to feature
  const handleZoomToFeature = (lng, lat) => {
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo({
        center: [105.845388, 21.005007],
        zoom: 16,
        essential: true
      });
      setSearchModalOpen(false);
      map.once('idle', () => {
        map.flyTo({
          center: [lng, lat],
          zoom: 19,
          essential: true
        });
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
      // Stop recording
      setIsRecordingGPS(false);
      if (gpsWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
        gpsWatchIdRef.current = null;
      }
    } else {
      // Start recording
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

          // Live update on map trace layer
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
    if (!feedbackDesc.trim()) {
      setFeedbackError(t('Mô tả chi tiết'));
      return;
    }
    setFeedbackSending(true);

    const contributionRecord = {
      id: Date.now(),
      description: feedbackDesc,
      contact: feedbackContact,
      hasPhoto: Boolean(feedbackFile),
      gpsPointsCount: recordedTrack.length,
      trackCoordinates: recordedTrack,
      createdAt: new Date().toISOString()
    };

    // Store locally in localStorage for persistent contributing logs
    try {
      const existing = JSON.parse(localStorage.getItem('hustmap_contributions') || '[]');
      existing.push(contributionRecord);
      localStorage.setItem('hustmap_contributions', JSON.stringify(existing));
    } catch {}

    const fd = new FormData();
    fd.append('description', feedbackDesc);
    if (feedbackContact) fd.append('contact', feedbackContact);
    if (feedbackFile) fd.append('image', feedbackFile);
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
      setFeedbackOpen(false);
      setFeedbackSending(false);
    }
  };

  return (
    <div className="Homepage-container w-screen h-screen fixed inset-0 bg-[#FFFFFF]">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="Map-container w-full h-full bg-[#FFFFFF] z-1" />

      {/* Language Switcher Buttons */}
      <div className="absolute top-20 sm:top-6 right-6 z-30 flex">
        <button
          onClick={() => changeLanguage('en')}
          className={`px-[8px] rounded font-bold transition ${
            lang === 'en' ? 'bg-[#5D92EB]' : 'bg-transparent'
          }`}
        >
          <img
            src="/icon/eng.svg"
            alt="ENG"
            width={25}
            height={25}
            className="fb-icon align-middle"
          />
        </button>
        <button
          onClick={() => changeLanguage('vi')}
          className={`px-[8px] rounded font-bold transition ${
            lang === 'vi' ? 'bg-red-100' : 'bg-transparent'
          }`}
        >
          <img
            src="/icon/VN.svg"
            alt="VN"
            width={25}
            height={25}
            className="fb-icon align-middle"
          />
        </button>
      </div>

      {/* Search Bar & Route Button */}
      <div className="absolute top-6 left-6 z-20 flex gap-2 items-center">
        <div className="search-container flex flex-row max-w-[80vw] sm:w-[320px] w-[75vw] border bg-[#F8EFCE] px-4 py-2 rounded-[8px] shadow-xl/30">
          <input
            type="text"
            className="text-container flex-1 bg-transparent outline-none w-full/0.99 text-[15px]"
            placeholder="Tìm kiếm tòa nhà, phòng học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleExecuteSearch();
            }}
          />
          <img
            src="/icon/search.svg"
            alt="search"
            width={20}
            height={20}
            className="search-icon h-[20px] cursor-pointer"
            onClick={handleExecuteSearch}
          />
        </div>

        {/* Route / Navigation Button */}
        <button
          onClick={() => {
            if (routeModalOpen) {
              handleClearRoute();
            } else {
              setRouteModalOpen(true);
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-[8px] border shadow-xl/30 font-semibold text-[14px] transition cursor-pointer ${
            routeModalOpen
              ? 'bg-[#EF4444] text-white border-[#DC2626]'
              : 'bg-[#203354] text-white border-[#1B2B46] hover:bg-[#2A436D]'
          }`}
          title={t('Tìm đường')}
        >
          <img
            src="/icon/navigation.svg"
            alt="Route"
            width={18}
            height={18}
            className="brightness-200 invert"
          />
          <span className="hidden sm:inline">{routeModalOpen ? t('Xóa đường đi') : t('Tìm đường')}</span>
        </button>
      </div>

      {/* Building / Facility Popup */}
      {selectedFeature && popupOpen && (
        <>
          {/* UNI_BUILDING */}
          {selectedFeature.type === 'uni_building' && selectedFeature.data.type === 'UNI_BUILDING' && (
            <div className="Popup-container absolute bottom-28 left-3 sm:top-20 sm:bottom-auto sm:left-6 bg-[#FDFFF5] border rounded-xl shadow-lg p-6 z-10 w-75 sm:w-115 pt-2 sm:pt-6">
              <div className="text-[25px] sm:text-[23px] font-semibold sm:mb-5 flex items-center justify-between">
                <span>{selectedFeature.data.name}</span>
                {selectedFeature.data.coordinate && (
                  <button
                    className="text-[12px] sm:text-[14px] flex items-center gap-1 bg-[#203354] text-white px-2.5 py-1 rounded-[6px] hover:bg-[#2A436D] transition cursor-pointer"
                    onClick={() => {
                      const parts = String(selectedFeature.data.coordinate).split(',').map((s) => s.trim());
                      if (parts.length === 2) {
                        handleStartRouteTo({
                          name: selectedFeature.data.name,
                          lat: parseFloat(parts[0]),
                          lng: parseFloat(parts[1])
                        });
                      }
                    }}
                  >
                    <img src="/icon/navigation.svg" alt="Route" width={14} height={14} className="brightness-200 invert" />
                    <span>{t('Tìm đường')}</span>
                  </button>
                )}
              </div>
              <div className="PopupChild-container flex justify-center gap-x-5">
                <div className="leftGrandChild basis-[60%] sm:basis-[70%] mt-[10px] sm:mt-[0px]">
                  <img
                    src={selectedFeature.data.image}
                    alt={selectedFeature.data.name}
                    width={292}
                    height={181}
                    className="imgStyle w-full rounded-xl"
                  />
                </div>
                <div className="rightGrandChild text-[15px] font-medium basis-[40%] sm:basis-[30%] flex flex-col items-center">
                  <div className="text-[17px] sm:text-[20px]">{t('Số tầng')}</div>
                  <select
                    className="selectBox text-[13px] sm:text-[15px] font-light w-full px-2 py-1 bg-[#203354] text-white font-light focus:outline-none"
                    value={floorNum}
                    onChange={(e) => setFloorNum(Number(e.target.value))}
                  >
                    <option value="">{t('select floor')}</option>
                    {Array.from({ length: selectedFeature.data.total_floor || 1 }, (_, i) => i + 1).map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                    <option value={100}>{t('Tất cả')}</option>
                  </select>

                  <div className="text-[16px] sm:text-[20px] mt-1">{t('Loại phòng')}</div>
                  <select
                    className="selectBox text-[13px] sm:text-[15px] font-light w-full px-2 py-1 bg-[#203354] text-white font-light focus:outline-none"
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                  >
                    <option value="">{t('select room type')}</option>
                    <option value="LAB">{t('Nghiên cứu, thí nghiệm')}</option>
                    <option value="LECTURE">{t('Phòng học')}</option>
                    <option value="OFFICE">{t('Văn phòng')}</option>
                    <option value="SELF_STUDY">{t('Tự học')}</option>
                    <option value="OTHER">{t('Khác')}</option>
                    <option value="all">{t('Tất cả')}</option>
                  </select>

                  <button
                    className="findButton text-[15px] sm:text-[18px] shadow-xl/30 hover:bg-[#FFEA9F] transition mt-[10px] px-[27px] border font-semibold rounded-[6px] bg-[#F8EFCE]"
                    onClick={handleFindRooms}
                  >
                    {t('FIND')}
                  </button>
                </div>
              </div>
              {errorMessage && (
                <div className="text-[#C00B0B] text-right font-medium text-[14px] mt-[10px]">
                  {errorMessage}
                </div>
              )}
            </div>
          )}

          {/* UNI_OTHER_BUILDING */}
          {selectedFeature.type === 'uni_other_building' && selectedFeature.data.type === 'UNI_OTHER_BUILDING' && (
            <div className="Popup-container absolute bottom-28 left-3 sm:top-20 sm:bottom-auto sm:left-6 bg-[#FDFFF5] border rounded-xl shadow-lg z-10 w-55 sm:w-96 pt-2 sm:pt-6">
              <div className="Building-name px-[20px] text-[18px] sm:text-[25px] font-semibold flex items-center justify-between mb-[5px] sm:mb-[10px]">
                <span>{selectedFeature.data.name}</span>
                {selectedFeature.data.coordinate && (
                  <button
                    className="text-[12px] sm:text-[14px] flex items-center gap-1 bg-[#203354] text-white px-2.5 py-1 rounded-[6px] hover:bg-[#2A436D] transition cursor-pointer"
                    onClick={() => {
                      const parts = String(selectedFeature.data.coordinate).split(',').map((s) => s.trim());
                      if (parts.length === 2) {
                        handleStartRouteTo({
                          name: selectedFeature.data.name,
                          lat: parseFloat(parts[0]),
                          lng: parseFloat(parts[1])
                        });
                      }
                    }}
                  >
                    <img src="/icon/navigation.svg" alt="Route" width={14} height={14} className="brightness-200 invert" />
                    <span>{t('Tìm đường')}</span>
                  </button>
                )}
              </div>
              <div className="w-full aspect-video overflow-hidden">
                <img
                  src={selectedFeature.data.image}
                  alt={selectedFeature.data.name}
                  width={487}
                  height={281}
                  className="w-full h-full object-cover rounded-[6px]"
                />
              </div>
            </div>
          )}

          {/* UNI_CAR_PARKING */}
          {selectedFeature.type === 'uni_car_parking' && (
            <div className="Popup-container absolute bottom-28 left-3 sm:top-20 sm:bottom-auto sm:left-6 bg-[#FDFFF5] border p-[5px] rounded-xl shadow-lg z-10 w-70 sm:w-96 sm:p-6">
              <div className="Parking-name px-[20px] text-[20px] sm:text-[25px] font-semibold flex items-center justify-center mb-[6px] sm:mb-[10px]">
                {selectedFeature.data.name}
              </div>
              <div className="Info-container text-[18px] sm:text-[20px] font-medium space-y-1 sm:space-y-2">
                <div>{t('Dành cho: ô tô')}</div>
                <div className="Time-container flex flex-row items-center">
                  <img src="/icon/time.svg" alt="Giờ mở cửa" width={30} height={30} className="w-[30px] mr-[8px]" />
                  <div className="open_hour-content pt-[8px]">{selectedFeature.data.open_hour}</div>
                </div>
                <div className="Price-container flex flex-row">
                  <div>
                    <img src="/icon/price.svg" alt="Giá" width={32} height={32} className="w-[32px] mr-[8px]" />
                  </div>
                  <div className="price-content-container pt-[8px]">
                    <div className="font-bold underline">free</div>
                  </div>
                </div>
                <div className="Note-container">
                  <ul className="ml-[10px]">
                    <li>
                      <span className="text-[#C00B0B] font-bold">! </span>
                      {t('Không nhận gửi qua đêm')}
                    </li>
                    <li>
                      <span className="text-[#C00B0B] font-bold">! </span>
                      {t('Chỉ dành cho sv, cbnv nhà trường')}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* UNI_MOTOR_PARKING */}
          {selectedFeature.type === 'uni_motor_parking' && (
            <div className="Popup-container-motor absolute bottom-28 left-3 sm:top-20 sm:bottom-auto sm:left-6 bg-[#FDFFF5] border p-[5px] rounded-xl shadow-lg z-10 w-70 sm:w-96 sm:p-6">
              <div className="Parking-name text-[20px] sm:text-[25px] font-semibold flex items-center justify-center mb-[6px] sm:mb-[10px]">
                {selectedFeature.data.name}
              </div>
              <div className="Info-container text-[18px] sm:text-[20px] font-medium space-y-1 sm:space-y-2">
                <div>{t('Dành cho: xe máy')}</div>
                <div className="Time-container flex flex-row items-center">
                  <img src="/icon/time.svg" alt="Giờ mở cửa" width={40} height={40} className="w-[40px] mr-[8px]" />
                  <div className="open_hour-content pt-[8px]">{selectedFeature.data.open_hour}</div>
                </div>
                <div className="Price-container flex flex-row">
                  <div>
                    <img src="/icon/price.svg" alt="Giá" width={40} height={40} className="w-[40px] mr-[8px]" />
                  </div>
                  <div className="price-content-container pt-[8px]">
                    <div className="font-bold underline"> 6:00 - 18:00:</div>
                    <ul className="list-disc pl-[40px]">
                      <li>{t('2k: thẻ sv')}</li>
                      <li>{t('3k: không thẻ sv')}</li>
                    </ul>
                    <div className="font-bold underline">{t('Sau 18:00:')}</div>
                    <ul className="list-disc pl-[40px]">
                      <li>{t('2k: thẻ sv')}</li>
                      <li>{t('4k: không thẻ sv')}</li>
                    </ul>
                    <div>
                      <span className="font-bold underline">{t('Qua đêm')}</span> 20.000₫-30.000₫
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

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
            {isSelectingPoint === 'start'
              ? 'Nhấp chuột lên bản đồ để chọn Điểm xuất phát'
              : 'Nhấp chuột lên bản đồ để chọn Điểm đến'}
          </span>
          <button
            onClick={() => {
              setIsSelectingPoint(null);
              if (mapInstanceRef.current) mapInstanceRef.current._selectingPointMode = null;
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
        t={t}
      />

      {/* Room Query Results Modal Component */}
      <RoomModal
        open={roomModalOpen}
        result={roomResults}
        buildingName={selectedBuildingName}
        onZoomToFeature={handleZoomToFeature}
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

      {/* Feedback Popup Form */}
      {feedbackOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setFeedbackOpen(false)}
          />
          <div className="popup-container z-30 absolute bg-[#FDFFF5]/90 flex items-center justify-center rounded-[6px] shadow-xl">
            <button
              className="absolute top-0 right-2 text-[30px] font-bold"
              onClick={() => setFeedbackOpen(false)}
            >
              ×
            </button>
            <div className="popup-content p-[20px] text-[15px] font-semibold flex flex-col max-h-[85vh] overflow-y-auto w-[92vw] sm:w-[460px]">
              <div className="tittle text-[22px] sm:text-[25px] text-[#203354] mb-2">{t('Góc góp ý thay đổi')}</div>

              {/* GPS Movement Logger Section */}
              <div className="gps-section mb-4 p-3 bg-[#EBF3FE] border border-[#BFDBFE] rounded-xl">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-[#1E3A8A] font-bold text-[13px] sm:text-[14px]">
                    <span className="text-base">📍</span>
                    {t('Ghi lại lộ trình di chuyển (GPS Trace)')}
                  </div>
                  {isRecordingGPS && (
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-600 mb-2 font-normal">
                  Bật ghi GPS khi bạn đi bộ trên tuyến đường mới trong trường. Tọa độ thực tế sẽ được thu thập trực tiếp để nắn chuẩn bản đồ.
                </p>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleToggleRecordGPS}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isRecordingGPS
                        ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
                        : 'bg-[#203354] text-white hover:bg-[#2A436D]'
                    }`}
                  >
                    {isRecordingGPS ? t('Dừng ghi GPS') : t('Bắt đầu ghi GPS')}
                  </button>

                  <div className="text-xs text-gray-700 font-medium">
                    {t('Đã ghi được')}: <span className="font-bold text-blue-700">{recordedTrack.length}</span> {t('điểm tọa độ')}
                  </div>

                  {recordedTrack.length > 0 && (
                    <button
                      type="button"
                      onClick={handleExportTrack}
                      className="ml-auto text-[11px] bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-2 py-1 rounded-md font-medium cursor-pointer"
                      title="Tải file GeoJSON lưu trữ"
                    >
                      💾 {t('Tải file GPX/GeoJSON')}
                    </button>
                  )}
                </div>
              </div>

              <div className="description-section">
                <div className="text-xs font-semibold text-gray-600 mb-1">{t('Mô tả chi tiết')}</div>
                <textarea
                  className="w-full border rounded-lg p-2 mb-2 text-[13px] bg-white outline-none focus:border-blue-500"
                  rows={3}
                  placeholder="Ví dụ: Lối đi bộ giữa D3 và C10 mới mở thêm; hoặc phòng 302-D9 đổi thành phòng thí nghiệm AI..."
                  value={feedbackDesc}
                  onChange={(e) => setFeedbackDesc(e.target.value)}
                />
                {feedbackError && (
                  <div className="text-[#C00B0B] font-medium text-[13px] my-[3px]">
                    {feedbackError}
                  </div>
                )}
              </div>

              {/* Photo Upload & Camera Section */}
              <div className="image-section mb-3">
                <div className="text-xs font-semibold text-gray-600 mb-1">{t('Thêm ảnh mô tả')}</div>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="bg-white border rounded-lg p-1.5 text-[12px] flex-1 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setFeedbackFile(file);
                      if (file) {
                        setFeedbackPhotoPreview(URL.createObjectURL(file));
                      } else {
                        setFeedbackPhotoPreview(null);
                      }
                    }}
                  />
                  {feedbackPhotoPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setFeedbackFile(null);
                        setFeedbackPhotoPreview(null);
                      }}
                      className="text-xs text-red-600 hover:underline cursor-pointer"
                    >
                      Xóa ảnh
                    </button>
                  )}
                </div>

                {/* Photo Preview Thumbnail */}
                {feedbackPhotoPreview && (
                  <div className="mt-2 relative w-24 h-24 rounded-lg overflow-hidden border shadow-sm">
                    <img
                      src={feedbackPhotoPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="contact-section mb-3">
                <div className="text-xs font-semibold text-gray-600 mb-0.5">{t('Phương thức liên lạc (email/fb/zalo)')}</div>
                <div className="text-[10px] text-gray-400 mb-1">{t('contact note')}</div>
                <input
                  type="text"
                  className="w-full border rounded-lg p-2 text-[13px] bg-white outline-none focus:border-blue-500"
                  placeholder="name@gmail.com / SĐT / Link Facebook"
                  value={feedbackContact}
                  onChange={(e) => setFeedbackContact(e.target.value)}
                />
              </div>

              <button
                className="w-full bg-[#203354] hover:bg-[#2A436D] text-white font-bold py-2.5 rounded-lg transition shadow-md cursor-pointer"
                onClick={handleSendFeedback}
              >
                {feedbackSending ? t('Đang gửi') : t('GỬI')}
              </button>
            </div>
          </div>
        </div>
      )}

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

// Search Modal component with local standalone search fallback
function SearchModal({ open, searchTerm, onZoomToFeature, onStartRouteTo, t }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      const matches = [];

      // Search buildings
      (cachedBuildings || []).forEach((b) => {
        if (
          b.name.toLowerCase().includes(term) ||
          (b.display_name && b.display_name.toLowerCase().includes(term))
        ) {
          matches.push(b);
        }
      });

      // Search rooms
      Object.values(cachedRooms || {}).forEach((roomsArr) => {
        roomsArr.forEach((r) => {
          if (
            (r.room_code && r.room_code.toLowerCase().includes(term)) ||
            (r.name_big && r.name_big.toLowerCase().includes(term)) ||
            (r.name_small && r.name_small.toLowerCase().includes(term))
          ) {
            matches.push(r);
          }
        });
      });

      // Search parkings
      (cachedParkings || []).forEach((p) => {
        if (p.name.toLowerCase().includes(term)) {
          matches.push(p);
        }
      });

      setResults(matches);
      setLoading(false);
    }
  }, [open, searchTerm]);

  if (!open || !searchTerm) return null;

  return (
    <div className="Popup-container absolute top-24 left-3 sm:top-20 sm:bottom-auto sm:left-6 bg-[#FDFFF5] border rounded-xl shadow-lg z-10 w-[90vw] sm:w-55 sm:w-96 pt-2 sm:pt-6 max-h-[30vh] sm:max-h-[70vh] overflow-y-auto">
      <div className="Building-name px-[20px] text-[15px] sm:text-[25px] font-semibold flex items-center justify-center m-[5px] sm:mb-[10px]">
        {t('Kết quả tìm kiếm')}
      </div>
      {loading ? (
        <div className="text-center mt-[20px] text-main-blue font-bold animate-pulse">
          Đang tải
        </div>
      ) : Array.isArray(results) && results.length === 0 ? (
        <div className="text-center">{t('Không tìm thấy kết quả nào')}</div>
      ) : Array.isArray(results) ? (
        <div className="result-content flex flex-col pb-[10px] px-[18px]">
          {results.map((item, idx) => (
            <div
              key={idx}
              className="room-content border-b flex flex-row gap-x-[20px] mt-[10px] space-y-[10px] sm:mt-[20px]"
            >
              {item.room_id ? (
                <>
                  <div className="left-col flex flex-col text-left flex-1">
                    {item.name_small && (
                      <div className="name-small font-light mb-[5px] text-[8px] sm:text-[11px]">
                        {item.name_small}
                      </div>
                    )}
                    <div className="name-big font-medium text-[10px] sm:text-[14px]">
                      {item.name_big}
                    </div>
                  </div>
                  <div className="right-col flex flex-col text-right">
                    <div className="room-code text-[12px] sm:text-[14px] font-semibold">
                      {item.room_code}
                    </div>
                    {(item.phone_num || item.website || item.email) && (
                      <div className="contact flex gap-2 text-[13px] underline mt-[5px] hover:text-main-cream transition">
                        {item.phone_num && <a href={`tel:${item.phone_num}`}>{t('SDT')}</a>}
                        {item.website && (
                          <a
                            href={
                              item.website.startsWith('http')
                                ? item.website
                                : `https://${item.website}`
                            }
                            target="_blank"
                            rel="noreferrer"
                          >
                            Web
                          </a>
                        )}
                        {item.email && <a href={`mailto:${item.email}`}>Email</a>}
                      </div>
                    )}
                  </div>
                </>
              ) : item.coordinate ? (
                <div className="flex-1 flex justify-between items-center py-2 gap-2">
                  <div className="font-semibold text-[14px]">{item.name || item.display_name}</div>
                  <div className="flex items-center gap-3">
                    <button
                      className="flex underline font-light text-[10px] sm:text-[13px] cursor-pointer text-gray-700 hover:text-blue-700"
                      onClick={() => {
                        const parts = String(item.coordinate).split(',').map((s) => s.trim());
                        if (parts.length === 2) {
                          const lat = parseFloat(parts[0]);
                          const lng = parseFloat(parts[1]);
                          if (isFinite(lat) && isFinite(lng)) {
                            onZoomToFeature(lng, lat);
                          }
                        }
                      }}
                    >
                      <img
                        src="/icon/navigation.svg"
                        alt="Định vị"
                        width={16}
                        height={16}
                        className="mr-[4px]"
                      />
                      {t('Định vị')}
                    </button>
                    {onStartRouteTo && (
                      <button
                        className="flex items-center gap-1 bg-[#203354] text-white text-[11px] px-2 py-0.5 rounded cursor-pointer hover:bg-[#2A436D]"
                        onClick={() => {
                          const parts = String(item.coordinate).split(',').map((s) => s.trim());
                          if (parts.length === 2) {
                            const lat = parseFloat(parts[0]);
                            const lng = parseFloat(parts[1]);
                            if (isFinite(lat) && isFinite(lng)) {
                              onStartRouteTo({
                                name: item.name || item.display_name,
                                lat,
                                lng
                              });
                            }
                          }
                        }}
                      >
                        {t('Tìm đường')}
                      </button>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// Room query modal
function RoomModal({ open, result, buildingName, onZoomToFeature, t }) {
  if (!open) return null;

  return (
    <div className="Popup-container absolute bottom-28 left-3 sm:top-20 sm:bottom-auto sm:left-6 bg-[#FDFFF5] border rounded-xl shadow-lg z-10 w-[90vw] sm:w-55 sm:w-96 pt-2 sm:pt-6 max-h-[40vh] sm:max-h-[70vh] overflow-y-auto">
      <div className="Building-name px-[20px] text-[20px] sm:text-[25px] font-semibold flex items-center justify-center m-[5px] sm:mb-[10px]">
        {buildingName}
      </div>
      {Array.isArray(result) && result.length === 0 ? (
        <div className="text-center">{t('Không tìm thấy kết quả nào')}</div>
      ) : Array.isArray(result) ? (
        <div className="result-content flex flex-col pb-[10px] px-[18px]">
          {result.map((room, idx) => (
            <div
              key={idx}
              className="room-content border-b flex flex-row gap-x-[20px] mt-[10px] space-y-[10px] sm:mt-[20px]"
            >
              {room.room_id && (
                <>
                  <div className="left-col flex flex-col text-left flex-1">
                    {room.name_small && (
                      <div className="name-small font-light mb-[5px] text-[8px] sm:text-[11px]">
                        {room.name_small}
                      </div>
                    )}
                    <div className="name-big font-medium text-[10px] sm:text-[14px]">
                      {room.name_big}
                    </div>
                  </div>
                  <div className="right-col flex flex-col text-right">
                    <div className="room-code text-[12px] sm:text-[14px] font-semibold">
                      {room.room_code}
                    </div>
                    {(room.phone_num || room.website || room.email) && (
                      <div className="contact flex gap-2 text-[13px] underline mt-[5px] hover:text-main-cream transition">
                        {room.phone_num && <a href={`tel:${room.phone_num}`}>{t('SDT')}</a>}
                        {room.website && (
                          <a
                            href={
                              room.website.startsWith('http')
                                ? room.website
                                : `https://${room.website}`
                            }
                            target="_blank"
                            rel="noreferrer"
                          >
                            Web
                          </a>
                        )}
                        {room.email && <a href={`mailto:${room.email}`}>Email</a>}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
          <div className="Building-name px-[20px] text-[15px] sm:text-[25px] font-semibold flex items-center justify-center m-[5px] sm:mb-[10px]">
            {t('Hết')}
          </div>
        </div>
      ) : (
        <div className="text-white text-center">{t('Lỗi khi tải kết quả.')}</div>
      )}
    </div>
  );
}

// Directions / Route Panel Component (A* Graph Engine)
function RoutePanel({
  open,
  routeStart,
  routeEnd,
  routeResult,
  isSelectingPoint,
  onPickPoint,
  onClose,
  buildings,
  onSelectPreset,
  t
}) {
  const [showPresets, setShowPresets] = useState(null); // 'start' | 'end' | null
  const [filterText, setFilterText] = useState('');

  if (!open) return null;

  const filteredBuildings = (buildings || []).filter((b) =>
    (b.name || '').toLowerCase().includes(filterText.toLowerCase()) ||
    (b.display_name || '').toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="Route-panel absolute top-20 left-3 sm:left-6 z-30 bg-[#FDFFF5] border rounded-2xl shadow-2xl p-4 sm:p-5 w-[92vw] sm:w-[360px] text-gray-800">
      <div className="flex items-center justify-between pb-3 border-b">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-600" />
          <h2 className="font-bold text-[18px] text-[#203354]">{t('Tìm đường')}</h2>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 text-[22px] leading-none font-bold cursor-pointer"
        >
          ×
        </button>
      </div>

      {/* Inputs Form */}
      <div className="mt-4 space-y-3 relative">
        {/* Start Point */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
            {t('Điểm xuất phát')}
          </label>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
            <div className="flex-1 bg-white border rounded-lg px-2.5 py-1.5 text-sm font-medium truncate">
              {routeStart ? routeStart.name : 'Chưa chọn'}
            </div>
            <button
              onClick={() => {
                setShowPresets(showPresets === 'start' ? null : 'start');
                setFilterText('');
              }}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1.5 rounded-lg border font-medium cursor-pointer"
              title="Chọn từ danh sách tòa nhà"
            >
              Chọn
            </button>
            <button
              onClick={() => onPickPoint('start')}
              className={`text-xs px-2 py-1.5 rounded-lg border font-medium cursor-pointer ${
                isSelectingPoint === 'start'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
              title="Nhấp chọn vị trí trên bản đồ"
            >
              Bản đồ
            </button>
          </div>
        </div>

        {/* End Point */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
            {t('Điểm đến')}
          </label>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
            <div className="flex-1 bg-white border rounded-lg px-2.5 py-1.5 text-sm font-medium truncate">
              {routeEnd ? routeEnd.name : 'Chưa chọn'}
            </div>
            <button
              onClick={() => {
                setShowPresets(showPresets === 'end' ? null : 'end');
                setFilterText('');
              }}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1.5 rounded-lg border font-medium cursor-pointer"
              title="Chọn từ danh sách tòa nhà"
            >
              Chọn
            </button>
            <button
              onClick={() => onPickPoint('end')}
              className={`text-xs px-2 py-1.5 rounded-lg border font-medium cursor-pointer ${
                isSelectingPoint === 'end'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
              title="Nhấp chọn vị trí trên bản đồ"
            >
              Bản đồ
            </button>
          </div>
        </div>

        {/* Building Selector Dropdown */}
        {showPresets && (
          <div className="absolute top-20 left-0 right-0 bg-white border rounded-xl shadow-2xl p-2 z-40 max-h-52 overflow-y-auto">
            <input
              type="text"
              placeholder="Gõ tên tòa nhà (C1, D3, TVTQB...)"
              className="w-full border rounded-lg px-2.5 py-1 text-sm mb-2 outline-none focus:border-blue-500"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              autoFocus
            />
            <div className="space-y-0.5">
              {filteredBuildings.slice(0, 30).map((b) => (
                <div
                  key={b.building_id}
                  onClick={() => {
                    onSelectPreset(showPresets, b);
                    setShowPresets(null);
                  }}
                  className="px-2 py-1.5 hover:bg-blue-50 rounded text-sm cursor-pointer flex justify-between items-center"
                >
                  <span className="font-semibold">{b.name}</span>
                  <span className="text-xs text-gray-400">{b.total_floor ? `${b.total_floor} tầng` : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Route Result Summary */}
      {routeResult && (
        <div className="mt-4 pt-3 border-t bg-[#F8EFCE]/60 -mx-4 -mb-4 p-4 rounded-b-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-[11px] text-gray-600 font-medium">{t('Khoảng cách')}</div>
              <div className="text-[18px] font-bold text-[#203354]">
                {routeResult.distanceM >= 1000
                  ? `${(routeResult.distanceM / 1000).toFixed(2)} km`
                  : `${routeResult.distanceM} m`}
              </div>
            </div>
            <div className="h-7 w-px bg-gray-300" />
            <div>
              <div className="text-[11px] text-gray-600 font-medium">{t('Thời gian đi bộ')}</div>
              <div className="text-[18px] font-bold text-emerald-700">
                ~{routeResult.timeMins} phút
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white border shadow-sm hover:bg-gray-100 cursor-pointer"
          >
            {t('Xóa đường đi')}
          </button>
        </div>
      )}
    </div>
  );
}

