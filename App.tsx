import React, { useState, useMemo, useEffect } from 'react';
import { Category, Post, Comment } from './types';
import { INITIAL_POSTS } from './constants';
import { supabase } from './lib/supabaseClient'; // Убедитесь, что этот файл создан
import Navigation from './components/Navigation';
import PostCard from './components/PostCard';
import PostModal from './components/PostModal';
import CreatePostModal from './components/CreatePostModal';
import SettingsModal from './components/SettingsModal';
import CommunityChat from './components/CommunityChat';
import { motion, AnimatePresence } from 'motion/react';

const App: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    // 1. Подписка на канал обновлений
    const channel = supabase.channel('rs-community-updates');

    channel
      .on('broadcast', { event: 'new_post' }, ({ payload }) => {
        setPosts((prev) => [payload, ...prev.filter(p => p.id !== payload.id)]);
      })
      .on('broadcast', { event: 'new_comment' }, ({ payload }) => {
        setComments((prev) => [...prev.filter(c => c.id !== payload.id), payload]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleCreatePost = (newPost: Post) => {
    // 2. Отправка через Supabase Broadcast
    supabase.channel('rs-community-updates').send({
      type: 'broadcast',
      event: 'new_post',
      payload: newPost
    });
    setPosts(prev => [newPost, ...prev]);
    setIsCreating(false);
  };

  const handleAddComment = (postId: string, text: string, author: string, replyToId?: string) => {
    const newComment: Comment = { id: Date.now().toString(), postId, text, author, replyToId };
    supabase.channel('rs-community-updates').send({
      type: 'broadcast',
      event: 'new_comment',
      payload: newComment
    });
    setComments(prev => [...prev, newComment]);
  };

  // Остальная логика фильтрации и UI остается без изменений
  const filteredPosts = useMemo(() => {
    const sorted = [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return activeCategory === 'All' ? sorted : sorted.filter(p => p.category === activeCategory);
  }, [posts, activeCategory]);

  return (
    <div className="min-h-screen">
      <Navigation activeCategory={activeCategory} setActiveCategory={setActiveCategory} onNewPost={() => setIsCreating(true)} />
      
      <main className="max-w-6xl mx-auto px-6 py-16">
        {activeCategory === Category.COMMUNITY ? (
          <CommunityChat />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredPosts.map(post => (
              <PostCard key={post.id} post={post} onClick={setSelectedPost} />
            ))}
          </div>
        )}
      </main>

      {/* Модальные окна */}
      {selectedPost && <PostModal post={selectedPost} comments={comments.filter(c => c.postId === selectedPost.id)} onAddComment={handleAddComment} onClose={() => setSelectedPost(null)} />}
      {isCreating && <CreatePostModal onClose={() => setIsCreating(false)} onSubmit={handleCreatePost} />}
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
};

export default App;