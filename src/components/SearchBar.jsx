import React, { useState } from 'react';

export default function SearchBar({ onSearch, lang, t }) {
  const [term, setTerm] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch(term);
    }
  };

  return (
    <div className="search-container absolute flex flex-row items-center z-20 top-6 left-6 max-w-[90vw] sm:w-[320px] w-[90vw] border border-amber-200/60 bg-[#F8EFCE] px-4 py-2 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl focus-within:ring-2 focus-within:ring-amber-500/40">
      <input
        type="text"
        className="text-container flex-1 bg-transparent outline-none w-full text-[15px] font-medium text-slate-800 placeholder-slate-500"
        placeholder={t.searchPlaceholder}
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button 
        type="button" 
        onClick={() => onSearch(term)}
        className="ml-2 hover:scale-110 active:scale-95 transition-transform"
      >
        <img
          src="/icon/search.svg"
          alt="search"
          width={20}
          height={20}
          className="search-icon h-[20px] w-[20px] opacity-80 hover:opacity-100 cursor-pointer"
        />
      </button>
    </div>
  );
}
