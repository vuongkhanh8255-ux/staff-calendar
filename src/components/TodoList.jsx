import React, { useState } from 'react';
import { SquareCheckBig, Plus, Trash2, Check, RefreshCw } from 'lucide-react';
import moment from 'moment';

const TodoList = ({ tasks, onToggle, onAdd, onDelete, onMoveOverdue }) => {
  const [newTask, setNewTask] = useState('');
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));

  // Lọc task theo ngày đang chọn
  const tasksForDay = tasks.filter(t => 
    moment(t.start_time).isSame(selectedDate, 'day')
  );

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    onAdd(newTask, selectedDate, 'Personal');
    setNewTask('');
  };

  const isToday = moment(selectedDate).isSame(moment(), 'day');

  return (
    <div className="bg-white rounded-3xl p-4 h-full flex flex-col shadow-xl border-2 border-orange-100 relative overflow-hidden">
      {/* Header trang trí */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-red-400"></div>
      
      {/* Tiêu đề & Chọn ngày */}
      <div className="flex items-center justify-between mb-4 mt-2">
        <div className="flex items-center gap-2">
          <span className="bg-orange-100 text-orange-600 p-2 rounded-lg"><SquareCheckBig size={24} /></span>
          <h3 className="text-orange-900 font-black text-xl uppercase">TO DO</h3>
        </div>
        
        <div className="flex gap-2">
            {/* Nút dời việc cũ (Chỉ hiện khi đang xem Hôm Nay) */}
            {isToday && (
                <button 
                    onClick={onMoveOverdue}
                    title="Dời việc chưa xong từ hôm qua sang hôm nay"
                    className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-lg text-xs font-bold hover:bg-purple-200 transition-colors border border-purple-200"
                >
                    <RefreshCw size={14} /> Dời việc cũ
                </button>
            )}

            <div className="flex items-center bg-orange-50 rounded-lg border border-orange-200 px-2 py-1">
                <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent text-sm font-bold text-orange-800 outline-none cursor-pointer"
                />
                <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded ml-2">
                    {tasksForDay.length} việc
                </span>
            </div>
        </div>
      </div>

      {/* Danh sách công việc */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
        {tasksForDay.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-2 opacity-60">
             <SquareCheckBig size={40} />
             <p className="text-sm font-medium">Chưa có lịch đi đâu...</p>
           </div>
        ) : (
          tasksForDay.map((task) => (
            <div 
              key={task.id} 
              className={`group flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 hover:shadow-md
                ${task.status === 'done' 
                  ? 'bg-slate-50 border-slate-100 opacity-60' 
                  : 'bg-white border-orange-100 hover:border-orange-300'
                }`}
            >
              <button 
                onClick={() => onToggle(task.id, task.status)}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                  ${task.status === 'done' 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'border-orange-300 text-transparent hover:border-orange-500'
                  }`}
              >
                <Check size={14} strokeWidth={4} />
              </button>
              
              <span className={`flex-1 font-semibold text-sm transition-all ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                {task.title}
              </span>

              <button 
                onClick={() => onDelete(task.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Input thêm việc mới */}
      <form onSubmit={handleAdd} className="mt-4 relative">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder={`Thêm việc cho ngày ${moment(selectedDate).format('DD/MM/YYYY')}...`}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-orange-50 border-2 border-orange-100 focus:border-orange-400 focus:bg-white focus:outline-none transition-all placeholder-orange-300 text-sm font-bold text-orange-900"
        />
        <Plus className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" size={20} />
      </form>
    </div>
  );
};

export default TodoList;