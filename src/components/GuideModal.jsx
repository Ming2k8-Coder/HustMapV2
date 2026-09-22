import React from 'react';

export default function GuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#203354] to-[#2A436D] px-6 py-4 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-bold">Hướng dẫn Thao tác Bản đồ & 3D</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors cursor-pointer text-xl font-bold">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto text-gray-700 text-sm">
          {/* Section: Chế độ 3D và Điều khiển Phối cảnh */}
          <div className="border border-amber-200 bg-amber-50/60 rounded-xl p-4">
            <h4 className="font-bold text-amber-900 flex items-center gap-2 mb-2 text-[15px]">
              <span>🏛️</span> Chế độ Trực quan 3D (3D Vis)
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed mb-3">
              Bấm nút <strong className="bg-white px-1.5 py-0.5 rounded border border-amber-300">3D</strong> trên thanh điều hướng để biến các khối tòa nhà trong trường Bách Khoa dựng đứng lên theo số tầng thực tế!
            </p>
          </div>

          {/* Section: Cử chỉ cảm ứng trên Điện thoại / Tablet */}
          <div>
            <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-3 text-[15px]">
              <span>📱</span> Thao tác Cảm ứng trên Điện thoại / Máy tính bảng
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                <div className="font-bold text-red-600 w-28 shrink-0">2 ngón vuốt DỌC ↕️:</div>
                <div className="text-gray-600">
                  <strong>Chỉnh góc nghiêng 3D (Pitch):</strong> Đặt 2 ngón tay song song và vuốt lên / xuống để nghiêng góc nhìn từ 0° (mặt phẳng 2D) đến 60° (phối cảnh 3D không gian).
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                <div className="font-bold text-blue-600 w-28 shrink-0">2 ngón XOAY 🔄:</div>
                <div className="text-gray-600">
                  <strong>Xoay hướng bản đồ (Bearing):</strong> Đặt 2 ngón tay và xoay tròn để quan sát tòa nhà từ các hướng khác nhau (Đông, Tây, Nam, Bắc).
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                <div className="font-bold text-emerald-600 w-28 shrink-0">2 ngón CHỤM 🤏:</div>
                <div className="text-gray-600">
                  <strong>Phóng to / Thu nhỏ (Zoom):</strong> Chụm hoặc banh 2 ngón tay để zoom chi tiết các ngõ ngách, lối đi trường Bách Khoa.
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                <div className="font-bold text-purple-600 w-28 shrink-0">1 ngón KÉO 👆:</div>
                <div className="text-gray-600">
                  <strong>Di chuyển bản đồ (Pan):</strong> Kéo vuốt tự do để xem toàn cảnh khuôn viên trường.
                </div>
              </div>
            </div>
          </div>

          {/* Section: Thao tác trên Chuột Máy tính */}
          <div>
            <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-3 text-[15px]">
              <span>💻</span> Thao tác Chuột trên Máy tính (PC / Laptop)
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                <span className="font-semibold text-gray-800 w-36 shrink-0">Chuột phải kéo rê:</span>
                <span className="text-gray-600">Vừa chỉnh góc nghiêng 3D (Pitch) vừa xoay hướng la bàn (Bearing).</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                <span className="font-semibold text-gray-800 w-36 shrink-0">Giữ Ctrl + Chuột trái:</span>
                <span className="text-gray-600">Xoay phối cảnh camera 3D xung quanh tòa nhà.</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                <span className="font-semibold text-gray-800 w-36 shrink-0">Lăn con lăn chuột:</span>
                <span className="text-gray-600">Phóng to / thu nhỏ bản đồ mượt mà.</span>
              </div>
            </div>
          </div>

          {/* Section: Mẹo tìm phòng */}
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-900">
            <strong>💡 Mẹo tìm phòng:</strong> Bạn có thể gõ trực tiếp số phòng kết hợp tên tòa (VD: <code className="bg-white px-1 py-0.5 rounded text-blue-700 font-bold border border-blue-200">TC-401</code>, <code className="bg-white px-1 py-0.5 rounded text-blue-700 font-bold border border-blue-200">D3-101</code>, <code className="bg-white px-1 py-0.5 rounded text-blue-700 font-bold border border-blue-200">C7-202</code>) để tìm kiếm và định vị chính xác vị trí tầng lầu của phòng học!
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#203354] text-white font-semibold text-xs hover:bg-[#2A436D] transition cursor-pointer shadow-md"
          >
            Đã hiểu, đóng hướng dẫn
          </button>
        </div>
      </div>
    </div>
  );
}
