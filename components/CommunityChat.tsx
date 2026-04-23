import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function CommunityChat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('Гость');

  // Загрузка сообщений при открытии
  useEffect(() => {
    supabase.from('messages').select('*').order('created_at', { ascending: true })
      .then(({ data }) => setMessages(data || []));

    // Слушаем новые сообщения в реальном времени
    const channel = supabase.channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    await supabase.from('messages').insert([{ content: newMessage, username }]);
    setNewMessage('');
  };

  return (
    <div className="chat-container">
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Ваше имя" />
      <div className="messages">
        {messages.map(msg => <p key={msg.id}><b>{msg.username}:</b> {msg.content}</p>)}
      </div>
      <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
      <button onClick={sendMessage}>Отправить</button>
    </div>
  );
}