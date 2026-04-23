
import React from 'react';
import { Category } from '../types';
import { motion } from 'motion/react';

interface NavigationProps {
  activeCategory: Category | 'All';
  setActiveCategory: (category: Category | 'All') => void;
  onNewPost: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeCategory, setActiveCategory, onNewPost }) => {
  const categories: (Category | 'All')[] = ['All', ...Object.values(Category)];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <div 
          className="text-2xl font-bold tracking-tighter cursor-pointer serif"
          onClick={() => setActiveCategory('All')}
        >
          RS
        </div>

        <div className="hidden md:flex items-center space-x-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-sm font-medium transition-colors hover:text-black relative py-2 ${
                activeCategory === cat ? 'text-black' : 'text-gray-400'
              }`}
            >
              <span className="relative z-10">{cat}</span>
              {activeCategory === cat && (
                <motion.div 
                  layoutId="activeCategory"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={onNewPost}
            className="bg-black text-white text-[10px] uppercase tracking-widest px-6 py-2.5 rounded-full hover:bg-gray-800 transition-all font-bold"
          >
            Share
          </button>
          
          <button 
            onClick={() => (window as any).toggleSettings?.()}
            className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-black hover:border-black transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
