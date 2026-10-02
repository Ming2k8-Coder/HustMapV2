import React from 'react';

export function RoomModal({ open, result, buildingName, t }) {
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
                      <div className="name-small font-light mb-[5px] text-[8px] sm:text-[11px] text-slate-500">
                        {room.name_small}
                      </div>
                    )}
                    <div className="name-big font-medium text-[10px] sm:text-[14px] text-slate-900">
                      {room.name_big}
                    </div>
                    {(room.floor_num || room.capacity || room.facilities) && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {room.floor_num && (
                          <span className="inline-block bg-red-100 text-red-800 text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded">
                            {t('Tầng')} {room.floor_num}
                          </span>
                        )}
                        {room.capacity && (
                          <span className="inline-block bg-slate-100 text-slate-700 text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded">
                            {t('Sức chứa') || 'Sức chứa'}: {room.capacity}
                          </span>
                        )}
                        {room.facilities && (
                          <span className="inline-block bg-blue-50 text-blue-700 text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded">
                            {room.facilities}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="right-col flex flex-col text-right">
                    <div className="room-code text-[12px] sm:text-[14px] font-semibold text-red-700">
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
          <div className="Building-name px-[20px] text-[15px] sm:text-[20px] font-semibold flex items-center justify-center m-[5px] sm:mb-[10px] text-slate-400">
            {t('Hết')}
          </div>
        </div>
      ) : (
        <div className="text-red-700 text-center py-4 font-medium">{t('Lỗi khi tải kết quả.')}</div>
      )}
    </div>
  );
}
