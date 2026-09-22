import React, { useState } from 'react';

export function RoutePanel({
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
