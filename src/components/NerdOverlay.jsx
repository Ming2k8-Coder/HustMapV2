import React, { useState, useEffect } from 'react';

export default function NerdOverlay({ isOpen, onClose, map, gpsData }) {
  const [fps, setFps] = useState(60);
  const [mapState, setMapState] = useState({
    zoom: 17,
    pitch: 0,
    bearing: 0,
    center: [105.8431, 21.0062]
  });

  // Calculate rendering FPS
  useEffect(() => {
    if (!isOpen) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animId;

    const loop = (now) => {
      frameCount++;
      if (now - lastTime >= 500) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isOpen]);

  // Track map camera movement
  useEffect(() => {
    if (!isOpen || !map) return;

    const updateMapStats = () => {
      const c = map.getCenter();
      setMapState({
        zoom: Number(map.getZoom().toFixed(2)),
        pitch: Math.round(map.getPitch()),
        bearing: Math.round(map.getBearing()),
        center: [Number(c.lng.toFixed(6)), Number(c.lat.toFixed(6))]
      });
    };

    updateMapStats();
    map.on('move', updateMapStats);
    map.on('rotate', updateMapStats);
    map.on('pitch', updateMapStats);

    return () => {
      map.off('move', updateMapStats);
      map.off('rotate', updateMapStats);
      map.off('pitch', updateMapStats);
    };
  }, [isOpen, map]);

    if (!isOpen) return null;

  const speedKmh = gpsData?.speed != null ? (gpsData.speed * 3.6).toFixed(1) : '0.0';
  const altitude = gpsData?.altitude != null ? `${gpsData.altitude.toFixed(1)} m` : 'N/A';
  const heading = gpsData?.heading != null ? `${Math.round(gpsData.heading)}°` : 'N/A';
  const accuracy = gpsData?.accuracy != null ? `±${Math.round(gpsData.accuracy)}m` : 'N/A';

  return (
    <div className="fixed top-24 left-6 z-40 bg-black/85 text-emerald-400 font-mono text-[11px] sm:text-[12px] p-3.5 rounded-xl border border-emerald-500/40 shadow-2xl backdrop-blur-md max-w-[320px] w-full select-text animate-fade-in pointer-events-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2 mb-2.5 text-white">
        <div className="flex items-center gap-1.5 font-bold">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>NERD STATS (DEBUG MODE)</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white px-1 font-bold text-sm cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Grid Data */}
      <div className="space-y-1.5">
        {/* FPS & Performance */}
        <div className="flex justify-between">
          <span className="text-gray-400">Render FPS:</span>
          <span className={fps < 30 ? 'text-red-400 font-bold' : 'text-emerald-300 font-bold'}>
            {fps} fps
          </span>
        </div>

        {/* GPS Coordinates */}
        <div className="flex justify-between">
          <span className="text-gray-400">GPS Coordinates:</span>
          <span className="text-white font-semibold">
            {gpsData?.lat ? `${gpsData.lat.toFixed(5)}, ${gpsData.lng.toFixed(5)}` : 'Searching...'}
          </span>
        </div>

        {/* GPS Speed */}
        <div className="flex justify-between">
          <span className="text-gray-400">Movement Speed:</span>
          <span className="text-amber-300 font-bold">
            {speedKmh} km/h <span className="text-[10px] text-gray-400">({gpsData?.speed != null ? gpsData.speed.toFixed(1) : 0} m/s)</span>
          </span>
        </div>

        {/* GPS Altitude & Accuracy */}
        <div className="flex justify-between">
          <span className="text-gray-400">Height (Altitude):</span>
          <span className="text-cyan-300 font-semibold">{altitude}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">GPS Accuracy:</span>
          <span className="text-gray-300">{accuracy}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">Compass Heading:</span>
          <span className="text-gray-300">{heading}</span>
        </div>

        <div className="border-t border-emerald-500/20 my-2 pt-1.5"></div>

        {/* Map Camera Stats */}
        <div className="flex justify-between">
          <span className="text-gray-400">Camera Zoom:</span>
          <span className="text-white">{mapState.zoom}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">Camera Pitch:</span>
          <span className="text-white">{mapState.pitch}°</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">Camera Bearing:</span>
          <span className="text-white">{mapState.bearing}°</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">Camera Center:</span>
          <span className="text-gray-300 text-[10px]">
            {mapState.center[0]}, {mapState.center[1]}
          </span>
        </div>
      </div>
    </div>
  );
}
