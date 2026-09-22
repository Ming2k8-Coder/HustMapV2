import React from 'react';

export function NavigationBar({
  searchTerm,
  setSearchTerm,
  onExecuteSearch,
  routeModalOpen,
  onToggleRouteModal,
  lang,
  onChangeLanguage,
  t,
  onOpenOfflineModal,
  isOfflineReady,
  is3DMode,
  onToggle3DMode,
  onOpenGuideModal,
  isNerdMode,
  onToggleNerdMode
}) {
  return (
    <>
      {/* Top Right Bar: 3D Toggle, Guide, Nerd Stats, Offline, Language Switcher */}
      <div className="absolute top-20 sm:top-6 right-6 z-30 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm p-1 rounded-xl shadow-md border border-gray-100">
        {/* 3D Vis Toggle Button */}
        <button
          onClick={onToggle3DMode}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            is3DMode
              ? 'bg-amber-500 text-white shadow-sm hover:bg-amber-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
          }`}
          title="Bật/Tắt chế độ Trực quan 3D (3D Vis)"
        >
          <span className="text-[13px] font-extrabold">{is3DMode ? '3D' : '2D'}</span>
        </button>

        {/* Nerd / Debug Mode Button */}
        <button
          onClick={onToggleNerdMode}
          className={`flex items-center justify-center px-2 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
            isNerdMode
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
          }`}
          title="Nerd Mode / Debug Stats (Tọa độ, tốc độ, độ cao, FPS)"
        >
          &gt;_
        </button>

        {/* Guide / Hướng dẫn Button */}
        <button
          onClick={onOpenGuideModal}
          className="flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition cursor-pointer"
          title="Hướng dẫn thao tác bản đồ & cử chỉ 3D"
        >
          ?
        </button>

        <div className="h-4 w-[1px] bg-gray-200 my-auto"></div>

        {/* Offline Ready Toggle / Status Button */}
        <button
          onClick={onOpenOfflineModal}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            isOfflineReady
              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
          }`}
          title="Lưu bản đồ tại máy để dùng ngoại tuyến (Offline Mode)"
        >
          {isOfflineReady ? (
            <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
          )}
          <span className="hidden md:inline">{isOfflineReady ? 'Đã lưu Offline' : 'Lưu Offline'}</span>
        </button>

        <div className="h-4 w-[1px] bg-gray-200 my-auto"></div>

        <button
          onClick={() => onChangeLanguage('en')}
          className={`px-[8px] py-1 rounded font-bold transition cursor-pointer ${
            lang === 'en' ? 'bg-[#5D92EB]' : 'bg-transparent'
          }`}
        >
          <img
            src="/icon/eng.svg"
            alt="ENG"
            width={22}
            height={22}
            className="fb-icon align-middle"
          />
        </button>
        <button
          onClick={() => onChangeLanguage('vi')}
          className={`px-[8px] py-1 rounded font-bold transition cursor-pointer ${
            lang === 'vi' ? 'bg-red-100' : 'bg-transparent'
          }`}
        >
          <img
            src="/icon/VN.svg"
            alt="VN"
            width={22}
            height={22}
            className="fb-icon align-middle"
          />
        </button>
      </div>

      {/* Search Bar & Route Button */}
      <div className="absolute top-6 left-6 z-20 flex gap-2 items-center">
        <div className="search-container flex flex-row max-w-[80vw] sm:w-[320px] w-[75vw] border bg-[#F8EFCE] px-4 py-2 rounded-[8px] shadow-xl/30">
          <input
            type="text"
            className="text-container flex-1 bg-transparent outline-none w-full/0.99 text-[15px]"
            placeholder="Tìm kiếm tòa nhà, phòng học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onExecuteSearch();
            }}
          />
          <img
            src="/icon/search.svg"
            alt="search"
            width={20}
            height={20}
            className="search-icon h-[20px] cursor-pointer"
            onClick={onExecuteSearch}
          />
        </div>

        {/* Route / Navigation Button */}
        <button
          onClick={onToggleRouteModal}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-[8px] border shadow-xl/30 font-semibold text-[14px] transition cursor-pointer ${
            routeModalOpen
              ? 'bg-[#EF4444] text-white border-[#DC2626]'
              : 'bg-[#203354] text-white border-[#1B2B46] hover:bg-[#2A436D]'
          }`}
          title={t('Tìm đường')}
        >
          <img
            src="/icon/navigation.svg"
            alt="Route"
            width={18}
            height={18}
            className="brightness-200 invert"
          />
          <span className="hidden sm:inline">
            {routeModalOpen ? t('Xóa đường đi') : t('Tìm đường')}
          </span>
        </button>
      </div>
    </>
  );
}
