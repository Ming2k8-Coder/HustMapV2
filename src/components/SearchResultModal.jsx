import React from 'react';

export default function SearchResultModal({ open, results, loading, onClose, onLocate, t }) {
  if (!open) return null;

  return (
    <div className="Popup-container absolute top-20 left-3 sm:top-20 sm:left-6 bg-[#FDFFF5] border border-amber-200/80 rounded-2xl shadow-2xl z-30 w-[92vw] sm:w-96 pt-3 sm:pt-5 max-h-[50vh] sm:max-h-[75vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-center justify-between px-5 pb-3 border-b border-amber-100">
        <h3 className="text-[17px] sm:text-[20px] font-bold text-[#203354]">
          {t.searchResults}
        </h3>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-200/60 text-slate-500 font-bold transition"
        >
          ×
        </button>
      </div>

      <div className="overflow-y-auto px-4 py-2 flex-1 divide-y divide-amber-100/70">
        {loading ? (
          <div className="text-center py-8 text-[#203354] font-semibold animate-pulse-soft flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-3 border-red-700 border-t-transparent rounded-full animate-spin"></div>
            <span>{t.loading}...</span>
          </div>
        ) : !results || results.length === 0 ? (
          <div className="text-center py-8 text-slate-500 font-medium">
            {t.noResults}
          </div>
        ) : (
          results.map((item, idx) => {
            const isRoom = !!item.room_id;
            const isBuilding = !!item.building_id;
            const isParking = !!item.parking_id;

            return (
              <div
                key={idx}
                className="py-3 hover:bg-amber-50/60 rounded-xl px-2 transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  {isRoom && (
                    <>
                      {item.name_small && (
                        <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium truncate">
                          {item.name_small}
                        </div>
                      )}
                      <div className="text-[14px] font-semibold text-slate-900 leading-snug">
                        {item.name_big || item.display_name || item.room_code}
                      </div>
                      <div className="text-[12px] text-red-700 font-bold mt-0.5">
                        {item.room_code}
                      </div>
                      {(item.phone_num || item.email || item.website) && (
                        <div className="flex flex-wrap gap-2 text-[11px] text-blue-700 underline mt-1">
                          {item.phone_num && <a href={`tel:${item.phone_num}`}>{t.phone}</a>}
                          {item.email && <a href={`mailto:${item.email}`}>{t.email}</a>}
                          {item.website && (
                            <a
                              href={item.website.startsWith('http') ? item.website : `https://${item.website}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {t.website}
                            </a>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {isBuilding && (
                    <>
                      <div className="text-[16px] font-bold text-slate-900">
                        {item.name}
                      </div>
                      <div className="text-[12px] text-slate-500">
                        {t.totalFloors}: {item.total_floor || 1}
                      </div>
                    </>
                  )}

                  {isParking && (
                    <>
                      <div className="text-[15px] font-bold text-slate-900">
                        {item.name}
                      </div>
                      <div className="text-[12px] text-slate-500">
                        {t.parking.openHours}: {item.open_hour || '6:00 - 21:00'}
                      </div>
                    </>
                  )}
                </div>

                {item.coordinate && (
                  <button
                    onClick={() => onLocate(item.coordinate, item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-800 hover:bg-red-100 active:scale-95 text-[12px] font-semibold transition shrink-0"
                  >
                    <img
                      src="/icon/navigation.svg"
                      alt={t.locate}
                      className="w-3.5 h-3.5"
                    />
                    <span>{t.locate}</span>
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
