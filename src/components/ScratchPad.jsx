import React, { useState, useEffect } from 'react';
import { PenTool } from 'lucide-react';

const ScratchPad = ({ currentUser }) => { // <--- Nhận thêm biến currentUser từ App
  const [note, setNote] = useState('');

  // Mỗi khi đổi người (currentUser thay đổi), tải lại ghi chú của người đó
  useEffect(() => {
    // Tạo key riêng biệt: scratchpad_Phúc Lợi hoặc scratchpad_Kim Ngọc
    const storageKey = `scratchpad_${currentUser}`;
    const savedNote = localStorage.getItem(storageKey);
    setNote(savedNote || ''); // Nếu chưa có thì để trống
  }, [currentUser]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setNote(newValue);
    // Lưu ngay vào key của người hiện tại
    localStorage.setItem(`scratchpad_${currentUser}`, newValue);
  };

  return (
    <div className="bg-[#fefce8] border-2 border-yellow-200 rounded-3xl p-5 h-full flex flex-col shadow-xl shadow-yellow-500/10 relative overflow-hidden">
      {/* Trang trí background */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-300 opacity-20 rounded-bl-full pointer-events-none"></div>

      <div className="flex items-center gap-2 mb-4 relative z-10">
        <span className="bg-yellow-200 text-yellow-700 p-2 rounded-lg"><PenTool size={24} /></span>
        <h3 className="text-yellow-800 font-black text-xl">
            GHI CHÚ: {currentUser.toUpperCase()}
        </h3>
      </div>
      
      <textarea
        className="flex-1 w-full bg-transparent resize-none outline-none text-gray-700 text-base leading-7 placeholder-yellow-800/30 font-medium"
        style={{ backgroundImage: 'linear-gradient(transparent 95%, #eab30820 95%)', backgroundSize: '100% 2rem', lineHeight: '2rem' }}
        placeholder={`Nháp nhanh cho ${currentUser}...`}
        value={note}
        onChange={handleChange}
      />
    </div>
  );
};

export default ScratchPad;