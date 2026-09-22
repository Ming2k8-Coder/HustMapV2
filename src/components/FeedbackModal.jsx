import React from 'react';

export function FeedbackModal({
  open,
  onClose,
  feedbackDesc,
  setFeedbackDesc,
  feedbackContact,
  setFeedbackContact,
  feedbackFile,
  setFeedbackFile,
  feedbackPhotoPreview,
  setFeedbackPhotoPreview,
  feedbackError,
  feedbackSending,
  onSendFeedback,
  isRecordingGPS,
  onToggleRecordGPS,
  recordedTrack,
  onExportTrack,
  t
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="popup-container z-30 absolute bg-[#FDFFF5]/90 flex items-center justify-center rounded-[6px] shadow-xl">
        <button
          className="absolute top-0 right-2 text-[30px] font-bold cursor-pointer"
          onClick={onClose}
        >
          ×
        </button>
        <div className="popup-content p-[20px] text-[15px] font-semibold flex flex-col max-h-[85vh] overflow-y-auto w-[92vw] sm:w-[460px]">
          <div className="tittle text-[22px] sm:text-[25px] text-[#203354] mb-2">
            {t('Góc góp ý thay đổi')}
          </div>

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
                onClick={onToggleRecordGPS}
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
                  onClick={onExportTrack}
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
            onClick={onSendFeedback}
          >
            {feedbackSending ? t('Đang gửi') : t('GỬI')}
          </button>
        </div>
      </div>
    </div>
  );
}
