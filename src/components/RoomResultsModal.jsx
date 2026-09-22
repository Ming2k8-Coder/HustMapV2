import React from 'react';

export default function RoomResultsModal({
  open,
  buildingName,
  rooms,
  loading,
  onClose,
  onLocate,
  t
}) {
  if (!open) return null;

  return (
    <div className="Popup-container absolute bottom-24 left-3 sm:top-20 sm:bottom-auto sm:left-6 bg-[#FDFFF5] border border-amber-200/80 rounded-2xl shadow-2xl z-20 w-[92vw] sm:w-[420px] pt-4 pb-2 flex flex-col max-h-[55vh] sm:max-h-[75vh] animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between px-5 pb-3 border-b border-amber-100">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
            {t.totalFloors} & {t.roomType}
          </span>
          <h3 className="text-[20px] sm:text-[24px] font-bold text-[#203354]">
            {buildingName}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 font-bold text-xl transition"
        >
          ×
        </button>
      </div>

      <div className="overflow-y-auto px-5 py-2 flex-1 divide-y divide-amber-100/70">
        {loading ? (
          <div className="text-center py-8 text-[#203354] font-semibold animate-pulse-soft flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-3 border-red-700 border-t-transparent rounded-full animate-spin"></div>
            <span>{t.loading}...</span>
          </div>
        ) : !rooms || rooms.length === 0 ? (
          <div className="text-center py-8 text-slate-500 font-medium">
            {t.noResults}
          </div>
        ) : (
          rooms.map((room, idx) => (
            <div key={idx} className="py-3 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {room.name_small && (
                  <div className="text-[11px] font-light text-slate-500 uppercase tracking-wide">
                    {room.name_small}
                  </div>
                )}
                <div className="text-[14px] sm:text-[15px] font-semibold text-slate-900 leading-snug">
                  {room.name_big || room.room_code}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-block bg-red-100 text-red-800 text-[11px] font-bold px-2 py-0.5 rounded">
                    {t.selectFloor} {room.floor_num}
                  </span>
                  {room.capacity && (
                    <span className="text-[11px] text-slate-500">
                      {t.capacity}: {room.capacity}
                    </span>
                  )}
                </div>

                {(room.phone_num || room.website || room.email) && (
                  <div className="flex flex-wrap gap-2 text-[11px] text-blue-700 underline mt-1.5">
                    {room.phone_num && (
                      <a href={`tel:${room.phone_num}`} className="hover:text-blue-900">
                        {t.phone}: {room.phone_num}
                      </a>
                    )}
                    {room.email && (
                      <a href={`mailto:${room.email}`} className="hover:text-blue-900">
                        {t.email}
                      </a>
                    )}
                    {room.website && (
                      <a
                        href={room.website.startsWith('http') ? room.website : `https://${room.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-blue-900"
                      >
                        {t.website}
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className="text-right shrink-0">
                <div className="text-[14px] font-bold text-red-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                  {room.room_code}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-2 pb-1 text-center border-t border-amber-100 text-[12px] font-semibold text-slate-400">
        — {t.endOfList} —
      </div>
    </div>
  );
}
