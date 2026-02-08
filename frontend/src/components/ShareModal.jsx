
import { useState } from 'react';
import { X, Link as LinkIcon, Check, Copy, UserPlus } from 'lucide-react';
import api from '../lib/api';

export default function ShareModal({ file, onClose }) {
  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState(null);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  // 1. Create Public Link
  const handleCreateLink = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/files/${file.id}/share`);
      const link = `${window.location.origin}/shared/${res.data.shareId}`;
      setShareLink(link);
    } catch (err) { alert('Failed'); }
    setLoading(false);
  };

  // 2. Share via Email
  const handleInvite = async (e) => {
    e.preventDefault();
    if(!email) return;
    try {
        await api.post(`/files/${file.id}/share-email`, { email });
        setMessage(`Shared with ${email}`);
        setEmail('');
    } catch(err) { setMessage('Failed to share'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
            <h3 className="font-semibold text-gray-700">Share "{file.name}"</h3>
            <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        
        <div className="p-6 space-y-6">
            {/* Email Invite Section */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Invite People</label>
                <form onSubmit={handleInvite} className="mt-2 flex gap-2">
                    <input 
                        type="email" 
                        placeholder="Enter email address" 
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <button type="submit" className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
                        <UserPlus className="w-5 h-5" />
                    </button>
                </form>
                {message && <p className="text-green-600 text-sm mt-2">{message}</p>}
            </div>

            <hr />

            {/* Public Link Section */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Public Link</label>
                {!shareLink ? (
                    <button 
                        onClick={handleCreateLink}
                        disabled={loading}
                        className="mt-2 w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition"
                    >
                        <LinkIcon className="w-4 h-4" />
                        {loading ? 'Generating...' : 'Get Shareable Link'}
                    </button>
                ) : (
                    <div className="mt-2 flex gap-2">
                        <input readOnly value={shareLink} className="flex-1 bg-gray-100 border rounded px-3 text-sm text-gray-600" />
                        <button onClick={() => navigator.clipboard.writeText(shareLink)} className="p-2 border rounded hover:bg-gray-50">
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}