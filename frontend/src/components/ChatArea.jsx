import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function ChatArea({
  activeSession,
  updateSession,
  user,
  onRequireAuth,
}) {
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    scrollToBottom();
  }, [activeSession.messages]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    const newFiles = [...activeSession.uploadedFiles];

    for (let file of files) {
      const formData = new FormData();
      formData.append('pdf', file);
      try {
        await axios.post('http://localhost:5000/upload', formData);
        newFiles.push(file.name);
      } catch (err) {
        alert(`Failed to upload ${file.name}`);
      }
    }

    updateSession({ uploadedFiles: newFiles });
    setIsUploading(false);
    e.target.value = null;
  };

  const handleChat = async (e) => {
    e.preventDefault();

    if (!user) {
      onRequireAuth();
      return;
    }

    if (!query.trim() || isTyping) return;

    const userMessage = { role: 'user', content: query };
    const updatedMessages = [...activeSession.messages, userMessage];

    let newTitle = activeSession.title;
    if (activeSession.title === 'New Chat') {
      newTitle = query.length > 25 ? query.substring(0, 25) + '...' : query;
    }

    updateSession({ messages: updatedMessages, title: newTitle });
    setQuery('');
    setIsTyping(true);

    const initialAiMessage = { role: 'ai', content: '', sources: [] };
    updateSession({ messages: [...updatedMessages, initialAiMessage] });

    try {
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6);
            if (dataStr.trim() === '[DONE]') break;

            try {
              const dataObj = JSON.parse(dataStr);

              if (dataObj.text) {
                accumulatedText += dataObj.text;
              }

              // 🔥 FIX: Smooth Stream Update
              updateSession((currentSession) => {
                const msgs = [...currentSession.messages];
                const lastIdx = msgs.length - 1;
                if (dataObj.sources) msgs[lastIdx].sources = dataObj.sources;
                msgs[lastIdx].content = accumulatedText;
                return { messages: msgs };
              });
            } catch (e) {
              /* ignore incomplete chunks */
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat Error:', error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0b0f19] relative">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        {activeSession.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <div className="w-16 h-16 mb-6 bg-slate-800 rounded-2xl flex items-center justify-center text-3xl shadow-xl border border-slate-700/50">
              🤖
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              OpsMind Assistant
            </h2>
            <p className="max-w-md text-center leading-relaxed">
              Upload SOPs or documents to get instant answers with references.
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-8 pb-32">
            {activeSession.messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'ai' && (
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-xs shrink-0 mt-1 shadow-lg">
                    ✦
                  </div>
                )}
                <div
                  className={`px-5 py-3.5 rounded-2xl max-w-[85%] text-[15px] leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-slate-800 text-white rounded-tr-sm border border-slate-700'
                      : 'bg-transparent text-slate-300'
                  }`}
                >
                  {msg.content}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-800/80">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        References:
                      </span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {msg.sources.map((src, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-[#171c28] text-emerald-400 border border-emerald-900/50 rounded-md text-xs font-medium"
                          >
                            📄 {src}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19] to-transparent">
        <form onSubmit={handleChat} className="max-w-3xl mx-auto">
          <div className="bg-[#171c28] border border-slate-700 rounded-3xl p-2 shadow-2xl focus-within:border-emerald-500/50 transition-colors">
            {activeSession.uploadedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 px-3 pt-2 pb-1">
                {activeSession.uploadedFiles.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700 text-xs text-slate-300"
                  >
                    <span className="text-emerald-500">📄</span>
                    <span className="truncate max-w-[150px]">{file}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="application/pdf"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                disabled={isUploading}
                className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors disabled:opacity-50"
              >
                {isUploading ? '⏳' : '📎'}
              </button>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Message OpsMind..."
                className="flex-1 bg-transparent text-white px-2 py-3 focus:outline-none text-[15px]"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={isTyping || !query.trim()}
                className="p-3 bg-white text-black rounded-full hover:bg-slate-200 disabled:bg-slate-700 transition-colors flex items-center justify-center mr-1"
              >
                <span className="font-bold text-lg leading-none">↑</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
