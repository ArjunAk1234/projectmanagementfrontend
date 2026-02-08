
// import React, { useState, useEffect } from 'react';
// import api from './api';
// import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
// import { 
//   Layout, Plus, Trash2, Edit, LogOut, User, CheckCircle, 
//   Search, MessageSquare, X, ChevronRight, Filter 
// } from 'lucide-react';

// const COLUMNS = ['To Do', 'In Progress', 'Done'];

// export default function App() {
//   const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
//   const [projects, setProjects] = useState([]);
//   const [activeProject, setActiveProject] = useState(null);
//   const [tickets, setTickets] = useState([]);
//   const [allUsers, setAllUsers] = useState([]);
//   const [showModal, setShowModal] = useState({ type: null, data: null });

//   useEffect(() => {
//     if (user) {
//       fetchData();
//       api.get('/users').then(r => setAllUsers(r.data));
//     }
//   }, [user]);

//   const fetchData = async () => {
//     const res = await api.get('/projects');
//     setProjects(res.data);
//     if (res.data.length > 0 && !activeProject) setActiveProject(res.data[0]);
//   };

//   useEffect(() => {
//     if (activeProject?._id) fetchTickets();
//   }, [activeProject]);

//   const fetchTickets = async () => {
//     const res = await api.get(`/tickets?projectId=${activeProject._id}`);
//     setTickets(res.data);
//   };

//   const onDragEnd = async (result) => {
//     if (!result.destination) return;
//     const ticketId = result.draggableId;
//     const newStatus = result.destination.droppableId;
//     const oldStatus = result.source.droppableId;

//     if (oldStatus === newStatus) return;

//     const commentText = window.prompt(`Changing status to ${newStatus}. Add an optional note:`);
    
//     // Optimistic UI
//     setTickets(tickets.map(t => t._id === ticketId ? { ...t, status: newStatus } : t));

//     await api.put(`/tickets/${ticketId}`, { 
//       status: newStatus, 
//       commentText: commentText || `Moved to ${newStatus}` 
//     });
//   };

//   if (!user) return <Login onLogin={setUser} />;

//   // CRASH FIX: Guarded project/manager checks
//   const isManagerOfCurrent = user.role === 'admin' || (activeProject && activeProject.manager?._id === user.id);

//   return (
//     <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
//       {/* Sidebar - Light Theme */}
//       <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm">
//         <div className="p-8 flex items-center gap-3 border-b border-slate-100">
//           <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-100"><Layout size={20} /></div>
//           <span className="font-extrabold text-xl tracking-tight text-indigo-900 italic">BugTracker</span>
//         </div>
        
//         <div className="flex-1 p-6 space-y-2 overflow-y-auto">
//           <div className="flex justify-between items-center mb-6 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
//             <span>Workspaces</span>
//             {['admin', 'manager'].includes(user.role) && (
//               <button onClick={() => setShowModal({ type: 'project' })} className="hover:text-indigo-600 transition"><Plus size={18} /></button>
//             )}
//           </div>
//           {projects.map(p => (
//             <button key={p._id} onClick={() => setActiveProject(p)}
//               className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-semibold transition-all flex items-center justify-between ${
//                 activeProject?._id === p._id ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
//               }`}>
//               {p.title}
//               {activeProject?._id === p._id && <ChevronRight size={14} />}
//             </button>
//           ))}
//         </div>

//         <div className="p-6 border-t border-slate-100 bg-slate-50/50">
//           <div className="flex items-center gap-3 p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
//             <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">{user.name[0]}</div>
//             <div className="flex-1 overflow-hidden">
//                 <p className="text-xs font-bold truncate text-slate-800">{user.name}</p>
//                 <p className="text-[10px] font-bold text-indigo-500 uppercase">{user.role}</p>
//             </div>
//             <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="text-slate-400 hover:text-red-500 transition">
//                 <LogOut size={18} />
//             </button>
//           </div>
//         </div>
//       </aside>

