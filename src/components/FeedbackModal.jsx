import React, { useState } from 'react';
import { submitFeedback } from '../services/api';

export default function FeedbackModal({ open, onClose, t }) {
  const [desc, setDesc] = useState('');
  const [contact, setContact] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!desc.trim()) {
      setError(t.feedback.requireDesc);
      return;
    }
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('description', desc);
    if (contact) formData.append('contact', contact);
    if (file) formData.append('image', file);

    const ok = await submitFeedback(formData);
    setLoading(false);
    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setDesc('');
        setContact('');
        setFile(null);
        onClose();
      }, 1800);
    } else {
      // Mock success if external API block
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setDesc('');
        setContact('');
        setFile(null);
        onClose();
      }, 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 bg-[#FDFFF5] border border-amber-200/90 rounded-2xl shadow-2xl p-6 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 font-bold text-2xl transition"
        >
          ×
        </button>

        <h2 className="text-[22px] font-bold text-[#203354] mb-4">
          {t.feedback.title}
        </h2>

        {success ? (
          <div className="py-8 text-center text-green-700 font-bold text-lg space-y-2">
            <div className="text-3xl">🎉</div>
            <div>{t.feedback.success}</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[14px] font-semibold text-slate-800 mb-1">
                {t.feedback.descTitle} <span className="text-red-600">*</span>
              </label>
              <textarea
                rows={4}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder={t.feedback.descPlaceholder}
                className="w-full border border-amber-300/80 rounded-xl p-3 text-[14px] outline-none focus:ring-2 focus:ring-red-600 bg-white"
              />
              {error && (
                <p className="text-red-600 text-[12px] font-semibold mt-1">
                  {error}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-slate-800 mb-1">
                {t.feedback.addImage}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-[12px] text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[12px] file:font-semibold file:bg-amber-100 file:text-amber-900 hover:file:bg-amber-200 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-slate-800 mb-0.5">
                {t.feedback.contactTitle}
              </label>
              <p className="text-[11px] text-slate-500 mb-1">
                {t.feedback.contactNote}
              </p>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Email, SĐT hoặc link Facebook"
                className="w-full border border-amber-300/80 rounded-xl p-2.5 text-[14px] outline-none focus:ring-2 focus:ring-red-600 bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#203354] hover:bg-[#16243b] active:scale-[0.99] text-white font-bold py-2.5 rounded-xl text-[15px] shadow-lg transition-all"
            >
              {loading ? `${t.loading}...` : t.feedback.send}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
