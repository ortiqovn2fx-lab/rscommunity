
import React, { useState } from 'react';
import { Post, Category } from '../types';
import { Share2, Check } from 'lucide-react';
import { formatToNYTime } from '../lib/utils';

interface PostCardProps {
  post: Post;
  onClick: (post: Post) => void;
  onDiscussionClick: (post: Post) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onClick, onDiscussionClick }) => {
  const [copied, setCopied] = useState(false);

  const getCategoryColor = (category: Category) => {
    switch (category) {
      case Category.VIDEOS: return 'bg-blue-50 text-blue-600';
      case Category.REFLECTIONS: return 'bg-purple-50 text-purple-600';
      case Category.ARTICLES: return 'bg-green-50 text-green-600';
      case Category.NEWS: return 'bg-rose-50 text-rose-600';
      case Category.MARKET_VIEW: return 'bg-amber-50 text-amber-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}?post=${post.id}`;
    const shareText = `Check out this insight on RS Finance Hub: "${post.title}"`;

    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: shareText,
        url: shareUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div 
      onClick={() => onClick(post)}
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden transition-all duration-500 ease-[0.23,1,0.32,1] hover:translate-y-[-6px] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-transparent hover:border-gray-100 flex flex-col h-full"
    >
      <div className="aspect-[16/10] overflow-hidden relative bg-gray-50">
        {post.imageUrl && (
          <img 
            src={post.imageUrl} 
            alt={post.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-1000 ease-[0.23,1,0.32,1] group-hover:scale-110"
          />
        )}
        
        {/* Media Type Overlays */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {post.videoUrl && (
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110 pointer-events-auto">
              <svg className="w-6 h-6 text-black fill-current ml-1" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}
          {!post.videoUrl && post.documentUrl && (
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110 pointer-events-auto">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          )}
        </div>

        <div className="absolute top-4 left-4">
          <span className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full ${getCategoryColor(post.category)}`}>
            {post.category}
          </span>
        </div>

        <button 
          onClick={handleShare}
          className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm text-gray-500 hover:text-black hover:bg-white transition-all opacity-0 group-hover:opacity-100"
        >
          {copied ? <Check size={14} className="text-green-500" /> : <Share2 size={14} />}
        </button>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center text-[11px] text-gray-400 uppercase tracking-widest mb-3">
          <span>{formatToNYTime(post.date, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          {post.category === Category.NEWS && (
            <>
              <span className="mx-2">•</span>
              <span className="text-black font-bold tracking-tight">Source: {post.author}</span>
            </>
          )}
          {post.readingTime && (
            <>
              <span className="mx-2">•</span>
              <span>{post.readingTime}</span>
            </>
          )}
          {post.videoUrl && (
            <>
              <span className="mx-2">•</span>
              <span className="text-blue-500 font-bold">Video</span>
            </>
          )}
          {!post.videoUrl && post.documentUrl && (
            <>
              <span className="mx-2">•</span>
              <span className="text-indigo-500 font-bold">PDF / Doc</span>
            </>
          )}
        </div>
        <h3 className="text-xl font-semibold mb-3 leading-tight group-hover:text-gray-700 transition-colors serif">
          {post.title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 font-light">
          {post.excerpt}
        </p>

        <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
          <button 
            onClick={(e) => { e.stopPropagation(); onClick(post); }}
            className="flex items-center space-x-2 group/btn"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-black/20 group-hover/btn:bg-black transition-colors" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 group-hover/btn:text-black transition-colors">Insights Hub</span>
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); onDiscussionClick(post); }}
            className="flex items-center space-x-2 text-gray-300 hover:text-black transition-all group/disc"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest">Topic Lounge</span>
            <div className="w-6 h-6 rounded-full border border-gray-100 group-hover/disc:border-black flex items-center justify-center transition-colors">
              <span className="text-[10px]">→</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