//       {/* Main Board */}
//       <main className="flex-1 flex flex-col min-w-0">
//         <header className="h-24 px-10 flex justify-between items-center bg-white border-b border-slate-100 shrink-0">
//           <div>
//             <h2 className="text-2xl font-black text-slate-800 tracking-tight">{activeProject?.title || "Workspace"}</h2>
//             <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Manager: {activeProject?.manager?.name || "System"}</p>
//           </div>
//           <div className="flex gap-4">
//               <div className="relative">
//                 <Search size={16} className="absolute left-3 top-3 text-slate-400" />
//                 <input placeholder="Search..." className="pl-10 pr-4 py-2.5 bg-slate-100 rounded-xl text-sm focus:ring-2 ring-indigo-500 outline-none w-64 border-none" />
//               </div>
//               {user.role !== 'viewer' && activeProject && (
//                 <button onClick={() => setShowModal({ type: 'ticket' })} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition active:scale-95">New Issue</button>
//               )}
//           </div>
//         </header>

//         <DragDropContext onDragEnd={onDragEnd}>
//           <div className="flex-1 p-10 flex gap-8 overflow-x-auto scroll-smooth">
//             {COLUMNS.map(status => (
//               <Droppable key={status} droppableId={status}>
//                 {(provided) => (
//                   <div {...provided.droppableProps} ref={provided.innerRef} className="w-80 flex flex-col shrink-0">
//                     <div className="flex items-center justify-between mb-6 px-2">
//                         <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">{status}</h3>
//                         <span className="bg-slate-200 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold">{tickets.filter(t => t.status === status).length}</span>
//                     </div>
                    
//                     <div className="flex-1 space-y-4 min-h-[100px]">
//                       {tickets.filter(t => t.status === status).map((ticket, index) => (
//                         <Draggable key={ticket._id} draggableId={ticket._id} index={index}>
//                           {(provided) => (
//                             <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
//                               className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group active:shadow-indigo-100">
//                               <div className="flex justify-between items-start mb-4">
//                                 <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase ${
//                                     ticket.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'
//                                 }`}>
//                                   {ticket.priority}
//                                 </span>
//                                 {isManagerOfCurrent && (
//                                   <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
//                                     <Edit size={14} className="text-slate-400 hover:text-indigo-600 cursor-pointer" onClick={() => setShowModal({ type: 'ticket', data: ticket })} />
//                                     <Trash2 size={14} className="text-slate-400 hover:text-red-600 cursor-pointer" onClick={async () => { await api.delete(`/tickets/${ticket._id}`); fetchTickets(); }} />
//                                   </div>
//                                 )}
//                               </div>
//                               <p className="font-bold text-slate-800 text-sm leading-snug">{ticket.title}</p>
                              
//                               <div className="mt-6 flex items-center justify-between">
//                                 <div className="flex items-center gap-2">
//                                     <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">{ticket.assignee?.name[0] || '?'}</div>
//                                     <span className="text-[10px] font-bold text-slate-400">{ticket.assignee?.name || 'Unassigned'}</span>
//                                 </div>
//                                 <button onClick={() => setShowModal({ type: 'comments', data: ticket })} className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition">
//                                     <MessageSquare size={14} />
//                                 </button>
//                               </div>
//                             </div>
//                           )}
//                         </Draggable>
//                       ))}
//                       {provided.placeholder}
//                     </div>
//                   </div>
//                 )}
//               </Droppable>
//             ))}
//           </div>
//         </DragDropContext>
//       </main>

//       {/* --- MODALS --- */}

//       {/* Project Creation */}
//       {showModal.type === 'project' && (
//         <Modal onClose={() => setShowModal({ type: null })}>
//           <form className="space-y-4" onSubmit={async (e) => {
//             e.preventDefault();
//             const fd = new FormData(e.target);
//             const teamMembers = allUsers.filter(u => fd.get(`u-${u._id}`)).map(u => u._id);
//             await api.post('/projects', { 
//               title: fd.get('title'), 
//               description: fd.get('description'),
//               manager: fd.get('manager') || user.id,
//               teamMembers 
//             });
//             setShowModal({ type: null }); fetchData();
//           }}>
//             <h2 className="text-xl font-black text-slate-800 mb-6">Create New Workspace</h2>
//             <input name="title" placeholder="Project Name" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:ring-2 ring-indigo-500" required />
            
//             {user.role === 'admin' && (
//               <select name="manager" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl">
//                 <option value="">Select Manager</option>
//                 {allUsers.filter(u => u.role === 'manager').map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
//               </select>
//             )}

