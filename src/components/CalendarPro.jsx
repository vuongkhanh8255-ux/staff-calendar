import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/vi';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { X, Trash2, Save, Check } from 'lucide-react';
import SortableDayView from './SortableDayView'; 

moment.updateLocale('vi', { week: { dow: 1, doy: 4 } });
const localizer = momentLocalizer(moment);

const COLORS = [
    { code: '#ea580c', name: 'Cam' },
    { code: '#16a34a', name: 'Xanh lá' },
    { code: '#dc2626', name: 'Đỏ' },
    { code: '#2563eb', name: 'Xanh dương' },
    { code: '#9333ea', name: 'Tím' },
    { code: '#db2777', name: 'Hồng' },
];

const CalendarPro = ({ tasks, onAdd, onUpdate, onDelete, onReorder }) => {
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState({ id: null, title: '', start: null, color: '#ea580c' });

  const events = tasks.map(task => ({
      id: task.id, title: task.title, 
      start: new Date(task.start_time), end: new Date(task.start_time),
      status: task.status, color: task.color || (task.category === 'Schedule' ? '#16a34a' : '#ea580c'),
      position: task.position, allDay: true 
  }));

  const eventStyleGetter = (event) => {
    const isDone = event.status === 'done';
    return {
      style: {
        backgroundColor: isDone ? '#475569' : event.color,
        borderRadius: '3px',
        opacity: isDone ? 0.7 : 1,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '0.75em', // Chữ nhỏ lại xíu trên mobile
        fontWeight: '500',
        marginBottom: '1px',
        padding: '1px 4px',
        textDecoration: isDone ? 'line-through' : 'none'
      }
    };
  };

  const handleSelectSlot = ({ start }) => {
    setEditData({ id: null, title: '', start: start, color: '#ea580c' });
    setModalOpen(true);
  };

  const handleSelectEvent = (event) => {
    setEditData({ id: event.id, title: event.title, start: event.start, color: event.color });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!editData.title.trim()) return;
    if (editData.id) onUpdate(editData.id, editData.title, editData.color);
    else onAdd(editData.title, editData.start, 'Personal', editData.color);
    setModalOpen(false);
  };

  const handleDeleteInModal = () => {
    if (editData.id) { onDelete(editData.id); setModalOpen(false); }
  };

  const CustomDayViewWrapper = (props) => {
    return (
        <SortableDayView 
          {...props} 
          onOrderChange={onReorder}
          onSelectEvent={(evt) => {
              setEditData({ id: evt.id, title: evt.title, start: evt.start, color: evt.color });
              setModalOpen(true);
          }} 
        />
    );
  };
  CustomDayViewWrapper.title = SortableDayView.title;
  CustomDayViewWrapper.navigate = SortableDayView.navigate;

  return (
    <div className="w-full bg-slate-900 rounded-xl shadow-inner relative">
      <style>{`
        /* CSS RESPONSIVE CHO LỊCH */
        .rbc-calendar { font-family: inherit; color: #e2e8f0; }
        .rbc-month-view, .rbc-header { border-color: #334155 !important; }
        .rbc-day-bg + .rbc-day-bg { border-left: 1px solid #334155; }
        .rbc-today { background-color: rgba(234, 88, 12, 0.1); }
        .rbc-off-range-bg { background-color: #0f172a; }
        
        /* Chỉnh thanh công cụ cho Mobile */
        .rbc-toolbar {
            flex-direction: column; /* Xếp dọc trên mobile */
            gap: 10px;
            margin-bottom: 15px;
        }
        @media (min-width: 768px) {
            .rbc-toolbar { flex-direction: row; gap: 0; } /* Tablet trở lên thì ngang */
        }
        
        .rbc-toolbar button { 
            color: #cbd5e1; border: 1px solid #475569; 
            font-size: 0.75rem; padding: 6px 10px; flex: 1; /* Nút to ra dễ bấm */
        }
        .rbc-toolbar button.rbc-active { background-color: #ea580c; color: white; border-color: #ea580c; }
        .rbc-header { font-size: 0.7rem; padding: 8px 2px; } /* Chữ tiêu đề nhỏ lại */
      `}</style>
      
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start" endAccessor="end"
        style={{ height: '80vh' }} // Chiều cao linh hoạt theo màn hình
        view={view} onView={setView}
        date={date} onNavigate={setDate}
        views={{ month: true, week: true, day: CustomDayViewWrapper }}
        popup={true} // Bật popup nếu quá nhiều việc 1 ngày
        eventPropGetter={eventStyleGetter}
        selectable={true} 
        onSelectSlot={handleSelectSlot} 
        onSelectEvent={handleSelectEvent} 
      />

      {/* --- MODAL RESPONSIVE --- */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-orange-500 p-4 flex justify-between items-center">
                    <h3 className="text-white font-bold text-lg">
                        {editData.id ? '✏️ Sửa' : '✨ Thêm'}
                    </h3>
                    <button onClick={() => setModalOpen(false)} className="text-white/80 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Việc cần làm</label>
                        <input 
                            type="text" autoFocus
                            value={editData.title}
                            onChange={(e) => setEditData({...editData, title: e.target.value})}
                            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                            className="w-full text-lg font-semibold border-b-2 border-gray-200 focus:border-orange-500 outline-none py-1 text-gray-800"
                            placeholder="Nhập..."
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Màu sắc</label>
                        <div className="flex flex-wrap gap-3">
                            {COLORS.map((c) => (
                                <button
                                    key={c.code}
                                    onClick={() => setEditData({...editData, color: c.code})}
                                    className={`w-8 h-8 rounded-full shadow-sm flex items-center justify-center transition-all ${editData.color === c.code ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                                    style={{ backgroundColor: c.code }}
                                >
                                    {editData.color === c.code && <Check size={16} className="text-white" strokeWidth={3} />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
                    {editData.id ? (
                        <button onClick={handleDeleteInModal} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 size={20} /></button>
                    ) : <div></div>}
                    <button onClick={handleSave} className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2 rounded-xl font-bold shadow-lg">
                        <Save size={18} /> Lưu
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPro;