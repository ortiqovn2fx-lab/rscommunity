import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const CommunityChat = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const currentUser = "Jaloliddin"; // В будущем берите это из Auth Supabase

  useEffect(() => {
    // Подключаемся к каналу чата
    const channel = supabase.channel('community_hub');

    channel
      .on('broadcast', { event: 'new_message' }, ({ payload }) => {
        setMessages((prev) => [...prev, payload]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const messageData = {
      text: newMessage,
      user: currentUser,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    supabase.channel('community_hub').send({
      type: 'broadcast',
      event: 'new_message',
      payload: messageData
    });

    setMessages((prev) => [...prev, messageData]);
    setNewMessage('');
  };

  return (
    <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm h-[600px]">
      {/* Боковая панель */}
      <div className="w-1/4 border-r border-gray-100 p-6 bg-gray-50/50">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Members Online — 1</h3>
        <div className="flex items-center text-sm text-gray-700">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          {currentUser}
        </div>
      </div>

      {/* Окно чата */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white mr-3">💬</div>
            <div>
              <h2 className="font-bold text-sm">Community Hub</h2>
              <p className="text-[10px] text-gray-400 uppercase">Connected as {currentUser.toUpperCase()}</p>
            </div>
          </div>
          <button className="text-[10px] uppercase font-bold text-gray-400 hover:text-black">Leave Chat</button>
        </div>

        {/* Список сообщений */}
        <div className="flex-1 p-6 overflow-y-auto bg-white">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-300">
              <div className="w-12 h-12 border-2 border-dashed border-gray-200 rounded-full mb-4 flex items-center justify-center">👤</div>
              <p className="text-sm italic">Be the first to start the conversation.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m, i) => (
                <div key={i} className="text-sm">
                  <span className="font-bold mr-2">{m.user}:</span>
                  <span className="text-gray-600">{m.text}</span>
                  <span className="text-[10px] text-gray-300 ml-2">{m.timestamp}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Поле ввода */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center bg-white rounded-lg border border-gray-200 p-2">
            <input
              className="flex-1 bg-transparent px-2 text-sm outline-none"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} className="px-4 text-xs font-bold uppercase text-gray-400 hover:text-black">
              Send ✉️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityChat;