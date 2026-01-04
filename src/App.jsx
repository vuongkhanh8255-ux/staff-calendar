import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import TaskTable from './components/TaskTable'
import TodoList from './components/TodoList'
import ScheduleList from './components/ScheduleList' 
import ScratchPad from './components/ScratchPad'
import CalendarPro from './components/CalendarPro'
import TetFallingEffect from './components/TetFallingEffect' 
import { LayoutGrid, Flower, Zap, ZapOff, Heart, User, Lock } from 'lucide-react';
import { arrayMove } from '@dnd-kit/sortable'; 

function App() {
  const [tasks, setTasks] = useState([])
  const [viewMode, setViewMode] = useState('calendar')
  const [showEffect, setShowEffect] = useState(true) 
  const [currentUser, setCurrentUser] = useState('Kim Ngọc') // Mặc định vào là nhân viên

  // --- HÀM CHUYỂN USER ---
  const switchUser = (targetUser) => {
    if (targetUser === currentUser) return;
    const pass = prompt(`🔒 Nhập mật khẩu của ${targetUser}:`);
    
    if (targetUser === 'Phúc Lợi' && pass === 'PHUCLOINE') {
        setCurrentUser('Phúc Lợi');
        alert(`✅ Chào Phúc Lợi!`);
    } else if (targetUser === 'Kim Ngọc' && pass === 'KIMNGOCNE') {
        setCurrentUser('Kim Ngọc');
        alert(`✅ Chào Kim Ngọc!`);
    } else {
        alert('❌ Sai mật khẩu!');
    }
  }

  // --- LẤY DỮ LIỆU (CHỈ LẤY TỪ staff_tasks) ---
  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('staff_tasks') // <--- KHÓA CỨNG VÀO BẢNG NHÂN VIÊN
      .select('*')
      .order('position', { ascending: true }) 
      .order('created_at', { ascending: false })
    if (error) console.log('Lỗi:', error)
    else setTasks(data || [])
  }

  // --- CÁC HÀM XỬ LÝ KHÁC (Cũng trỏ vào staff_tasks hết) ---
  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'todo' ? 'done' : 'todo';
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
    await supabase.from('staff_tasks').update({ status: newStatus }).eq('id', id)
    fetchTasks();
  }

  const addTask = async (title, customDate, category = 'Personal', color = null) => {
    if (!title.trim()) return;
    try {
      let finalDate = new Date().toISOString();
      if (customDate) {
        const dateObj = new Date(customDate);
        dateObj.setHours(9, 0, 0, 0);
        finalDate = dateObj.toISOString();
      }
      let finalColor = color ? color : (category === 'Schedule' ? '#16a34a' : '#ea580c');
      
      const newTask = { 
        title: title, status: 'todo', category: category, 
        owner: currentUser, // Lưu tên nhân viên
        color: finalColor, start_time: finalDate, 
        created_at: new Date().toISOString(), position: 0 
      };

      const { error } = await supabase.from('staff_tasks').insert([newTask]);
      if (error) alert("❌ Lỗi: " + error.message);
      else fetchTasks();
    } catch (err) { alert("❌ Lỗi Code: " + err.message); }
  }

  const updateTask = async (id, title, color) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, title, color } : t));
    const { error } = await supabase.from('staff_tasks').update({ title, color }).eq('id', id);
    if (error) alert("Lỗi: " + error.message); else fetchTasks();
  }

  const deleteTask = async (id) => {
    if (window.confirm('🗑️ Xóa nhé?')) {
        const { error } = await supabase.from('staff_tasks').delete().eq('id', id);
        if (!error) fetchTasks(); 
    }
  }

  const handleTaskReorder = async (activeId, overId, dayEvents) => {
    const oldIndex = dayEvents.findIndex(t => t.id === activeId);
    const newIndex = dayEvents.findIndex(t => t.id === overId);
    const newOrder = arrayMove(dayEvents, oldIndex, newIndex);
    const updates = newOrder.map((task, index) => ({ id: task.id, position: index }));
    const newTasks = tasks.map(t => {
        const update = updates.find(u => u.id === t.id);
        return update ? { ...t, position: update.position } : t;
    });
    setTasks(newTasks);
    for (const item of updates) {
        await supabase.from('staff_tasks').update({ position: item.position }).eq('id', item.id);
    }
  };

  useEffect(() => { fetchTasks() }, [])

  // LỌC DATA: Chỉ hiện của người đang đăng nhập hoặc chưa có chủ (nếu có)
  const currentTasks = tasks.filter(t => t.owner === currentUser || (!t.owner && currentUser === 'Kim Ngọc')); 
  const todoTasks = currentTasks.filter(t => t.category !== 'Schedule');
  const scheduleTasks = currentTasks.filter(t => t.category === 'Schedule');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-300 to-yellow-200 p-2 md:p-4 font-sans text-slate-800 pb-20 relative overflow-x-hidden">
      {showEffect && <TetFallingEffect />}
      
      {/* HEADER */}
      <div className="mb-4 flex flex-col md:flex-row items-center justify-between relative z-10 gap-3 md:gap-0">
        <h1 className="text-xl md:text-2xl font-extrabold text-white drop-shadow-md flex items-center gap-2 uppercase">
          <Flower className="text-yellow-300 animate-spin-slow" size={24} />
          PHÚC LỢI <Heart className="text-red-500 fill-red-500 animate-pulse" size={20} /> KIM NGỌC
        </h1>
        <div className="flex items-center gap-2 w-full md:w-auto justify-center">
            <button onClick={() => setShowEffect(!showEffect)} className="bg-white/20 hover:bg-white/40 text-white p-1.5 rounded-full transition-all backdrop-blur-md border border-white/30 shadow-sm">
               {showEffect ? <Zap size={18} className="text-yellow-300 fill-yellow-300"/> : <ZapOff size={18}/>}
            </button>
            <div className="text-xs font-bold text-orange-600 bg-yellow-100 px-3 py-1.5 rounded-full shadow border border-orange-200 whitespace-nowrap">
            🧧 {new Date().toLocaleDateString('vi-VN')}
            </div>
        </div>
      </div>

      {/* CHUYỂN USER */}
      <div className="flex justify-center mb-6 relative z-10">
        <div className="bg-white/80 backdrop-blur p-1 rounded-full shadow-lg flex gap-1 border border-white">
          <button onClick={() => switchUser('Phúc Lợi')} className={`px-6 py-2 rounded-full font-bold transition-all flex items-center gap-2 ${currentUser === 'Phúc Lợi' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}>
            {currentUser === 'Phúc Lợi' ? <User size={18} /> : <Lock size={16} />} Phúc Lợi
          </button>
          <button onClick={() => switchUser('Kim Ngọc')} className={`px-6 py-2 rounded-full font-bold transition-all flex items-center gap-2 ${currentUser === 'Kim Ngọc' ? 'bg-pink-500 text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}>
            {currentUser === 'Kim Ngọc' ? <User size={18} /> : <Lock size={16} />} Kim Ngọc
          </button>
        </div>
      </div>

      {/* GIAO DIỆN CHÍNH */}
      <div className="flex flex-col md:grid md:grid-cols-5 gap-4 mb-4 h-auto md:h-[450px] relative z-10">
        <div className="w-full md:col-span-2 h-[400px] md:h-full min-h-0 drop-shadow-xl"><TodoList tasks={todoTasks} onToggle={toggleStatus} onAdd={addTask} onDelete={deleteTask} /></div>
        <div className="w-full md:col-span-1 h-[300px] md:h-full min-h-0 drop-shadow-xl"><ScheduleList tasks={scheduleTasks} onAdd={addTask} onDelete={deleteTask} /></div>
        <div className="w-full md:col-span-2 h-[300px] md:h-full min-h-0 drop-shadow-xl"><ScratchPad currentUser={currentUser} /></div>
      </div>

      <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl border-2 border-white/50 flex flex-col min-h-[600px] relative z-10">
        <div className="px-4 py-3 border-b border-orange-100 flex flex-col md:flex-row justify-between items-center bg-orange-50 shrink-0 gap-3 md:gap-0">
          <h2 className="font-bold text-orange-800 flex items-center gap-2"><LayoutGrid size={18} className="text-orange-600"/> Lịch của: <span className={currentUser === 'Phúc Lợi' ? 'text-blue-600' : 'text-pink-600'}>{currentUser}</span></h2>
          <div className="flex bg-orange-200/50 p-1 rounded-lg w-full md:w-auto justify-center">
            <button onClick={() => setViewMode('calendar')} className={`flex-1 md:flex-none px-3 py-1 text-xs font-bold rounded transition-all ${viewMode === 'calendar' ? 'bg-white text-orange-600 shadow' : 'text-orange-700/60'}`}>Lịch</button>
            <button onClick={() => setViewMode('table')} className={`flex-1 md:flex-none px-3 py-1 text-xs font-bold rounded transition-all ${viewMode === 'table' ? 'bg-white text-orange-600 shadow' : 'text-orange-700/60'}`}>Bảng</button>
          </div>
        </div>
        <div className="p-2 md:p-3 bg-slate-900 overflow-x-hidden">
            {viewMode === 'calendar' ? <CalendarPro tasks={tasks} onAdd={addTask} onUpdate={updateTask} onDelete={deleteTask} onReorder={handleTaskReorder} /> : <TaskTable tasks={tasks} />}
        </div>
      </div>
    </div>
  )
}
export default App