import React from 'react';

export function NavigationBar({
  searchTerm,
  setSearchTerm,
  onExecuteSearch,
  routeModalOpen,
  onToggleRouteModal,
  lang,
  onChangeLanguage,
  t
}) {
  return (
    <>
      {/* Language Switcher Buttons */}
      <div className="absolute top-20 sm:top-6 right-6 z-30 flex">
        <button
          onClick={() => onChangeLanguage('en')}
          className={`px-[8px] rounded font-bold transition cursor-pointer ${
            lang === 'en' ? 'bg-[#5D92EB]' : 'bg-transparent'
          }`}
        >
          <img
            src="/icon/eng.svg"
            alt="ENG"
            width={25}
            height={25}
            className="fb-icon align-middle"
          />
        </button>
        <button
          onClick={() => onChangeLanguage('vi')}
          className={`px-[8px] rounded font-bold transition cursor-pointer ${
            lang === 'vi' ? 'bg-red-100' : 'bg-transparent'
          }`}
        >
          <img
            src="/icon/VN.svg"
            alt="VN"
            width={25}
            height={25}
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
