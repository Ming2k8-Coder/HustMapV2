import React, { useState, useEffect } from 'react';

export function SearchModal({ open, searchTerm, onZoomToFeature, onStartRouteTo, cachedBuildings, cachedRooms, cachedParkings, t }) {
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
  }, [open, searchTerm, cachedBuildings, cachedRooms, cachedParkings]);

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
