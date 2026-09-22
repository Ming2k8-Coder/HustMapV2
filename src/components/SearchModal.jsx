import React, { useState, useEffect } from 'react';

export function SearchModal({ open, searchTerm, onZoomToFeature, onStartRouteTo, cachedBuildings, cachedRooms, cachedParkings, t }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && searchTerm) {
      const rawTerm = searchTerm.toLowerCase().trim();
      // Chuẩn hóa chuỗi tìm kiếm: bỏ các ký tự ngăn cách phổ biến như -, |, khoảng trắng thừa
      const normalizedTerm = rawTerm.replace(/[\s\-_|]/g, '');
      const matches = [];

      // Tạo bản đồ tra cứu tòa nhà theo building_id và tên
      const buildingMap = {};
      (cachedBuildings || []).forEach((b) => {
        buildingMap[b.building_id] = b;
        if (b.name) buildingMap[b.name.toLowerCase()] = b;
        if (b.display_name) buildingMap[b.display_name.toLowerCase()] = b;
      });

      // 1. Tìm kiếm tòa nhà (Buildings)
      (cachedBuildings || []).forEach((b) => {
        const bName = (b.name || '').toLowerCase();
        const bDisplay = (b.display_name || '').toLowerCase();
        const bNorm = bName.replace(/[\s\-_|]/g, '');
        if (
          bName.includes(rawTerm) ||
          bDisplay.includes(rawTerm) ||
          bNorm.includes(normalizedTerm)
        ) {
          matches.push(b);
        }
      });

      // 2. Tìm kiếm phòng (Rooms) - Hỗ trợ TC-401, TC401, TC 401, D3-101, v.v.
      Object.entries(cachedRooms || {}).forEach(([buildingId, roomsArr]) => {
        const parentBuilding = buildingMap[buildingId] || null;

        (roomsArr || []).forEach((r) => {
          const rCode = (r.room_code || '').toLowerCase();
          const rNameBig = (r.name_big || '').toLowerCase();
          const rNameSmall = (r.name_small || '').toLowerCase();
          const rNorm = rCode.replace(/[\s\-_|]/g, '');

          // Tên kết hợp tòa + phòng (vd: "nhà tc 401", "tc 401")
          const bName = parentBuilding ? parentBuilding.name.toLowerCase() : '';
          const combinedNorm = (bName + rCode).replace(/[\s\-_|]/g, '');

          const isMatch =
            rCode.includes(rawTerm) ||
            rNorm.includes(normalizedTerm) ||
            combinedNorm.includes(normalizedTerm) ||
            rNameBig.includes(rawTerm) ||
            rNameSmall.includes(rawTerm);

          if (isMatch) {
            matches.push({
              ...r,
              parentBuilding: parentBuilding,
              coordinate: r.coordinate || (parentBuilding ? parentBuilding.coordinate : null)
            });
          }
        });
      });

      // 3. Tìm kiếm bãi gửi xe (Parkings)
      (cachedParkings || []).forEach((p) => {
        const pName = (p.name || '').toLowerCase();
        if (pName.includes(rawTerm) || pName.replace(/[\s\-_|]/g, '').includes(normalizedTerm)) {
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
                <div className="flex-1 flex flex-col gap-2 py-1">
                  <div className="flex justify-between items-start gap-2">
                    <div className="left-col flex flex-col text-left flex-1">
                      <div className="flex items-center gap-2">
                        <span className="room-code text-[13px] sm:text-[15px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                          {item.room_code}
                        </span>
                        {item.parentBuilding && (
                          <span className="text-[11px] font-semibold text-gray-500">
                            ({item.parentBuilding.name})
                          </span>
                        )}
                      </div>
                      <div className="name-big font-medium text-[11px] sm:text-[14px] text-gray-800 mt-1">
                        {item.name_big || 'Phòng học / Nghiên cứu'}
                      </div>
                      {item.name_small && (
                        <div className="name-small font-light text-[9px] sm:text-[11px] text-gray-500">
                          {item.name_small}
                        </div>
                      )}
                    </div>

                    {/* Quick navigation to parent building */}
                    {item.coordinate && (
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          className="flex items-center underline font-light text-[10px] sm:text-[12px] cursor-pointer text-gray-700 hover:text-blue-700"
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
                            width={14}
                            height={14}
                            className="mr-[3px]"
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
                                    name: `${item.room_code} (${item.parentBuilding ? item.parentBuilding.name : ''})`,
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
                    )}
                  </div>

                  {(item.phone_num || item.website || item.email) && (
                    <div className="contact flex gap-2 text-[12px] underline text-gray-500">
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
