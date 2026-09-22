import React from 'react';
import { getAssetUrl } from '../utils/assetUrl.js';

export function FeaturePopup({
  selectedFeature,
  popupOpen,
  floorNum,
  setFloorNum,
  roomType,
  setRoomType,
  errorMessage,
  onFindRooms,
  onStartRouteTo,
  t
}) {
  if (!selectedFeature || !popupOpen) return null;

  return (
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
                    onStartRouteTo({
                      name: selectedFeature.data.name,
                      lat: parseFloat(parts[0]),
                      lng: parseFloat(parts[1])
                    });
                  }
                }}
              >
                <img src={getAssetUrl('/icon/navigation.svg')} alt="Route" width={14} height={14} className="brightness-200 invert" />
                <span>{t('Tìm đường')}</span>
              </button>
            )}
          </div>
          <div className="PopupChild-container flex justify-center gap-x-5">
            <div className="leftGrandChild basis-[60%] sm:basis-[70%] mt-[10px] sm:mt-[0px]">
              <img
                src={getAssetUrl(selectedFeature.data.image)}
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
                onClick={onFindRooms}
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
                    onStartRouteTo({
                      name: selectedFeature.data.name,
                      lat: parseFloat(parts[0]),
                      lng: parseFloat(parts[1])
                    });
                  }
                }}
              >
                <img src={getAssetUrl('/icon/navigation.svg')} alt="Route" width={14} height={14} className="brightness-200 invert" />
                <span>{t('Tìm đường')}</span>
              </button>
            )}
          </div>
          <div className="w-full aspect-video overflow-hidden">
            <img
              src={getAssetUrl(selectedFeature.data.image)}
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
              <img src={getAssetUrl('/icon/time.svg')} alt="Giờ mở cửa" width={30} height={30} className="w-[30px] mr-[8px]" />
              <div className="open_hour-content pt-[8px]">{selectedFeature.data.open_hour}</div>
            </div>
            <div className="Price-container flex flex-row">
              <div>
                <img src={getAssetUrl('/icon/price.svg')} alt="Giá" width={32} height={32} className="w-[32px] mr-[8px]" />
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
              <img src={getAssetUrl('/icon/time.svg')} alt="Giờ mở cửa" width={40} height={40} className="w-[40px] mr-[8px]" />
              <div className="open_hour-content pt-[8px]">{selectedFeature.data.open_hour}</div>
            </div>
            <div className="Price-container flex flex-row">
              <div>
                <img src={getAssetUrl('/icon/price.svg')} alt="Giá" width={40} height={40} className="w-[40px] mr-[8px]" />
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
  );
}
