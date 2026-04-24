
import React, { useState, useEffect, useRef } from 'react';
import { Post, Comment, Category } from '../types';
import { summarizeContent, enhanceNewsContent } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, User, ChevronRight, X, PanelRight, Minimize2, ArrowRight } from 'lucide-react';
import { formatToNYDate } from '../lib/utils';

interface PostModalProps {
  post: Post;
  comments: Comment[];
  onAddComment: (postId: string, text: string, author: string, replyToId?: string) => void;
  onUpdatePost: (updatedPost: Post) => void;
  onClose: () => void;
  initialSplitMode?: boolean;
}

interface DiscussionSectionProps {
  comments: Comment[];
  processedComments: any[];
  nickname: string;
  setNickname: (val: string) => void;
  commentText: string;
  setCommentText: (val: string) => void;
  replyingTo: Comment | null;
  setReplyingTo: (c: Comment | null) => void;
  onAddComment: (e: React.FormEvent) => void;
  isCompact?: boolean;
}

const DiscussionSection: React.FC<DiscussionSectionProps> = ({ 
  comments, processedComments, nickname, setNickname, commentText, setCommentText, replyingTo, setReplyingTo, onAddComment, isCompact = false 
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (replyingTo && textareaRef.current) {
      textareaRef.current.focus();
      // Smoothly scroll into view if it might be off-screen
      textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [replyingTo]);

  return (
    <div className={`flex flex-col h-full bg-white`}>
      <div className={`flex items-center space-x-2 mb-8 ${isCompact ? 'px-6 pt-6' : ''}`}>
        <MessageSquare size={isCompact ? 16 : 18} className="text-gray-400" />
        <h3 className={`font-bold uppercase tracking-widest text-gray-400 ${isCompact ? 'text-[10px]' : 'text-sm'}`}>
          Discussion ({comments.length})
        </h3>
      </div>

      <div className={`flex-1 overflow-y-auto space-y-8 scrollbar-hide ${isCompact ? 'px-6 pb-6' : 'mb-12'}`}>
        {comments.length === 0 ? (
          <div className="text-center py-12 px-6 rounded-3xl border border-dashed border-gray-100 bg-gray-50/50">
            <p className="text-sm text-gray-400 italic font-light leading-relaxed">No thoughts shared yet. Start the conversation.</p>
          </div>
        ) : (
          processedComments.map((comment) => (
            <div key={comment.id} className="space-y-4">
              <div className="flex space-x-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                  <User size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-900 truncate mr-2">{comment.author}</span>
                    <span className="text-[9px] text-gray-300 font-bold uppercase whitespace-nowrap">{formatToNYDate(comment.date)}</span>
                  </div>
                  <div className="bg-gray-50 rounded-2xl rounded-tl-none p-4 text-xs sm:text-sm text-gray-700 leading-relaxed font-light border border-gray-50/50 shadow-sm">
                    {comment.text}
                  </div>
                  <button 
                    onClick={() => setReplyingTo(comment)}
                    className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mt-2 ml-1 hover:text-indigo-700 transition-colors"
                  >
                    Reply
                  </button>
                </div>
              </div>

              {/* Threaded Replies */}
              {comment.replies.length > 0 && (
                <div className="ml-12 space-y-4 border-l-2 border-gray-50 pl-6">
                  {comment.replies.map((reply: any) => (
                    <div key={reply.id} className="flex space-x-3">
                      <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-300 flex-shrink-0">
                        <User size={12} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-[10px] font-bold uppercase text-gray-900">{reply.author}</span>
                          <span className="text-[8px] text-gray-300 font-bold uppercase">{formatToNYDate(reply.date)}</span>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 leading-relaxed font-light border border-gray-50">
                          {reply.text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className={`${isCompact ? 'p-6 bg-white border-t border-gray-50' : 'mt-8 border-t border-gray-100 pt-8 pb-10'}`}>
        {!nickname ? (
          <div className="p-6 bg-gray-50 rounded-2xl text-center">
            <p className="text-[10px] uppercase font-bold text-gray-400 mb-4">Identification Needed</p>
            <input 
              type="text" 
              placeholder="Set nickname..." 
              className="w-full px-4 py-2.5 rounded-full border border-gray-100 bg-white text-xs outline-none focus:ring-1 focus:ring-black"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = (e.target as HTMLInputElement).value;
                  if (val.trim()) {
                    setNickname(val.trim());
                    localStorage.setItem('chat-nickname', val.trim());
                  }
                }
              }}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {replyingTo && (
              <div className="flex items-center justify-between px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100">
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Replying to {replyingTo.author}</span>
                <button onClick={() => setReplyingTo(null)} className="text-indigo-300 hover:text-indigo-500">
                  <X size={12} />
                </button>
              </div>
            )}
            <form onSubmit={onAddComment} className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={commentText}
                  onChange={(e) => {
                    setCommentText(e.target.value);
                    // Auto-expand height
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                  placeholder={replyingTo ? "Write a reply..." : `What are your thoughts, ${nickname}?`}
                  className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-black/5 outline-none transition-all text-xs sm:text-sm font-light resize-none min-h-[44px] shadow-sm max-h-[25vh] overflow-y-auto"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      onAddComment(e as any);
                      (e.target as HTMLTextAreaElement).style.height = '44px';
                    }
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="bg-black text-white p-3.5 rounded-xl hover:bg-gray-800 disabled:opacity-10 transition-all shadow-xl flex-shrink-0"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

const PostModal: React.FC<PostModalProps> = ({ post, comments, onAddComment, onUpdatePost, onClose, initialSplitMode = false }) => {
  const [reflectionPrompts, setReflectionPrompts] = useState<string[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingEnhancement, setLoadingEnhancement] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [nickname, setNickname] = useState(localStorage.getItem('chat-nickname') || '');
  const [isSplitMode, setIsSplitMode] = useState(() => {
    // Force standard view on mobile first entry, regardless of auto-lounge setting
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return false;
    const autoLounge = localStorage.getItem('setting-auto-lounge') === 'true';
    return autoLounge || initialSplitMode;
  });
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

  useEffect(() => {
    const autoEnhance = async () => {
      if (post.category === Category.NEWS && !post.conclusion) {
        setLoadingEnhancement(true);
        const { content, conclusion } = await enhanceNewsContent(post.title, post.content);
        onUpdatePost({
          ...post,
          content,
          conclusion
        });
        setLoadingEnhancement(false);
      }
    };
    autoEnhance();
  }, [post.id]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'chat-nickname') {
        setNickname(e.newValue || '');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleAISupport = async () => {
    setLoadingAI(true);
    
    // Заменяем вызов несуществующей функции на безопасный Promise
    // Теперь мы используем только summarizeContent
    const sum = await summarizeContent(post.content);
    
    setReflectionPrompts([]); // Возвращаем пустой массив, чтобы приложение не падало
    setSummary(sum);
    setLoadingAI(false);
  };

  const handleAddCommentInternal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !nickname) return;
    onAddComment(post.id, commentText, nickname, replyingTo?.id);
    setCommentText('');
    setReplyingTo(null);
  };

  const formatComments = (allComments: Comment[]) => {
    const mainComments = allComments.filter(c => !c.replyToId);
    const replies = allComments.filter(c => c.replyToId);
    
    return mainComments.map(main => ({
      ...main,
      replies: replies.filter(r => r.replyToId === main.id)
    }));
  };

  const processedComments = formatComments(comments);

  const commonDiscussionProps = {
    comments,
    processedComments,
    nickname,
    setNickname,
    commentText,
    setCommentText,
    replyingTo,
    setReplyingTo,
    onAddComment: handleAddCommentInternal
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-white/95 backdrop-blur-xl" 
        onClick={onClose} 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 10 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`relative bg-white w-full h-full max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-gray-100 transition-all duration-700 ease-[0.23,1,0.32,1] flex ${isSplitMode ? 'max-w-6xl' : 'max-w-4xl'}`}
      >
        <div className="flex-1 h-full overflow-y-auto scrollbar-hide px-8 sm:px-12 py-10 relative">
          <div className="flex items-center justify-between mb-12">
            <button 
              onClick={onClose}
              className="text-gray-300 hover:text-black transition-colors"
            >
              <X size={24} />
            </button>

            <button
              onClick={() => setIsSplitMode(!isSplitMode)}
              className={`hidden lg:flex items-center space-x-2 px-4 py-2 rounded-full transition-all border ${isSplitMode ? 'bg-black text-white border-black' : 'text-gray-400 hover:text-black border-gray-100 hover:border-gray-200'}`}
            >
              <PanelRight size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {isSplitMode ? 'Standard View' : 'Split Discussion'}
              </span>
            </button>
          </div>

          <header className="mb-12 text-center max-w-2xl mx-auto">
            <div className="inline-block text-[9px] uppercase tracking-[0.25em] font-bold text-gray-400 mb-6 px-4 py-1.5 border border-gray-100 rounded-full">
              {post.category} • {post.date}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-8 serif leading-tight tracking-tight">{post.title}</h1>
            <div className="flex items-center justify-center space-x-3 text-[11px] text-gray-400 uppercase tracking-[0.1em] font-bold">
              <span className="text-black">By {post.author}</span>
              <span className="text-gray-200">/</span>
              <span>{post.readingTime || '5 min read'}</span>
            </div>
          </header>

          {post.videoUrl && (
            <div className="aspect-video w-full rounded-2xl overflow-hidden mb-12 bg-black shadow-lg">
              <iframe src={post.videoUrl} className="w-full h-full" allowFullScreen title={post.title} />
            </div>
          )}

          {!post.videoUrl && post.imageUrl && (
            <img src={post.imageUrl} className="w-full h-auto rounded-3xl mb-12 border border-gray-50/50 shadow-sm" alt={post.title} referrerPolicy="no-referrer" />
          )}

          <article className="prose prose-lg max-w-2xl mx-auto mb-16 font-light text-gray-700 leading-relaxed whitespace-pre-wrap serif-reading font-sans">
            <div className="mb-12">
              {post.category === Category.NEWS ? (
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500 mb-8 pb-4 border-b border-gray-50">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>Official News Transcript</span>
                  </div>
                  <div className="text-sm sm:text-base leading-[1.8] text-gray-800">
                    {post.content}
                  </div>

                  {(post.conclusion || loadingEnhancement) && (
                    <div className="mt-12 p-6 rounded-2xl bg-indigo-50/30 border border-indigo-100/50">
                      <div className="flex items-center space-x-2 mb-4">
                        <ArrowRight size={14} className="text-indigo-400" />
                        <h4 className="text-[9px] font-bold uppercase tracking-widest text-indigo-400">Market Strategic Conclusion</h4>
                      </div>
                      {loadingEnhancement ? (
                        <div className="space-y-2">
                          <div className="h-3 bg-indigo-100/50 rounded-full w-full animate-pulse" />
                          <div className="h-3 bg-indigo-100/50 rounded-full w-2/3 animate-pulse" />
                        </div>
                      ) : (
                        <p className="text-sm text-indigo-900/80 font-medium leading-relaxed italic">
                          {post.conclusion}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                post.content
              )}
            </div>
            
            {post.url && (
              <div className="mt-20 pt-10 border-t border-gray-100/50">
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-gray-400">Content Reference & Citation</p>
                    <p className="text-sm text-gray-500 font-light italic leading-relaxed max-w-sm mx-auto">
                      The above text is a word-for-word transcript provided by <span className="text-black font-semibold not-italic">{post.author}</span>.
                    </p>
                  </div>
                  <div className="flex flex-col items-center space-y-4">
                    <a 
                      href={post.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-3 bg-black text-white px-10 py-4 rounded-2xl transition-all hover:bg-gray-800 group font-bold tracking-widest uppercase text-[10px] shadow-lg shadow-black/5"
                    >
                      <span>Read Original Source</span>
                      <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                    <span className="text-[9px] text-gray-300 font-medium uppercase tracking-widest">Verified External Citation • {post.author}</span>
                  </div>
                </div>
              </div>
            )}
          </article>

          {/* AI Assistance */}
          <section className="max-w-2xl mx-auto bg-gray-50/30 rounded-[2rem] p-10 mb-16 border border-gray-100/50">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">AI Intelligence Hub</h3>
              </div>
              {!summary && !loadingAI && (
                <button 
                  onClick={handleAISupport}
                  className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 hover:text-indigo-700 transition-colors"
                >
                  Run Analysis
                </button>
              )}
            </div>

            {loadingAI ? (
              <div className="space-y-4 py-4 backdrop-blur-sm">
                <div className="h-2.5 bg-gray-100 rounded-full w-full animate-pulse" />
                <div className="h-2.5 bg-gray-100 rounded-full w-3/4 animate-pulse" />
              </div>
            ) : (
              <div className="space-y-8">
                {summary && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                    <h4 className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 mb-3">Executive Summary</h4>
                    <p className="text-gray-600 text-sm leading-relaxed font-light">{summary}</p>
                  </div>
                )}
                {reflectionPrompts.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {reflectionPrompts.map((prompt, idx) => (
                      <div key={idx} className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                        <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest block mb-2">Prompt {idx + 1}</span>
                        <p className="text-xs font-medium text-gray-800 leading-relaxed italic">"{prompt}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Standard Bottom Discussion (Shown only if not split) */}
          <div className={`${isSplitMode ? 'hidden' : 'block'}`}>
            <section className="max-w-2xl mx-auto border-t border-gray-100 pt-16 mb-20">
              <DiscussionSection {...commonDiscussionProps} />
            </section>
          </div>
        </div>

        {/* Side Panel Discussion */}
        <AnimatePresence>
          {isSplitMode && (
            <motion.aside
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
              className="hidden lg:block w-[380px] border-l border-gray-100 h-full bg-white relative z-20"
            >
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-hidden">
                  <DiscussionSection {...commonDiscussionProps} isCompact />
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Mobile Discussion Overlay (Triggered by button) */}
        {!isSplitMode && (
          <button 
            onClick={() => setIsSplitMode(true)}
            className="lg:hidden fixed bottom-10 right-10 w-14 h-14 bg-black text-white rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.3)] flex items-center justify-center z-50 active:scale-95 transition-all"
          >
            <MessageSquare size={24} />
          </button>
        )}

        <AnimatePresence>
          {(isSplitMode && typeof window !== 'undefined' && window.innerWidth < 1024) && (
            <motion.div 
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              className="lg:hidden fixed inset-0 bg-white z-[70] p-6 flex flex-col pt-20"
            >
              <button 
                onClick={() => setIsSplitMode(false)}
                className="absolute top-8 right-8 p-2 text-gray-400"
              >
                <Minimize2 size={24} />
              </button>
              <DiscussionSection {...commonDiscussionProps} isCompact />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default PostModal;