//             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pt-4">Add Team Members</p>
//             <div className="h-48 overflow-y-auto bg-slate-50 border border-slate-100 rounded-2xl p-4">
//               {allUsers.filter(u => u.role === 'developer').map(u => (
//                 <label key={u._id} className="flex items-center gap-3 p-3 hover:bg-white rounded-xl cursor-pointer transition shadow-sm mb-1">
//                   <input type="checkbox" name={`u-${u._id}`} className="w-4 h-4 rounded text-indigo-600" /> 
//                   <span className="text-sm font-bold text-slate-600">{u.name}</span>
//                 </label>
//               ))}
//             </div>
//             <button className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold shadow-xl shadow-indigo-100">Launch Project</button>
//           </form>
//         </Modal>
//       )}

//       {/* Ticket Modal */}
//       {showModal.type === 'ticket' && (
//         <Modal onClose={() => setShowModal({ type: null })}>
//           <form className="space-y-4" onSubmit={async (e) => {
//             e.preventDefault();
//             const fd = new FormData(e.target);
//             const payload = Object.fromEntries(fd);
//             payload.projectId = activeProject?._id;
//             if (showModal.data) await api.put(`/tickets/${showModal.data._id}`, payload);
//             else await api.post('/tickets', payload);
//             setShowModal({ type: null }); fetchTickets();
//           }}>
//             <h2 className="text-xl font-black text-slate-800 mb-6">{showModal.data ? 'Update Issue' : 'Create Issue'}</h2>
//             <input name="title" defaultValue={showModal.data?.title} placeholder="What needs to be fixed?" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl" required />
//             <div className="grid grid-cols-2 gap-4">
//                 <select name="priority" defaultValue={showModal.data?.priority || 'Medium'} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-slate-600">
//                   <option>Low</option><option>Medium</option><option>High</option><option>Urgent</option>
//                 </select>
//                 <select name="assignee" defaultValue={showModal.data?.assignee?._id || ""} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-slate-600">
//                   <option value="">Assignee</option>
//                   {allUsers.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
//                 </select>
//             </div>
//             <button className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold">Save Changes</button>
//           </form>
//         </Modal>
//       )}

//       {/* Comments View */}
//       {showModal.type === 'comments' && (
//         <CommentsModal ticket={showModal.data} onClose={() => setShowModal({ type: null })} />
//       )}
//     </div>
//   );
// }

// // Shared Modal Wrapper
// function Modal({ children, onClose }) {
//   return (
//     <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//       <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-lg shadow-2xl relative animate-in zoom-in duration-200">
//         <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800 transition"><X size={24} /></button>
//         {children}
//       </div>
//     </div>
//   );
// }

// // New Component: Comments List
// function CommentsModal({ ticket, onClose }) {
//     const [comments, setComments] = useState([]);
//     useEffect(() => {
//         api.get(`/comments/${ticket._id}`).then(r => setComments(r.data));
//     }, [ticket]);

//     return (
//         <Modal onClose={onClose}>
//             <h2 className="text-xl font-black text-slate-800 mb-2">History & Activity</h2>
//             <p className="text-slate-400 text-xs font-bold uppercase mb-8">{ticket.title}</p>
//             <div className="max-h-80 overflow-y-auto space-y-4 pr-2">
//                 {comments.length === 0 && <p className="text-slate-400 text-sm py-10 text-center italic">No activity logs yet.</p>}
//                 {comments.map(c => (
//                     <div key={c._id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
//                         <div className="flex justify-between items-center mb-2">
//                             <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{c.userId?.name}</span>
//                             <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</span>
//                         </div>
//                         <p className="text-sm text-slate-700 font-medium leading-relaxed">{c.text}</p>
//                     </div>
//                 ))}
//             </div>
//         </Modal>
//     );
// }

