import React, { useState, useEffect } from 'react';
import { checkOfflineStatus, downloadAllForOffline, clearOfflineCache } from '../services/offlineManager';

export default function OfflineModal({ isOpen, onClose }) {
  const [status, setStatus] = useState({ isReady: false, cachedCount: 0, totalCount: 0 });
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0, percentage: 0, currentUrl: '' });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (isOpen) {
      loadStatus();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOpen]);

  const loadStatus = async () => {
    const res = await checkOfflineStatus();
    setStatus(res);
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setMessage('Đang tải trước toàn bộ vector tiles, bản đồ và dữ liệu...');
      await downloadAllForOffline((prog) => {
        setProgress(prog);
      });
      await loadStatus();
      setMessage('Đã lưu thành công toàn bộ bản đồ về máy!');
    } catch (err) {
      setMessage('Lỗi khi tải dữ liệu: ' + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleClear = async () => {
    if (window.confirm('Bạn có chắc muốn xóa bản đồ đã lưu trên máy để giải phóng dung lượng?')) {
      await clearOfflineCache();
      await loadStatus();
      setProgress({ completed: 0, total: 0, percentage: 0, currentUrl: '' });
      setMessage('Đã xóa dữ liệu ngoại tuyến.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 to-red-600 px-6 py-4 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            <h3 className="text-lg font-bold">Khả dụng Ngoại tuyến (Offline Mode)</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Trạng thái mạng */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-sm font-medium text-gray-700">Kết nối Internet:</span>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
              isOnline ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
            }`}>
              <span className={`w-2 h-2 rounded-full mr-1.5 ${isOnline ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></span>
              {isOnline ? 'Đang kết nối' : 'Đang Ngoại Tuyến (Offline)'}
            </span>
          </div>

          {/* Trạng thái lưu trên máy */}
          <div className="p-4 rounded-xl border border-gray-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-800">Trạng thái lưu trữ tại máy:</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                status.isReady ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {status.isReady ? 'Đã sẵn sàng Offline' : 'Chưa tải đủ'}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Tương tự như Google Docs/Drive, bạn có thể lưu trữ toàn bộ bản đồ HUST (tất cả các mảnh tile 3D, tòa nhà, mạng lưới đường) trực tiếp trên thiết bị này. Sau khi lưu, bạn có thể tắt mạng và mở trang bất cứ lúc nào!
            </p>
            <div className="text-xs font-semibold text-gray-600">
              Đã lưu: <span className="text-red-600 font-bold">{status.cachedCount}</span> / {status.totalCount || 307} tệp tài nguyên
            </div>
          </div>

          {/* Progress bar khi tải */}
          {isDownloading && (
            <div className="space-y-1.5 p-3 rounded-xl bg-red-50 border border-red-100 animate-pulse">
              <div className="flex justify-between text-xs font-bold text-red-700">
                <span>Đang tải xuống bộ nhớ máy...</span>
                <span>{progress.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-red-600 h-2.5 rounded-full transition-all duration-200" 
                  style={{ width: `${progress.percentage}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-gray-500 truncate">{progress.currentUrl}</p>
            </div>
          )}

          {message && (
            <p className="text-xs text-center font-medium text-red-600 bg-red-50 py-1.5 px-3 rounded-lg">
              {message}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col space-y-2 pt-2">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className={`w-full py-2.5 px-4 rounded-xl font-semibold text-white shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                isDownloading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-700 active:scale-[0.98]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>{status.isReady ? 'Cập nhật lại bản đồ ngoại tuyến' : 'Lưu bản đồ về máy (Khả dụng Ngoại Tuyến)'}</span>
            </button>

            {status.cachedCount > 0 && (
              <button
                onClick={handleClear}
                disabled={isDownloading}
                className="w-full py-2 px-4 rounded-xl text-xs font-medium text-gray-600 hover:text-red-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Xóa bản đồ đã lưu trên máy (Giải phóng dung lượng)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
