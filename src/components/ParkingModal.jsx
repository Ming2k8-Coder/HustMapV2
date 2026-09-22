import React from 'react';

export default function ParkingModal({ parking, type, onClose, t }) {
  if (!parking) return null;

  const isMotor = type === 'uni_motor_parking';

  return (
    <div className="Popup-container absolute bottom-24 left-3 sm:top-20 sm:bottom-auto sm:left-6 bg-[#FDFFF5] border border-amber-200/80 rounded-2xl shadow-2xl p-4 sm:p-6 z-20 w-[92vw] sm:w-[380px] animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-amber-100">
        <h2 className="text-[20px] sm:text-[23px] font-bold text-[#203354]">
          {parking.name}
        </h2>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 font-bold text-xl transition"
        >
          ×
        </button>
      </div>

      <div className="space-y-3 text-[14px] sm:text-[15px] font-medium text-slate-800">
        <div className="font-semibold text-slate-900">
          {isMotor ? t.parking.forMotor : t.parking.forCar}
        </div>

        {/* Operating hours */}
        <div className="flex items-center gap-3">
          <img
            src="/icon/time.svg"
            alt="Hours"
            className="w-8 h-8 shrink-0"
          />
          <div>
            <div className="text-[12px] text-slate-500 font-normal">{t.parking.openHours}</div>
            <div className="font-bold text-[#203354]">{parking.open_hour || '6:00 - 21:00'}</div>
          </div>
        </div>

        {/* Price section */}
        <div className="flex items-start gap-3">
          <img
            src="/icon/price.svg"
            alt="Price"
            className="w-8 h-8 shrink-0 mt-0.5"
          />
          <div className="flex-1">
            <div className="text-[12px] text-slate-500 font-normal">{t.parking.price}</div>
            {isMotor ? (
              <div className="space-y-1 mt-0.5 text-[13px]">
                <div className="font-bold text-slate-900 underline">
                  {t.parking.priceMotorDay}
                </div>
                <ul className="list-disc pl-5 text-slate-700">
                  <li>{t.parking.withStudentCard}</li>
                  <li>{t.parking.withoutStudentCardDay}</li>
                </ul>

                <div className="font-bold text-slate-900 underline mt-1">
                  {t.parking.priceMotorNight}
                </div>
                <ul className="list-disc pl-5 text-slate-700">
                  <li>{t.parking.withStudentCard}</li>
                  <li>{t.parking.withoutStudentCardNight}</li>
                </ul>

                <div className="mt-2 text-[13px] bg-red-50 p-1.5 rounded-lg border border-red-200">
                  <span className="font-bold text-red-800">{t.parking.overnight}</span>
                  <span className="text-red-900 font-semibold">{t.parking.overnightPrice}</span>
                </div>
              </div>
            ) : (
              <div className="mt-1">
                <span className="inline-block bg-green-100 text-green-800 px-2.5 py-1 rounded font-bold text-[14px]">
                  {t.parking.free}
                </span>
                <ul className="list-disc pl-5 mt-2 text-[13px] text-red-700 font-medium space-y-0.5">
                  <li>{t.parking.noOvernight}</li>
                  <li>{t.parking.forStaffAndStudentsOnly}</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
