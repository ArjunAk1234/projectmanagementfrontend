import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Layout, Plus, Trash2, Edit, LogOut, User, MessageSquare, X, ChevronRight, Settings } from 'lucide-react';

const COLUMNS = ['To Do', 'In Progress', 'Done'];

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showModal, setShowModal] = useState({ type: null, data: null });

  // Permissions Helpers
  const isAdmin = user.role === 'admin';
  const isManager = user.role === 'manager';
  const isViewer = user.role === 'viewer';
  const isDev = user.role === 'developer';

  // Check if current user is the "Owner" (Manager of the active project or Admin)
  const isProjectOwner = isAdmin || (activeProject && activeProject.manager?._id === user.id);

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
// ... (Inside the Dashboard component's main logic) ...

const handleDeleteProject = async (id) => {
  const confirmMsg = "Warning: This will permanently delete the project, all its tickets, and all comments. Continue?";
  
  if (window.confirm(confirmMsg)) {
    try {
      await api.delete(`/projects/${id}`);
      
      // Refresh project list
      const updatedProjects = projects.filter(p => p._id !== id);
      setProjects(updatedProjects);
      
      // If we deleted the active project, switch to another one or null
      if (activeProject?._id === id) {
        setActiveProject(updatedProjects.length > 0 ? updatedProjects[0] : null);
      }
      
      alert("Project deleted successfully.");
    } catch (err) {
      alert(err.response?.data?.msg || "Error deleting project");
    }
  }
}
  const onDragEnd = async (result) => {
    if (!result.destination || isViewer) return;
    const ticketId = result.draggableId;
    const newStatus = result.destination.droppableId;
    
    const note = window.prompt(`Status: ${newStatus}. Note?`);
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
        <div className="p-8 flex items-center gap-3 border-b border-slate-100 font-black text-xl text-indigo-900 italic">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg"><Layout size={20} /></div> BugTracker
        </div>
        
        <div className="flex-1 p-6 space-y-2 overflow-y-auto">
          <div className="flex justify-between items-center mb-6 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span>Workspaces</span>
            {(isAdmin || isManager) && (
              <button onClick={() => setShowModal({ type: 'project', data: null })} className="hover:text-indigo-600 transition"><Plus size={18} /></button>
            )}
          </div>
          {/* {projects.map(p => (
            <button key={p._id} onClick={() => setActiveProject(p)} className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-semibold flex items-center justify-between ${activeProject?._id === p._id ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
              {p.title} {activeProject?._id === p._id && <ChevronRight size={14} />}
            </button>
          ))} */}
          
{projects.map(p => (
  <div key={p._id} className="group flex items-center gap-2 pr-2">
    <button 
      onClick={() => setActiveProject(p)} 
      className={`flex-1 text-left px-4 py-3 rounded-2xl text-sm font-semibold flex items-center justify-between transition-all ${
        activeProject?._id === p._id ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
      }`}
    >
      {p.title} 
      {activeProject?._id === p._id && <ChevronRight size={14} />}
    </button>

    {/* DELETE PROJECT BUTTON */}
    {(isAdmin || (isManager && p.manager?._id === user.id)) && (
      <button 
        onClick={(e) => {
          e.stopPropagation(); // Prevent switching to the project when clicking delete
          handleDeleteProject(p._id);
        }}
        className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"
        title="Delete Project"
      >
        <Trash2 size={16} />
      </button>
    )}
  </div>
))}

;
        </div>

        <div className="p-6 border-t bg-slate-50/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">{user.name[0]}</div>
          <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold truncate">{user.name}</p>
              <p className="text-[10px] font-bold text-indigo-500 uppercase">{user.role}</p>
          </div>
          <button onClick={logout} className="text-slate-400 hover:text-red-500 transition"><LogOut size={20} /></button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-24 px-10 flex justify-between items-center bg-white border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-4">
            <div className="text-left">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{activeProject?.title}</h2>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Manager: {activeProject?.manager?.name}</p>
            </div>
            {/* Project Edit Settings - Only for Owner */}
            {isProjectOwner && (
              <button onClick={() => setShowModal({ type: 'project', data: activeProject })} className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 transition"><Settings size={18} /></button>
            )}
          </div>
          <div className="flex gap-4">
              {/* Only Manager/Admin can create new issues */}
              {!isDev && !isViewer && isProjectOwner && (
                <button onClick={() => setShowModal({ type: 'ticket', data: null })} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition">New Issue</button>
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
                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                              <div className="flex justify-between items-start mb-4">
                                <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase ${ticket.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                  {ticket.priority}
                                </span>
                                {/* Manage Ticket - Only for Owner */}
                                {isProjectOwner && (
                                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                    <Edit size={14} className="text-slate-300 hover:text-indigo-600 cursor-pointer" onClick={() => setShowModal({ type: 'ticket', data: ticket })} />
                                    <Trash2 size={14} className="text-slate-300 hover:text-red-500 cursor-pointer" onClick={async () => { if(window.confirm("Delete?")){ await api.delete(`/tickets/${ticket._id}`); fetchTickets(); }}} />
                                  </div>
                                )}
                              </div>
                              <p className="font-bold text-slate-800 text-sm text-left leading-snug">{ticket.title}</p>
                              <div className="mt-6 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-400">
                                  <User size={12} /> <span className="text-[10px] font-bold">{ticket.assignee?.name}</span>
                                </div>
                                <button onClick={() => setShowModal({ type: 'comments', data: ticket })} className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition">
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

      {/* --- MODAL COMPONENTS (Defined in same file to fix ReferenceError) --- */}
      
      {showModal.type === 'comments' && (
        <CommentsModal 
          ticket={showModal.data} 
          isManager={isProjectOwner} 
          onClose={() => setShowModal({ type: null })} 
        />
      )}

      {showModal.type === 'project' && (
        <ProjectModal 
          data={showModal.data} 
          allUsers={allUsers} 
          user={user} 
          onClose={() => setShowModal({ type: null })} 
          onRefresh={fetchProjects} 
        />
      )}

      {showModal.type === 'ticket' && (
        <TicketModal 
          data={showModal.data} 
          allUsers={allUsers} 
          activeProject={activeProject} 
          onClose={() => setShowModal({ type: null })} 
          onRefresh={fetchTickets} 
        />
      )}
    </div>
  );
}

// 1. Comments Modal
function CommentsModal({ ticket, isManager, onClose }) {
  const [comments, setComments] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    api.get(`/comments/${ticket._id}`).then(r => setComments(r.data));
  }, [ticket]);

  const handleDelete = async (id) => {
    if(window.confirm("Delete this activity log?")) {
        await api.delete(`/comments/${id}`);
        setComments(comments.filter(c => c._id !== id));
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-lg shadow-2xl relative animate-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800 transition"><X size={24} /></button>
        <h2 className="text-xl font-black text-slate-800 mb-2 text-left tracking-tight">Activity Log</h2>
        <p className="text-slate-400 text-xs font-bold uppercase mb-8 text-left tracking-widest">{ticket.title}</p>
        <div className="max-h-80 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {comments.map(c => (
                <div key={c._id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between group items-start transition hover:bg-white">
                    <div className="text-left">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">{c.userId?.name}</span>
                        <p className="text-sm text-slate-700 font-medium leading-relaxed mt-1">{c.text}</p>
                    </div>
                    {/* Delete allowed for: Admin, Project Manager, or Author */}
                    {(isManager || c.userId?._id === user.id) && (
                        <Trash2 onClick={() => handleDelete(c._id)} size={14} className="text-slate-300 hover:text-red-500 cursor-pointer transition opacity-0 group-hover:opacity-100 mt-1" />
                    )}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// 2. Project Modal
function ProjectModal({ data, allUsers, user, onClose, onRefresh }) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const teamMembers = allUsers.filter(u => fd.get(`u-${u._id}`)).map(u => u._id);
    const payload = { 
        title: fd.get('title'), 
        description: fd.get('description'), 
        manager: fd.get('manager') || user.id, 
        teamMembers 
    };
    data ? await api.put(`/projects/${data._id}`, payload) : await api.post('/projects', payload);
    onRefresh(); onClose();
  };
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-lg shadow-2xl relative animate-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800 transition"><X size={24} /></button>
        <h2 className="text-xl font-black text-slate-800 mb-6 text-left">{data ? 'Update Workspace' : 'Launch Workspace'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="title" defaultValue={data?.title} placeholder="Project Name" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:ring-2 ring-indigo-500 transition" required />
          {user.role === 'admin' && (
            <select name="manager" defaultValue={data?.manager?._id} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none font-bold text-slate-500">
              <option value="">Select Lead Manager</option>
              {allUsers.filter(u => u.role === 'manager').map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          )}
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pt-4 text-left px-2">Manage Team</p>
          <div className="h-40 overflow-y-auto bg-slate-50 border border-slate-100 rounded-2xl p-4">
            {allUsers.filter(u => u.role === 'developer').map(u => (
              <label key={u._id} className="flex items-center gap-3 p-3 hover:bg-white rounded-xl cursor-pointer transition shadow-sm mb-1 text-left">
                <input type="checkbox" name={`u-${u._id}`} defaultChecked={data?.teamMembers?.some(m => m._id === u._id)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" /> 
                <span className="text-sm font-bold text-slate-600">{u.name} <span className="text-[10px] text-slate-400 font-normal">({u.role})</span></span>
              </label>
            ))}
          </div>
          <button className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition active:scale-95">{data ? 'Save Changes' : 'Initialize Project'}</button>
        </form>
      </div>
    </div>
  );
}

// 3. Ticket Modal
function TicketModal({ data, allUsers, activeProject, onClose, onRefresh }) {
    const handleSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const payload = Object.fromEntries(fd);
        payload.projectId = activeProject._id;
        data ? await api.put(`/tickets/${data._id}`, payload) : await api.post('/tickets', payload);
        onRefresh(); onClose();
    };
    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl relative text-left animate-in zoom-in duration-200">
                <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800 transition"><X size={24} /></button>
                <h2 className="text-xl font-black text-slate-800 mb-6">{data ? 'Update Issue' : 'New Issue'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="title" defaultValue={data?.title} placeholder="Issue Summary" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:ring-2 ring-indigo-500" required />
                    <select name="priority" defaultValue={data?.priority || 'Medium'} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-slate-500">
                        <option>Low</option><option>Medium</option><option>High</option><option>Urgent</option>
                    </select>
                    <select name="assignee" defaultValue={data?.assignee?._id} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-slate-500">
                        <option value="">Select Developer</option>
                        {allUsers.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                    </select>
                    <button className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition">Save Entry</button>
                </form>
            </div>
        </div>
    );
}