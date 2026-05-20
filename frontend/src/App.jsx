import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import AuthModal from './components/AuthModal';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, logout } = useAuth();

  const [showAuthModal, setShowAuthModal] = useState(false);

  // User ke hisaab se History load karo (Unique Key for each user)
  const [sessions, setSessions] = useState(() => {
    if (!user)
      return [
        { id: Date.now(), title: 'New Chat', messages: [], uploadedFiles: [] },
      ];
    const saved = localStorage.getItem(`opsmind_chats_${user.email}`);
    if (saved) return JSON.parse(saved);
    return [
      { id: Date.now(), title: 'New Chat', messages: [], uploadedFiles: [] },
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState(sessions[0]?.id);

  // Update localStorage whenever sessions or user changes
  useEffect(() => {
    if (!user) return;

    if (sessions.length === 0) return;

    const hasMessages = sessions.some(
      (session) =>
        session.messages.length > 0 || session.uploadedFiles.length > 0,
    );

    if (
      !hasMessages &&
      sessions.length === 1 &&
      sessions[0].title === 'New Chat'
    ) {
      return;
    }

    localStorage.setItem(
      `opsmind_chats_${user.email}`,

      JSON.stringify(sessions),
    );
  }, [sessions, user]);

  // Agar user change hota hai (Login/Logout), toh session refresh karo
  useEffect(() => {
    console.log('USER CHANGED', user);

    if (user) {
      const saved = localStorage.getItem(`opsmind_chats_${user.email}`);

      const loadedSessions = saved
        ? JSON.parse(saved)
        : [
            {
              id: Date.now(),

              title: 'New Chat',

              messages: [],

              uploadedFiles: [],
            },
          ];

      setSessions(loadedSessions);

      setActiveSessionId(loadedSessions[0].id);
    } else {
      const fresh = {
        id: Date.now(),

        title: 'New Chat',

        messages: [],

        uploadedFiles: [],
      };

      setSessions([fresh]);

      setActiveSessionId(fresh.id);
    }
  }, [user]);

  const handleLoginSuccess = () => {
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    logout();

    setShowAuthModal(false);
  };

  // ... (createNewChat, updateActiveSession, renameSession, deleteSession functions remain exactly the same as before) ...

  const createNewChat = () => {
    const newSession = {
      id: Date.now(),
      title: 'New Chat',
      messages: [],
      uploadedFiles: [],
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newSession.id);
  };

  const updateActiveSession = (updater) => {
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id === activeSessionId) {
          const newData =
            typeof updater === 'function' ? updater(session) : updater;
          return { ...session, ...newData };
        }
        return session;
      }),
    );
  };

  const renameSession = (id, newTitle) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === id ? { ...session, title: newTitle } : session,
      ),
    );
  };

  const deleteSession = (id) => {
    setSessions((prev) => {
      const remainingSessions = prev.filter((session) => session.id !== id);
      if (remainingSessions.length === 0) {
        const newSession = {
          id: Date.now(),
          title: 'New Chat',
          messages: [],
          uploadedFiles: [],
        };
        setActiveSessionId(newSession.id);
        return [newSession];
      }
      if (activeSessionId === id) setActiveSessionId(remainingSessions[0].id);
      return remainingSessions;
    });
  };

  const activeSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0];

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0b0f19] overflow-hidden font-sans text-slate-200">
      <Header
        user={user}
        onLogout={handleLogout}
        onLoginClick={() => setShowAuthModal(true)}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          setActiveSessionId={setActiveSessionId}
          createNewChat={createNewChat}
          renameSession={renameSession}
          deleteSession={deleteSession}
        />
        <ChatArea
          activeSession={activeSession}
          updateSession={updateActiveSession}
          user={user}
          onRequireAuth={() => setShowAuthModal(true)}
        />
      </div>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}

export default App;
