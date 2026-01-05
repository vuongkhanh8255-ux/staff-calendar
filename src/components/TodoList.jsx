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
    <div className="glass-panel rounded-3xl p-6 h-full flex flex-col relative overflow-hidden group border border-white/60 shadow-xl">
      {/* Decorative */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-200/50 rounded-full blur-3xl group-hover:bg-orange-300/50 transition-all duration-700"></div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-xl shadow-sm">
            <SquareCheckBig size={24} className="stroke-[2.5px]" />
          </div>
          <h3 className="text-slate-800 font-extrabold text-xl tracking-tight uppercase">TO DO LIST</h3>
        </div>

        <div className="flex items-center gap-2">
          {isToday && (
            <button
              onClick={onMoveOverdue}
              title="Dời việc chưa xong"
              className="p-2.5 bg-white/50 text-purple-600 rounded-xl hover:bg-purple-100 transition-all border border-purple-100 shadow-sm"
            >
              <RefreshCw size={18} />
            </button>
          )}

          <div className="flex items-center bg-white/80 rounded-xl border border-white/60 px-4 py-2 shadow-sm backdrop-blur-sm">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-base font-bold text-slate-700 outline-none cursor-pointer"
            />
            <div className="h-5 w-[1.5px] bg-slate-300 mx-3"></div>
            <span className="text-orange-600 text-sm font-black bg-orange-100/50 px-2.5 py-1 rounded-lg">
              {tasksForDay.length}
            </span>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {tasksForDay.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3 opacity-60">
            <div className="p-5 bg-slate-100 rounded-full"><SquareCheckBig size={40} /></div>
            <p className="text-base font-semibold">Chưa có nhiệm vụ nào...</p>
          </div>
        ) : (
          tasksForDay.map((task) => (
            <div
              key={task.id}
              className={`group/item flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300
                ${task.status === 'done'
                  ? 'bg-slate-50/60 border-slate-100 opacity-70'
                  : 'bg-white/70 border-white/60 hover:border-orange-300 hover:bg-white hover:shadow-lg hover:shadow-orange-500/10 hover:-translate-y-0.5'
                }`}
            >
              <button
                onClick={() => onToggle(task.id, task.status)}
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 shrink-0
                  ${task.status === 'done'
                    ? 'bg-green-500 border-green-500 text-white scale-110'
                    : 'border-orange-300 text-transparent hover:border-orange-500'
                  }`}
              >
                <Check size={14} strokeWidth={4} />
              </button>

              <span className={`flex-1 font-semibold text-lg transition-all ${task.status === 'done' ? 'text-slate-500 line-through decoration-2 decoration-slate-300' : 'text-slate-800'}`}>
                {task.title}
              </span>

              <button
                onClick={() => onDelete(task.id)}
                className="opacity-0 group-hover/item:opacity-100 p-2.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleAdd} className="mt-6 relative z-10">
        <div className="relative group/input">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Thêm nhiệm vụ mới..."
            className="w-full pl-12 pr-5 py-4 rounded-2xl bg-white/60 border border-white/80 focus:bg-white focus:border-orange-300 focus:ring-4 focus:ring-orange-100 focus:outline-none transition-all placeholder-slate-400 text-base font-semibold text-slate-800 shadow-sm"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-orange-500 text-white p-1.5 rounded-lg shadow-md transition-all group-focus-within/input:scale-110 group-focus-within/input:rotate-90">
            <Plus size={16} strokeWidth={3} />
          </div>
        </div>
      </form>
    </div>
  );
};

export default TodoList;