// function Login({ onLogin }) {
//   const [isReg, setIsReg] = useState(false);
//   const handle = async (e) => {
//     e.preventDefault();
//     const fd = Object.fromEntries(new FormData(e.target));
//     try {
//       const res = await api.post(isReg ? '/auth/register' : '/auth/login', fd);
//       if (!isReg) {
//         localStorage.setItem('token', res.data.token);
//         localStorage.setItem('user', JSON.stringify(res.data.user));
//         onLogin(res.data.user);
//       } else { setIsReg(false); alert("Joined Successfully. Sign in."); }
//     } catch(err) { alert("Invalid Credentials"); }
//   };
//   return (
//     <div className="h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
//       <div className="mb-10 text-center">
//           <div className="inline-block bg-indigo-600 p-5 rounded-3xl text-white shadow-2xl shadow-indigo-100 mb-4"><Layout size={32} /></div>
//           <h1 className="text-4xl font-black text-indigo-900 tracking-tighter italic">BugTracker</h1>
//       </div>
//       <form onSubmit={handle} className="bg-white p-12 rounded-[3rem] w-full max-w-md shadow-2xl shadow-slate-200/50 border border-slate-100 animate-in slide-in-from-bottom-8 duration-500">
//         <h2 className="text-2xl font-black text-slate-800 mb-8">{isReg ? 'Start your journey' : 'Sign In'}</h2>
//         {isReg && <input name="name" placeholder="Full Name" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl mb-4 outline-none focus:ring-2 ring-indigo-500 transition" required />}
//         <input name="email" type="email" placeholder="Email Address" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl mb-4 outline-none focus:ring-2 ring-indigo-500 transition" required />
//         <input name="password" type="password" placeholder="Password" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl mb-4 outline-none focus:ring-2 ring-indigo-500 transition" required />
//         {isReg && (
//           <select name="role" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl mb-8 font-bold text-slate-500 outline-none">
//             <option value="manager">Project Manager</option>
//             <option value="developer">Developer</option>
//             <option value="viewer">Viewer</option>
//           </select>
//         )}
//         <button className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-black shadow-2xl shadow-indigo-200 transition hover:bg-indigo-700 active:scale-95">{isReg ? 'Create Account' : 'Sign In'}</button>
//         <button type="button" onClick={() => setIsReg(!isReg)} className="w-full mt-8 text-indigo-600 text-sm font-bold hover:underline tracking-tight">
//           {isReg ? 'Back to sign in' : 'Don’t have an account? Join free'}
//         </button>
//       </form>
//     </div>
//   );
// }
import React, { useState, useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import api from './api';
import { Layout } from 'lucide-react';

function LoginGateway() {
  const { user, login } = useContext(AuthContext);
  const [isReg, setIsReg] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.target));
    try {
      const res = await api.post(isReg ? '/auth/register' : '/auth/login', fd);
      if (!isReg) login(res.data.user, res.data.token);
      else { setIsReg(false); alert("Signed up! Log in now."); }
    } catch (err) { alert("Auth Error"); }
  };

  if (user) return <Dashboard />;

  return (
    <div className="h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="mb-10 text-center"><div className="inline-block bg-indigo-600 p-5 rounded-3xl text-white shadow-2xl mb-4"><Layout size={32} /></div><h1 className="text-4xl font-black text-indigo-900 tracking-tighter italic">BugTracker</h1></div>
      <form onSubmit={handleSubmit} className="bg-white p-12 rounded-[3rem] w-full max-w-md shadow-2xl border border-slate-100">
        <h2 className="text-2xl font-black text-slate-800 mb-8">{isReg ? 'Join Us' : 'Sign In'}</h2>
        {isReg && <input name="name" placeholder="Name" className="w-full bg-slate-50 border p-4 rounded-2xl mb-4" required />}
        <input name="email" type="email" placeholder="Email" className="w-full bg-slate-50 border p-4 rounded-2xl mb-4" required />
        <input name="password" type="password" placeholder="Password" className="w-full bg-slate-50 border p-4 rounded-2xl mb-4" required />
        {isReg && (
          <select name="role" className="w-full bg-slate-50 border p-4 rounded-2xl mb-8 font-bold text-slate-500">
            <option value="manager">Manager</option><option value="developer">Developer</option><option value="viewer">Viewer</option>
          </select>
        )}
        <button className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-black shadow-2xl">{isReg ? 'Create' : 'Enter'}</button>
        <button type="button" onClick={() => setIsReg(!isReg)} className="w-full mt-8 text-indigo-600 text-sm font-bold tracking-tight">{isReg ? 'Sign in instead' : 'Join for free'}</button>
      </form>
    </div>
  );
}

export default function App() { return ( <AuthProvider> <LoginGateway /> </AuthProvider> ); }