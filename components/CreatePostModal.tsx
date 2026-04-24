import React, { useState } from 'react';
import { Category, Post } from '../types';
import { motion } from 'motion/react';

// Убедитесь, что этот путь правильный
import { generateImagePrompt } from '../services/geminiService';

interface CreatePostModalProps {
  onClose: () => void;
  onSubmit: (post: Post) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: Category.NEWS,
    imageUrl: '',
    videoUrl: '',
    documentUrl: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Базовая валидация
    if (!formData.title || !formData.content) {
        alert("Please fill in the title and full content.");
        return;
    }

    setIsSubmitting(true);
    
    try {
      // 1. Генерируем промпт на основе заголовка и контента
      const imagePrompt = await generateImagePrompt(formData.title, formData.content);
      
      // 2. Кодируем промпт для URL
      const encodedPrompt = encodeURIComponent(imagePrompt);
      
      // 3. Формируем URL для Pollinations.ai (добавляем случайный seed для уникальности)
      const generatedImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1200&height=675&nologo=true&seed=${Math.floor(Math.random() * 100000)}`;

      // 4. Создаем новый пост с сгенерированным изображением
      const newPost: Post = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
        author: 'RS',
        imageUrl: generatedImageUrl, // <-- Присваиваем сгенерированный URL
        readingTime: formData.category === Category.ARTICLES ? '5 min read' : undefined
      };
      
      // 5. Отправляем пост
      onSubmit(newPost);
    } catch (error) {
      console.error("Failed to generate AI image:", error);
      
      // ФОЛБЭК: Если AI генерация упала, используем случайное фото (чтобы сайт не упал)
      onSubmit({
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
        author: 'RS',
        imageUrl: `https://picsum.photos/seed/${Math.floor(Math.random() * 1000)}/800/450`, // fallback image
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative bg-white w-full max-w-2xl rounded-3xl p-8 sm:p-10 shadow-2xl z-10"
      >
        <h2 className="text-2xl font-bold mb-6 serif">Share New Knowledge</h2>
        <p className="text-xs text-gray-400 mb-8 font-light italic">Videos, PDFs, and stock news can be shared across all categories.</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Title</label>
              <input 
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-black/5 text-sm font-light"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="Post title..."
              />
            </div>
            
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Category</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:outline-none text-sm font-light appearance-none bg-white"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as Category})}
              >
                {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Video Embed (Optional)</label>
              <input 
                className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:outline-none text-sm font-light"
                value={formData.videoUrl}
                onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                placeholder="YouTube/Vimeo embed URL..."
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">PDF / Doc Link (Optional)</label>
              <input 
                className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:outline-none text-sm font-light"
                value={formData.documentUrl}
                onChange={e => setFormData({...formData, documentUrl: e.target.value})}
                placeholder="Direct link to your writing or PDF..."
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Summary Excerpt</label>
            <textarea 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:outline-none h-16 text-sm font-light resize-none"
              value={formData.excerpt}
              onChange={e => setFormData({...formData, excerpt: e.target.value})}
              placeholder="Short catchy summary..."
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Full Content / News Detail</label>
            <textarea 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:outline-none h-32 text-sm font-light resize-none"
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
              placeholder="Write your news update or reflection here..."
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-50">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-gray-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
            >
              {isSubmitting ? 'Generating Image...' : 'Publish Post'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreatePostModal;