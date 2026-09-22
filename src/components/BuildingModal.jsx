import React, { useState } from 'react';

export default function BuildingModal({
  building,
  onFindRooms,
  onClose,
  t
}) {
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!building) return null;

  const handleFind = () => {
    if (!selectedFloor && !selectedType) {
      setErrorMsg(t.requireFloorOrType);
      return;
    }
    setErrorMsg('');
    onFindRooms(building.building_id, selectedFloor, selectedType, building.name);
  };

  const isUniBuilding = building.type === 'UNI_BUILDING';

  return (
    <div className="Popup-container absolute bottom-24 left-3 sm:top-20 sm:bottom-auto sm:left-6 bg-[#FDFFF5] border border-amber-200/80 rounded-2xl shadow-2xl p-4 sm:p-6 z-20 w-[92vw] sm:w-[480px] animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-100">
        <h2 className="text-[22px] sm:text-[26px] font-bold text-[#203354] tracking-wide">
          {building.name}
        </h2>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 font-bold text-xl transition"
        >
          ×
        </button>
      </div>

      {isUniBuilding ? (
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-stretch">
          {/* Left image */}
          <div className="sm:basis-[58%] basis-full rounded-xl overflow-hidden shadow-sm aspect-[16/10] bg-slate-100 flex items-center justify-center border border-slate-200/50">
            {building.image ? (
              <img
                src={building.image.startsWith('http') ? building.image : `https://hustmap.com${building.image}`}
                alt={building.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/thumbnail.png';
                }}
              />
            ) : (
              <div className="text-slate-400 text-sm font-medium">Bách Khoa Hà Nội</div>
            )}
          </div>

          {/* Right form controls */}
          <div className="sm:basis-[42%] basis-full flex flex-col justify-between space-y-3">
            <div>
              <label className="block text-[14px] sm:text-[15px] font-semibold text-slate-800 mb-1">
                {t.totalFloors}
              </label>
              <select
                value={selectedFloor}
                onChange={(e) => {
                  setSelectedFloor(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full bg-[#203354] text-white text-[13px] sm:text-[14px] font-medium py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 shadow-sm transition"
              >
                <option value="">{t.selectFloor}</option>
                {Array.from({ length: building.total_floor || 1 }, (_, i) => i + 1).map((f) => (
                  <option key={f} value={f}>
                    {t.selectFloor} {f}
                  </option>
                ))}
                <option value="100">{t.all}</option>
              </select>
            </div>

            <div>
              <label className="block text-[14px] sm:text-[15px] font-semibold text-slate-800 mb-1">
                {t.roomType}
              </label>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full bg-[#203354] text-white text-[13px] sm:text-[14px] font-medium py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 shadow-sm transition"
              >
                <option value="">{t.selectRoomType}</option>
                {Object.entries(t.roomTypes).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
                <option value="all">{t.all}</option>
              </select>
            </div>

            <button
              onClick={handleFind}
              className="w-full bg-[#F8EFCE] hover:bg-[#ffe380] active:scale-[0.98] text-[#203354] border border-amber-300 font-bold py-2 rounded-lg text-[15px] shadow-md hover:shadow-lg transition-all"
            >
              {t.find}
            </button>
          </div>
        </div>
      ) : (
        /* Other building view */
        <div className="flex flex-col gap-3">
          <div className="w-full aspect-video rounded-xl overflow-hidden shadow-sm bg-slate-100 flex items-center justify-center border border-slate-200/50">
            {building.image ? (
              <img
                src={building.image.startsWith('http') ? building.image : `https://hustmap.com${building.image}`}
                alt={building.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/thumbnail.png';
                }}
              />
            ) : (
              <div className="text-slate-400 text-sm font-medium">Bách Khoa Hà Nội</div>
            )}
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="text-red-600 text-[13px] font-semibold text-right mt-2 animate-bounce">
          {errorMsg}
        </div>
      )}
    </div>
  );
}
