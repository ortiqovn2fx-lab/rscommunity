import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, User, MessageCircle, CornerUpLeft, X as CloseIcon } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { formatToNYShortTime } from '../lib/utils';

interface ChatMessage {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  replyTo?: {
    id: string;
    text: string;
    author: string;
  };
}

const CommunityChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [nickname, setNickname] = useState<string | null>(localStorage.getItem('chat-nickname'));
  const [tempNickname, setTempNickname] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, msg: ChatMessage } | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Connect to the same host/port
    socketRef.current = io();

    socketRef.current.on('init_messages', (initialMessages: ChatMessage[]) => {
      setMessages(initialMessages);
    });

    socketRef.current.on('new_message', (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    socketRef.current.on('update_online_users', (users: string[]) => {
      setOnlineUsers(users);
    });

    // If already logged in, join the chat room on the server
    if (nickname) {
      socketRef.current.emit('join_chat', nickname);
    }

    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener('click', handleClickOutside);

    // Listen for nickname changes from Settings
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'chat-nickname') {
        setNickname(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('click', handleClickOutside);
      socketRef.current?.disconnect();
    };
  }, [nickname]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !nickname) return;

    const payload: any = {
      text: input,
      author: nickname,
    };

    if (replyingTo) {
      payload.replyTo = {
        id: replyingTo.id,
        text: replyingTo.text,
        author: replyingTo.author
      };
    }

    socketRef.current?.emit('send_message', payload);

    setInput('');
    setReplyingTo(null);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSetNickname = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempNickname.trim()) return;
    setNickname(tempNickname);
    localStorage.setItem('chat-nickname', tempNickname);
  };

  if (!nickname) {
    return (
      <div className="max-w-md mx-auto py-20 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-white border border-gray-100 p-10 rounded-3xl shadow-sm space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold serif leading-tight">Welcome to the Hub.</h2>
            <p className="text-gray-400 font-light">Join the weekly explorers. Set a nickname to start chatting.</p>
          </div>
          
          <form onSubmit={handleSetNickname} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold block ml-1">Nickname</label>
              <input
                type="text"
                value={tempNickname}
                onChange={(e) => setTempNickname(e.target.value)}
                placeholder="e.g. ExplorerOne"
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-black outline-none transition-all font-light"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white py-4 rounded-2xl font-semibold hover:bg-gray-800 transition-all shadow-lg shadow-black/5"
            >
              Enter Community
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex h-[75vh] bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm animate-in fade-in duration-1000">
      {/* Sidebar - Online Users */}
      <div className="w-64 border-r border-gray-50 bg-gray-50/20 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-50">
          <h3 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-4">Members Online — {onlineUsers.length}</h3>
          <div className="space-y-4 overflow-y-auto max-h-[60vh]">
            {onlineUsers.map(user => (
              <div key={user} className="flex items-center space-x-3 group">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                <span className="text-sm font-medium text-gray-600 group-hover:text-black transition-colors">{user}</span>
              </div>
            ))}
            {onlineUsers.length === 0 && (
              <p className="text-xs text-gray-300 italic">No one else here yet...</p>
            )}
          </div>
        </div>
        <div className="mt-auto p-6 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Live Server</span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white">
              <MessageCircle size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-lg serif">Community Hub</h2>
              <p className="text-[10px] uppercase tracking-widest text-gray-400">
                Connected as <span className="text-black font-bold">{nickname}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={() => {
              setNickname(null);
              localStorage.removeItem('chat-nickname');
            }}
            className="text-[10px] uppercase tracking-widest font-semibold text-gray-400 hover:text-black transition-colors bg-gray-100 px-4 py-1.5 rounded-full"
          >
            Leave Chat
          </button>
        </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
            <div className="w-16 h-16 border border-dashed border-gray-300 rounded-full flex items-center justify-center mb-4">
              <User size={24} className="text-gray-300" />
            </div>
            <p className="text-sm italic font-light">Be the first to start the conversation.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex flex-col ${msg.author === nickname ? 'items-end' : 'items-start'} group relative`}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({ x: e.clientX, y: e.clientY, msg });
              }}
            >
              <div className="flex items-center space-x-2 mb-1.5 px-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{msg.author}</span>
                <span className="text-[9px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatToNYShortTime(msg.timestamp)}
                </span>
                
                {msg.author !== nickname && (
                  <button 
                    onClick={() => {
                      setReplyingTo(msg);
                      textareaRef.current?.focus();
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-black p-1 rounded-md"
                  >
                    <CornerUpLeft size={12} />
                  </button>
                )}
              </div>

              {msg.replyTo && (
                <div className={`mb-1 max-w-[70%] px-3 py-1.5 rounded-xl text-[11px] bg-gray-50 border-l-2 border-gray-300 text-gray-500 italic truncate ${
                  msg.author === nickname ? 'text-right' : 'text-left'
                }`}>
                  <span className="block font-bold normal-case text-[9px] mb-0.5 not-italic opacity-60 uppercase">{msg.replyTo.author}</span>
                  {msg.replyTo.text}
                </div>
              )}

              <div className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap chat-markdown ${
                msg.author === nickname 
                  ? 'bg-black text-white rounded-tr-none shadow-md shadow-black/5' 
                  : 'bg-gray-100 text-gray-800 rounded-tl-none'
              }`}>
                <Markdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />
                  }}
                >
                  {msg.text}
                </Markdown>
              </div>

              {msg.author === nickname && (
                <button 
                  onClick={() => {
                    setReplyingTo(msg);
                    textareaRef.current?.focus();
                  }}
                  className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-black p-1"
                >
                  <CornerUpLeft size={14} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <div className="bg-gray-50/10">
        {replyingTo && (
          <div className="px-6 py-3 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center space-x-3 overflow-hidden">
              <CornerUpLeft size={14} className="text-gray-400 flex-shrink-0" />
              <div className="overflow-hidden">
                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 leading-none mb-1">Replying to {replyingTo.author}</p>
                <p className="text-xs text-gray-500 truncate italic">{replyingTo.text}</p>
              </div>
            </div>
            <button 
              onClick={() => setReplyingTo(null)}
              className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-all"
            >
              <CloseIcon size={14} />
            </button>
          </div>
        )}
        <div 
          className="p-6 border-t border-gray-50 flex flex-col space-y-4"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e as any);
              }
            }}
            placeholder={replyingTo ? "Write your reply..." : "Type a message..."}
            className="w-full px-6 py-3.5 rounded-2xl bg-gray-50 border-none focus:ring-1 focus:ring-gray-200 outline-none transition-all text-sm font-light resize-none min-h-[50px] overflow-hidden"
          />
          <div className="flex justify-end">
            <button
              onClick={handleSendMessage}
              disabled={!input.trim()}
              className="bg-black text-white p-3.5 rounded-2xl hover:bg-gray-800 disabled:opacity-20 transition-all shadow-lg shadow-black/5 flex items-center space-x-2 px-6"
            >
              <span className="text-xs font-bold uppercase tracking-widest">Send</span>
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {contextMenu && (
        <div 
          className="fixed z-[100] bg-white border border-gray-100 shadow-2xl rounded-xl py-1 w-32 animate-in fade-in zoom-in-95 duration-100"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setReplyingTo(contextMenu.msg);
              setContextMenu(null);
              textareaRef.current?.focus();
            }}
            className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-gray-50 flex items-center space-x-2 transition-colors"
          >
            <CornerUpLeft size={14} className="text-gray-400" />
            <span>Reply</span>
          </button>
        </div>
      )}
    </div>
  </div>
);
};

export default CommunityChat;
