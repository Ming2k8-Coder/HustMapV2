import React, { useState } from 'react';

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
  poiData,
  setPoiData,
  onPickPoiLocation,
  buildings,
  t
}) {
  const [activeTab, setActiveTab] = useState('poi'); // 'poi' | 'photo' | 'track'

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-[#FDFFF5] border border-amber-200/80 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] z-10">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#701818] to-[#8C1D1D] text-white px-5 py-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg">🤝</span>
            <h3 className="text-[16px] sm:text-[18px] font-bold tracking-wide">
              Cộng Đồng Đóng Góp Bản Đồ HUST
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-2xl font-bold transition cursor-pointer leading-none"
          >
            ×
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-200 bg-amber-50/50 text-xs font-bold text-gray-600">
          <button
            type="button"
            onClick={() => setActiveTab('poi')}
            className={`flex-1 py-2.5 text-center border-b-2 transition flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'poi' ? 'border-[#701818] text-[#701818] bg-white' : 'border-transparent hover:text-gray-900'
            }`}
          >
            <span>📍</span> Thêm Phòng / Vị Trí
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('photo')}
            className={`flex-1 py-2.5 text-center border-b-2 transition flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'photo' ? 'border-[#701818] text-[#701818] bg-white' : 'border-transparent hover:text-gray-900'
            }`}
          >
            <span>📸</span> Góp Ảnh Thực Tế
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('track')}
            className={`flex-1 py-2.5 text-center border-b-2 transition flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'track' ? 'border-[#701818] text-[#701818] bg-white' : 'border-transparent hover:text-gray-900'
            }`}
          >
            <span>🚶</span> Lộ Trình (GPS)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-gray-700">
          {/* TAB 1: Góp Vị Trí / Phòng Ban / Tiện Ích */}
          {activeTab === 'poi' && (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-blue-900 text-[11px] leading-relaxed">
                💡 <strong>Góp dữ liệu phòng ban:</strong> Bổ sung phòng học mới, lab nghiên cứu, văn phòng khoa/viện hoặc điểm tiện ích (ATM, căng tin, máy bán nước) chưa có trên bản đồ.
              </div>

              {/* Loại địa điểm */}
              <div>
                <label className="font-bold text-gray-800 block mb-1">Loại địa điểm (*):</label>
                <select
                  value={poiData.category || 'room'}
                  onChange={(e) => setPoiData({ ...poiData, category: e.target.value })}
                  className="w-full border rounded-lg p-2 bg-white text-xs outline-none focus:border-red-600 font-medium"
                >
                  <option value="room">Phòng học / Giảng đường</option>
                  <option value="lab">Phòng Lab / Viện / Trung tâm nghiên cứu</option>
                  <option value="office">Văn phòng Bộ môn / Khoa / Viện / Ban</option>
                  <option value="service">Tiện ích (Căng tin, ATM, Máy bán nước, Quán cafe)</option>
                  <option value="parking">Bãi gửi xe / Cổng ra vào mới</option>
                  <option value="other">Địa điểm khác</option>
                </select>
              </div>

              {/* Tòa nhà & Tầng */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-800 block mb-1">Thuộc Tòa nhà:</label>
                  <select
                    value={poiData.buildingId || ''}
                    onChange={(e) => setPoiData({ ...poiData, buildingId: e.target.value })}
                    className="w-full border rounded-lg p-2 bg-white text-xs outline-none focus:border-red-600"
                  >
                    <option value="">-- Chọn tòa nhà --</option>
                    {(buildings || []).map((b) => (
                      <option key={b.building_id} value={b.building_id}>
                        {b.name} {b.display_name && b.display_name !== b.name ? `(${b.display_name})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-800 block mb-1">Số tầng / Lầu:</label>
                  <input
                    type="number"
                    placeholder="VD: 4 (Tầng 4)"
                    value={poiData.floorNum || ''}
                    onChange={(e) => setPoiData({ ...poiData, floorNum: e.target.value })}
                    className="w-full border rounded-lg p-2 bg-white text-xs outline-none focus:border-red-600"
                  />
                </div>
              </div>

              {/* Tên phòng / Mã số */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-800 block mb-1">Mã số / Ký hiệu (*):</label>
                  <input
                    type="text"
                    placeholder="VD: TC-401, D9-201..."
                    value={poiData.code || ''}
                    onChange={(e) => setPoiData({ ...poiData, code: e.target.value })}
                    className="w-full border rounded-lg p-2 bg-white text-xs outline-none focus:border-red-600 font-semibold text-red-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-800 block mb-1">Tên đầy đủ / Chức năng:</label>
                  <input
                    type="text"
                    placeholder="VD: Lab AI, Văn phòng..."
                    value={poiData.name || ''}
                    onChange={(e) => setPoiData({ ...poiData, name: e.target.value })}
                    className="w-full border rounded-lg p-2 bg-white text-xs outline-none focus:border-red-600"
                  />
                </div>
              </div>

              {/* Tọa độ chấm trên bản đồ */}
              <div className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-800 block">Vị trí tọa độ:</span>
                  <span className="text-[11px] text-gray-500 font-mono">
                    {poiData.coords ? `${poiData.coords[1].toFixed(5)}, ${poiData.coords[0].toFixed(5)}` : 'Chưa chấm tọa độ'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onPickPoiLocation}
                  className="px-3 py-1.5 rounded-lg bg-[#203354] hover:bg-[#2A436D] text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1"
                >
                  <span>🎯</span> {poiData.coords ? 'Chấm lại vị trí' : 'Chấm trên bản đồ'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Góp Ảnh Thực Tế */}
          {activeTab === 'photo' && (
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900 text-[11px] leading-relaxed">
                📷 <strong>Chia sẻ hình ảnh khuôn viên:</strong> Chụp ảnh trực tiếp hoặc tải ảnh biển phòng, cửa ra vào, khu tự học để cộng đồng dễ dàng nhận diện.
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">Tải ảnh hoặc Chụp ảnh từ camera:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="bg-white border rounded-lg p-2 text-xs flex-1 cursor-pointer"
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
                      className="text-xs text-red-600 hover:underline font-bold cursor-pointer"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>

              {/* Photo Preview Thumbnail */}
              {feedbackPhotoPreview && (
                <div className="relative w-full h-44 rounded-xl overflow-hidden border shadow-inner bg-slate-100 flex items-center justify-center">
                  <img
                    src={feedbackPhotoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Ghi Lộ Trình GPS Trace */}
          {activeTab === 'track' && (
            <div className="space-y-3">
              <div className="p-3 bg-[#EBF3FE] border border-[#BFDBFE] rounded-xl">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-[#1E3A8A] font-bold text-xs sm:text-sm">
                    <span>🚶</span> Ghi nhận lộ trình di chuyển (GPS Trace)
                  </div>
                  {isRecordingGPS && (
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-600 mb-2 font-normal">
                  Bật ghi GPS khi bạn đi bộ trên tuyến đường mới hoặc ngõ ngách trong trường. Tọa độ thực tế sẽ giúp chúng tôi vẽ tuyến đường chuẩn xác hơn.
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
                    {isRecordingGPS ? 'Dừng ghi GPS' : 'Bắt đầu ghi GPS'}
                  </button>

                  <div className="text-xs text-gray-700 font-medium ml-2">
                    Đã ghi: <span className="font-bold text-blue-700">{recordedTrack.length}</span> điểm tọa độ
                  </div>

                  {recordedTrack.length > 0 && (
                    <button
                      type="button"
                      onClick={onExportTrack}
                      className="ml-auto text-[11px] bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-2 py-1 rounded-md font-medium cursor-pointer shadow-xs"
                    >
                      💾 Tải .geojson
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Ghi chú mô tả chung */}
          <div>
            <label className="font-bold text-gray-800 block mb-1">Mô tả chi tiết / Ghi chú thêm:</label>
            <textarea
              className="w-full border rounded-lg p-2 text-xs bg-white outline-none focus:border-red-600"
              rows={2}
              placeholder="Thêm ghi chú cụ thể (ví dụ: Biển phòng mới lắp trước cửa lab, phòng mở cửa từ 8h-17h...)"
              value={feedbackDesc}
              onChange={(e) => setFeedbackDesc(e.target.value)}
            />
            {feedbackError && (
              <div className="text-red-600 font-bold text-xs mt-1">
                {feedbackError}
              </div>
            )}
          </div>

          {/* Thông tin liên hệ */}
          <div>
            <label className="font-bold text-gray-800 block mb-0.5">Phương thức liên hệ (Không bắt buộc):</label>
            <div className="text-[10px] text-gray-400 mb-1">Email / SĐT / Zalo để chúng tôi cảm ơn hoặc đối chiếu dữ liệu</div>
            <input
              type="text"
              className="w-full border rounded-lg p-2 text-xs bg-white outline-none focus:border-red-600"
              placeholder="Email hoặc SĐT của bạn"
              value={feedbackContact}
              onChange={(e) => setFeedbackContact(e.target.value)}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200 transition cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={feedbackSending}
            onClick={onSendFeedback}
            className="px-6 py-2 rounded-xl bg-[#701818] hover:bg-[#8C1D1D] text-white text-xs font-bold transition shadow-md cursor-pointer disabled:bg-gray-400 flex items-center gap-1.5"
          >
            <span>🚀</span>
            {feedbackSending ? 'Đang gửi...' : 'Gửi Đóng Góp'}
          </button>
        </div>

      </div>
    </div>
  );
}
