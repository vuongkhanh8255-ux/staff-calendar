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
  const [currentUser, setCurrentUser] = useState('Phúc Lợi') // Mặc định Phúc Lợi

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

  // --- LẤY DỮ LIỆU ---
  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('staff_tasks')
      .select('*')
      .eq('owner', currentUser)
      .order('position', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) console.log('Lỗi tải data:', error)
    else setTasks(data || [])
  }

  useEffect(() => { fetchTasks() }, [currentUser])

  // --- TÍNH NĂNG MỚI: DỜI VIỆC CŨ SANG HÔM NAY ---
  const moveOverdueTasks = async () => {
    // 1. Xác định mốc thời gian "Đầu ngày hôm nay" (00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 2. Lọc ra những việc: Của mình + Chưa xong + Ngày < Hôm nay + Không phải Lịch trình
    const overdueTasks = tasks.filter(t => {
      const taskDate = new Date(t.start_time);
      return t.owner === currentUser &&
        t.status === 'todo' &&
        t.category !== 'Schedule' &&
        taskDate < today;
    });

    if (overdueTasks.length === 0) {
      alert("🎉 Xuất sắc! Không có việc tồn đọng nào.");
      return;
    }

    if (!confirm(`Phát hiện ${overdueTasks.length} việc chưa xong từ quá khứ. Dời sang hôm nay nha?`)) return;

    // 3. Chuẩn bị thời gian mới (9h sáng hôm nay)
    const newTime = new Date();
    newTime.setHours(9, 0, 0, 0);
    const newTimeStr = newTime.toISOString();

    // 4. Update lên Database
    // Vì Supabase v1/v2 update nhiều dòng hơi cực, ta dùng vòng lặp cho chắc ăn (với số lượng ít)
    let errorCount = 0;
    for (const task of overdueTasks) {
      const { error } = await supabase
        .from('staff_tasks')
        .update({ start_time: newTimeStr })
        .eq('id', task.id);
      if (error) errorCount++;
    }

    if (errorCount === 0) {
      alert("✅ Đã dời toàn bộ việc sang hôm nay!");
      fetchTasks(); // Tải lại dữ liệu mới
    } else {
      alert("⚠️ Có lỗi khi dời việc, vui lòng thử lại.");
    }
  }
  // ------------------------------------------------

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
        owner: currentUser,
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

  const todoTasks = tasks.filter(t => t.category !== 'Schedule');
  const scheduleTasks = tasks.filter(t => t.category === 'Schedule');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-200 via-red-100 to-yellow-200 font-sans text-slate-800 pb-20 relative overflow-x-hidden selection:bg-orange-200 selection:text-orange-900 text-base md:text-lg">
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Warm Tet Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-300/40 rounded-full blur-[130px] mix-blend-multiply animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-300/40 rounded-full blur-[130px] mix-blend-multiply animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-yellow-300/40 rounded-full blur-[130px] mix-blend-multiply animate-blob animation-delay-4000"></div>
      </div>

      {showEffect && <TetFallingEffect />}

      <div className="max-w-[1600px] mx-auto p-4 relative z-10">
        {/* HEADER */}
        <header className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/60 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60">
              <Flower className="text-orange-600 animate-spin-slow" size={28} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                PHÚC LỢI <Heart className="text-red-500 fill-red-500 animate-pulse" size={24} /> KIM NGỌC
              </h1>
              <p className="text-slate-600 text-sm font-bold">Chúc mừng năm mới - Vạn sự như ý!</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/40 shadow-sm">
            <div className="flex bg-white/60 rounded-xl p-1 shadow-inner">
              <button
                onClick={() => switchUser('Phúc Lợi')}
                className={`px-5 py-2 rounded-lg font-bold text-sm transition-all duration-300 flex items-center gap-2 ${currentUser === 'Phúc Lợi' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}
              >
                <User size={16} /> Phúc Lợi
              </button>
              <button
                onClick={() => switchUser('Kim Ngọc')}
                className={`px-5 py-2 rounded-lg font-bold text-sm transition-all duration-300 flex items-center gap-2 ${currentUser === 'Kim Ngọc' ? 'bg-white text-pink-500 shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}
              >
                <User size={16} /> Kim Ngọc
              </button>
            </div>

            <div className="h-8 w-[1px] bg-slate-300 mx-1"></div>

            <div className="text-sm font-bold text-slate-700 bg-white/60 px-4 py-2 rounded-xl shadow-sm whitespace-nowrap">
              🧧 {new Date().toLocaleDateString('vi-VN')}
            </div>

            <button onClick={() => setShowEffect(!showEffect)} className="p-2.5 bg-white/60 hover:bg-white text-slate-600 rounded-xl transition-all shadow-sm">
              {showEffect ? <Zap size={18} className="text-amber-500 fill-amber-500" /> : <ZapOff size={18} />}
            </button>
          </div>
        </header>

        {/* GIAO DIỆN CHÍNH - Tăng chiều cao lên 700px */}
        <div className="flex flex-col md:grid md:grid-cols-5 gap-6 mb-8 h-auto md:h-[700px]">
          {/* Truyền hàm moveOverdueTasks vào TodoList */}
          <div className="w-full md:col-span-2 h-[600px] md:h-full min-h-0">
            <TodoList
              tasks={todoTasks}
              onToggle={toggleStatus}
              onAdd={addTask}
              onDelete={deleteTask}
              onMoveOverdue={moveOverdueTasks}
            />
          </div>

          <div className="w-full md:col-span-1 h-[400px] md:h-full min-h-0"><ScheduleList tasks={scheduleTasks} onAdd={addTask} onDelete={deleteTask} /></div>
          <div className="w-full md:col-span-2 h-[400px] md:h-full min-h-0"><ScratchPad currentUser={currentUser} /></div>
        </div>

        <div className="glass-panel rounded-3xl overflow-hidden flex flex-col min-h-[700px]">
          <div className="px-6 py-4 border-b border-white/50 flex flex-col md:flex-row justify-between items-center bg-white/30 gap-4 md:gap-0">
            <h2 className="font-bold text-slate-700 text-lg flex items-center gap-2"><LayoutGrid size={20} className="text-indigo-500" /> Lịch trình của <span className={currentUser === 'Phúc Lợi' ? 'text-blue-600' : 'text-pink-600'}>{currentUser}</span></h2>
            <div className="flex bg-slate-100/50 p-1 rounded-xl">
              <button onClick={() => setViewMode('calendar')} className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Lịch</button>
              <button onClick={() => setViewMode('table')} className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Bảng</button>
            </div>
          </div>
          <div className="p-4 bg-white/20 flex-1">
            {viewMode === 'calendar' ? <CalendarPro tasks={tasks} onAdd={addTask} onUpdate={updateTask} onDelete={deleteTask} onReorder={handleTaskReorder} /> : <TaskTable tasks={tasks} />}
          </div>
        </div>
      </div>
    </div>
  )
}
export default App