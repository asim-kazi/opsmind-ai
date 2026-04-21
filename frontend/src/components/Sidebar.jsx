import React, { useState } from 'react';

export default function Sidebar({
  sessions,
  activeSessionId,
  setActiveSessionId,
  createNewChat,
  renameSession,
  deleteSession,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const handleEditStart = (e, id, title) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(title);
  };

  const handleEditSave = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (editTitle.trim()) {
      renameSession(id, editTitle);
    }
    setEditingId(null);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation(); // Chat switch hone se rokne ke liye
    if (window.confirm('Are you sure you want to delete this chat?')) {
      deleteSession(id);
    }
  };

  return (
    <div className="w-[280px] bg-[#171c28] border-r border-slate-800/80 flex flex-col h-full z-10 shrink-0">
      <div className="p-4 border-b border-slate-800/80">
        <button
          onClick={createNewChat}
          className="w-full py-3 px-4 bg-transparent border border-slate-700 hover:bg-slate-800 text-white rounded-xl font-medium text-sm flex items-center justify-between transition-colors"
        >
          <span>OpsMind AI</span>
          <span className="text-xl">📝</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-1">
        <p className="text-xs font-bold text-slate-500 mb-3 px-2 tracking-wider uppercase mt-2">
          Chat History
        </p>

        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => setActiveSessionId(session.id)}
            className={`group p-3 rounded-lg cursor-pointer transition-colors text-sm flex items-center justify-between
              ${
                activeSessionId === session.id
                  ? 'bg-slate-800 text-white font-medium shadow-sm border border-slate-700/50'
                  : 'bg-transparent text-slate-400 hover:bg-slate-800/50'
              }`}
          >
            {editingId === session.id ? (
              <form
                onSubmit={(e) => handleEditSave(e, session.id)}
                className="flex-1 mr-2"
              >
                <input
                  type="text"
                  autoFocus
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={(e) => handleEditSave(e, session.id)}
                  className="w-full bg-slate-900 text-white px-2 py-1 rounded text-sm outline-none border border-emerald-500/50"
                />
              </form>
            ) : (
              <div className="flex items-center gap-3 w-3/4">
                <span className="opacity-70 shrink-0">💬</span>
                <span className="truncate">{session.title}</span>
              </div>
            )}

            {/* Action Icons (Show on Hover) */}
            {editingId !== session.id && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={(e) => handleEditStart(e, session.id, session.title)}
                  className="text-slate-400 hover:text-emerald-400 p-1 rounded hover:bg-slate-700/50"
                  title="Rename"
                >
                  ✏️
                </button>
                <button
                  onClick={(e) => handleDelete(e, session.id)}
                  className="text-slate-400 hover:text-red-400 p-1 rounded hover:bg-slate-700/50"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
