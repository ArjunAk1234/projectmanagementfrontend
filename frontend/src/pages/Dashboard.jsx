import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Layout, Plus, Trash2, Edit, LogOut, User, MessageSquare, X, ChevronRight } from 'lucide-react';

const COLUMNS = ['To Do', 'In Progress', 'Done'];

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showModal, setShowModal] = useState({ type: null, data: null });

  // --- PERMISSIONS ---
  const isAdmin = user.role === 'admin';
  const isManager = user.role === 'manager';
  const isDev = user.role === 'developer';
  const isViewer = user.role === 'viewer';

  // Current project ownership check
  const isOwnerOfActive = isAdmin || (activeProject && activeProject.manager?._id === user.id);

  useEffect(() => {
    fetchProjects();
    api.get('/users').then(r => setAllUsers(r.data));
  }, []);

  useEffect(() => {
    if (activeProject?._id) fetchTickets();
  }, [activeProject]);

  const fetchProjects = async () => {
    const res = await api.get('/projects');
    setProjects(res.data);
    if (res.data.length > 0 && !activeProject) setActiveProject(res.data[0]);
  };

  const fetchTickets = async () => {
    const res = await api.get(`/tickets?projectId=${activeProject._id}`);
    setTickets(res.data);
  };

  const onDragEnd = async (result) => {
    if (!result.destination || isViewer) return;
    const ticketId = result.draggableId;
    const newStatus = result.destination.droppableId;
    if (result.source.droppableId === newStatus) return;

    const note = window.prompt(`Update status to ${newStatus}. Optional note:`);
    setTickets(tickets.map(t => t._id === ticketId ? { ...t, status: newStatus } : t));
    await api.put(`/tickets/${ticketId}`, { 
        status: newStatus, 
        commentText: note || `Status changed to ${newStatus}` 
    });
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        <div className="p-8 flex items-center gap-3 border-b border-slate-100">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-100">
            <Layout size={20} />
          </div>
          <span className="font-extrabold text-xl text-indigo-900 tracking-tight italic">BugTracker</span>
        </div>

        <div className="flex-1 p-6 space-y-2 overflow-y-auto">
          <div className="flex justify-between items-center mb-6 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span>Workspaces</span>
            {/* PROJECT CREATE BUTTON FOR ADMIN/MANAGER */}
            {(isAdmin || isManager) && (
              <button 
                onClick={() => setShowModal({ type: 'project' })}
                className="p-1 hover:bg-indigo-50 text-indigo-600 rounded transition"
              >
                <Plus size={18} />
              </button>
            )}
          </div>
          
          {projects.map(p => (
            <button key={p._id} onClick={() => setActiveProject(p)}
              className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-semibold transition-all flex items-center justify-between ${
                activeProject?._id === p._id ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
              }`}>
              {p.title}
              {activeProject?._id === p._id && <ChevronRight size={14} />}
            </button>
          ))}
        </div>

        {/* PROFILE & LOGOUT SECTION */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                {user.name[0]}
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold truncate text-slate-800">{user.name}</p>
                <p className="text-[10px] font-bold text-indigo-500 uppercase">{user.role}</p>
            </div>
            {/* LOGOUT BUTTON */}
            <button 
                onClick={logout} 
                className="text-slate-400 hover:text-red-500 transition p-1"
                title="Sign Out"
            >
                <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN BOARD */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-24 px-10 flex justify-between items-center bg-white border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{activeProject?.title || "Workspace"}</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                Manager: {activeProject?.manager?.name || "None"}
            </p>
          </div>
          <div className="flex gap-4">
              {/* NEW ISSUE BUTTON (Hidden for Developers) */}
              {!isDev && !isViewer && activeProject && (
                <button 
                    onClick={() => setShowModal({ type: 'ticket' })} 
                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition"
                >
                    New Issue
                </button>
              )}
          </div>
        </header>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex-1 p-10 flex gap-8 overflow-x-auto scroll-smooth">
            {COLUMNS.map(status => (
              <Droppable key={status} droppableId={status}>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="w-80 flex flex-col shrink-0">
                    <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] mb-6 px-2">{status}</h3>
                    <div className="flex-1 space-y-4 min-h-[100px]">
                      {tickets.filter(t => t.status === status).map((ticket, index) => (
                        <Draggable key={ticket._id} draggableId={ticket._id} index={index} isDragDisabled={isViewer}>
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                              <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase bg-indigo-50 text-indigo-600">
                                  {ticket.priority}
                                </span>
                                {isOwnerOfActive && (
                                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                    <Trash2 size={14} className="text-slate-300 hover:text-red-500 cursor-pointer" 
                                           onClick={async () => { await api.delete(`/tickets/${ticket._id}`); fetchTickets(); }} />
                                  </div>
                                )}
                              </div>
                              <p className="font-bold text-slate-800 text-sm">{ticket.title}</p>
                              <div className="mt-6 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <User size={12} /> <span className="text-[10px] font-bold">{ticket.assignee?.name}</span>
                                </div>
                                <button onClick={() => setShowModal({ type: 'comments', data: ticket })} className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600">
                                    <MessageSquare size={14} />
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </main>

      {/* --- MODALS --- */}
      {showModal.type === 'project' && (
        <ProjectModal 
          allUsers={allUsers} 
          user={user} 
          onClose={() => setShowModal({ type: null })} 
          onRefresh={fetchProjects} 
        />
      )}
      {showModal.type === 'ticket' && (
        <TicketModal 
          allUsers={allUsers} 
          activeProject={activeProject} 
          onClose={() => setShowModal({ type: null })} 
          onRefresh={fetchTickets} 
        />
      )}
      {showModal.type === 'comments' && (
        <CommentsModal 
          ticket={showModal.data} 
          isManager={isOwnerOfActive} 
          onClose={() => setShowModal({ type: null })} 
        />
      )}
    </div>
  );
}

// Sub-Component: Project Modal
function ProjectModal({ allUsers, user, onClose, onRefresh }) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const teamMembers = allUsers.filter(u => fd.get(`u-${u._id}`)).map(u => u._id);
    await api.post('/projects', { 
      title: fd.get('title'), 
      description: fd.get('description'),
      manager: fd.get('manager') || user.id,
      teamMembers 
    });
    onRefresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-lg shadow-2xl relative animate-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800"><X /></button>
        <h2 className="text-xl font-black text-slate-800 mb-6">Launch Workspace</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="title" placeholder="Project Name" className="w-full bg-slate-50 border p-4 rounded-2xl outline-none" required />
          {user.role === 'admin' && (
            <select name="manager" className="w-full bg-slate-50 border p-4 rounded-2xl outline-none">
              <option value="">Assign Manager</option>
              {allUsers.filter(u => u.role === 'manager').map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          )}
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pt-4">Add Team</p>
          <div className="h-40 overflow-y-auto bg-slate-50 border rounded-2xl p-4">
            {allUsers.filter(u => u.role === 'developer').map(u => (
              <label key={u._id} className="flex items-center gap-3 p-2 hover:bg-white rounded-xl cursor-pointer transition mb-1">
                <input type="checkbox" name={`u-${u._id}`} className="w-4 h-4 rounded text-indigo-600" /> 
                <span className="text-sm font-bold text-slate-600">{u.name}</span>
              </label>
            ))}
          </div>
          <button className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold shadow-xl shadow-indigo-100">Create Project</button>
        </form>
      </div>
    </div>
  );
}

// Sub-Component: Ticket Modal
function TicketModal({ allUsers, activeProject, onClose, onRefresh }) {
    const handleSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const payload = Object.fromEntries(fd);
        payload.projectId = activeProject._id;
        await api.post('/tickets', payload);
        onRefresh();
        onClose();
    };
    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl relative animate-in zoom-in duration-200">
                <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800"><X /></button>
                <h2 className="text-xl font-black text-slate-800 mb-6">New Issue</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="title" placeholder="Summary" className="w-full bg-slate-50 border p-4 rounded-2xl outline-none" required />
                    <select name="priority" className="w-full bg-slate-50 border p-4 rounded-2xl outline-none">
                        <option>Low</option><option>Medium</option><option>High</option><option>Urgent</option>
                    </select>
                    <select name="assignee" className="w-full bg-slate-50 border p-4 rounded-2xl outline-none">
                        <option value="">Select Developer</option>
                        {allUsers.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                    </select>
                    <button className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold">Save Ticket</button>
                </form>
            </div>
        </div>
    );
}

// Sub-Component: Comments Modal
function CommentsModal({ ticket, isManager, onClose }) {
  const [comments, setComments] = useState([]);
  useEffect(() => {
    api.get(`/comments/${ticket._id}`).then(r => setComments(r.data));
  }, [ticket]);

  const handleDelete = async (id) => {
    if(window.confirm("Delete this log?")) {
        await api.delete(`/comments/${id}`);
        setComments(comments.filter(c => c._id !== id));
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-lg shadow-2xl relative">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800 transition"><X size={24} /></button>
        <h2 className="text-xl font-black text-slate-800 mb-2">History & Activity</h2>
        <p className="text-slate-400 text-xs font-bold uppercase mb-8">{ticket.title}</p>
        <div className="max-h-80 overflow-y-auto space-y-4 pr-2">
            {comments.map(c => (
                <div key={c._id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between group">
                    <div>
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{c.userId?.name}</span>
                        <p className="text-sm text-slate-700 font-medium">{c.text}</p>
                    </div>
                    {isManager && (
                        <Trash2 
                            onClick={() => handleDelete(c._id)} 
                            size={14} 
                            className="text-slate-300 hover:text-red-500 cursor-pointer transition opacity-0 group-hover:opacity-100" 
                        />
                    )}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}