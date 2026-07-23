import React, { useState, useEffect } from 'react';
import { X, Play, MessageSquare, Send, Trash2, LogIn, CheckCircle2, Share2, Check, Heart, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { trackEvent } from '../lib/tracking';
import { Episode } from '../types';
import { SafeImage } from './SafeImage';

interface EpisodeModalProps {
  episode: Episode | null;
  onClose: () => void;
  playedEpisodes: Set<string>;
  onPlay: (id: string) => void;
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
}

interface Comment {
  id: string;
  text: string;
  authorName: string;
  authorId: string;
  createdAt: any;
  isPrivate?: boolean;
}

export function EpisodeModal({ episode, onClose, playedEpisodes, onPlay, favorites, toggleFavorite }: EpisodeModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    if (episode?.id) {
      trackEvent('episode_view', { episode_id: episode.id });
    }
  }, [episode?.id]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!episode) return;
    
    const commentsRef = collection(db, 'episodes', episode.id, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setComments(fetchedComments);
    }, (error) => {
      console.error('Error fetching comments:', error);
    });

    return () => unsubscribe();
  }, [episode]);

  if (!episode) return null;

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || submitting) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'episodes', episode.id, 'comments'), {
        text: newComment.trim(),
        authorName: isAnonymous ? '匿名聽眾' : (user.displayName || '聽眾'),
        authorId: user.uid,
        createdAt: serverTimestamp(),
        isAnonymous,
        isPrivate
      });
      setNewComment('');
      setIsAnonymous(false);
      setIsPrivate(false);
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('無法新增留言，請稍後再試。');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('確定要刪除這則留言嗎？')) return;
    try {
      await deleteDoc(doc(db, 'episodes', episode.id, 'comments', commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleShare = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set('episode', episode.id);
    
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const isPlayed = playedEpisodes.has(episode.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div 
        className="bg-surface relative w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto custom-scrollbar flex-1 rounded-2xl">
          <div className="relative h-64 md:h-80 w-full shrink-0">
            {isPlayed && (
              <div className="absolute top-6 left-6 z-10 bg-primary text-on-primary px-3 py-1.5 rounded-md flex items-center gap-1.5 font-label-md text-sm shadow-md">
                <CheckCircle2 className="w-4 h-4" />
                <span>已收聽</span>
              </div>
            )}
            <SafeImage src={episode.image} alt={episode.title} className={`w-full h-full object-cover ${isPlayed ? 'grayscale-[30%] opacity-90' : ''}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent flex items-end p-6 md:p-10">
              <div className="max-w-2xl">
                <span className="bg-primary text-on-primary px-3 py-1 font-label-md text-xs mb-3 inline-block uppercase tracking-wider rounded-sm">
                  {episode.pubDate ? format(new Date(episode.pubDate), 'yyyy/MM/dd') : ''}
                </span>
                <h2 className="font-headline-lg text-3xl md:text-5xl text-on-surface drop-shadow-md mb-4">{episode.title}</h2>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-5 gap-10">
            <div className="lg:col-span-3 space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <button 
                  className="bg-secondary text-on-secondary px-6 py-3 font-label-md text-sm flex items-center justify-center gap-2 transition-all hover:bg-secondary/90 rounded-full w-full sm:w-auto"
                  onClick={() => onPlay(episode.id)}
                >
                  <Play className="w-5 h-5 fill-current" /> 立即收聽
                </button>
                
                <button
                  onClick={handleShare}
                  className="border border-outline/20 text-on-surface px-6 py-3 font-label-md text-sm flex items-center justify-center gap-2 transition-all hover:bg-surface-container-high rounded-full w-full sm:w-auto relative"
                >
                  {copied ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />} 
                  {copied ? '已複製連結' : '分享此集數'}
                </button>
                
                <button
                  onClick={() => toggleFavorite(episode.id)}
                  className={`border px-6 py-3 font-label-md text-sm flex items-center justify-center gap-2 transition-all rounded-full w-full sm:w-auto ${favorites.has(episode.id) ? 'border-primary text-primary hover:bg-primary/5' : 'border-outline/20 text-on-surface hover:bg-surface-container-high'}`}
                >
                  <Heart className={`w-5 h-5 ${favorites.has(episode.id) ? 'fill-current text-primary' : ''}`} /> 
                  {favorites.has(episode.id) ? '已收藏' : '加入收藏'}
                </button>
              </div>
              
              <div className="prose prose-stone prose-p:font-body-md prose-headings:font-headline-md max-w-none text-on-surface-variant">
                {episode.description.split('\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 bg-surface-container-low rounded-xl p-6 flex flex-col h-[500px]">
              <h3 className="font-headline-sm text-2xl text-on-surface mb-6 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                聽眾留言
              </h3>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 mb-6 pr-2">
                {comments.length === 0 ? (
                  <div className="text-center text-on-surface-variant font-body-md py-10 flex flex-col items-center gap-3">
                    <MessageSquare className="w-8 h-8 opacity-20" />
                    <p>目前還沒有留言，來搶頭香吧！</p>
                  </div>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className="bg-surface p-4 rounded-lg border border-outline/10 group">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-label-md font-bold text-sm text-primary">{comment.authorName}</span>
                          {comment.isPrivate && (
                            <span className="flex items-center gap-1 text-[10px] bg-surface-variant text-on-surface-variant px-1.5 py-0.5 rounded-sm" title="此留言僅你和作者可見">
                              <Lock className="w-3 h-3" />
                              私密
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-on-surface-variant/60 font-label-md uppercase">
                            {comment.createdAt?.toDate ? format(comment.createdAt.toDate(), 'MM/dd HH:mm') : '剛剛'}
                          </span>
                          {user?.uid === comment.authorId && (
                            <button 
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-error/60 hover:text-error transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="font-body-md text-sm text-on-surface whitespace-pre-wrap">{comment.text}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="shrink-0 mt-auto">
                {user ? (
                  <form onSubmit={handleSubmitComment} className="flex flex-col gap-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {isAnonymous ? (
                          <div className="w-6 h-6 rounded-full bg-surface-variant flex items-center justify-center">
                            <MessageSquare className="w-3 h-3 text-on-surface-variant" />
                          </div>
                        ) : (
                          <img src={user.photoURL || ''} alt="" className="w-6 h-6 rounded-full bg-surface-variant" />
                        )}
                        <span className="font-label-md text-xs text-on-surface-variant">以 {isAnonymous ? '匿名聽眾' : user.displayName} 的身分留言</span>
                      </div>
                    </div>
                    <textarea 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="分享你的聽後感..."
                      className="w-full bg-surface border border-outline/20 rounded-lg p-3 font-body-md text-sm focus:outline-none focus:border-primary resize-none h-24 custom-scrollbar"
                      maxLength={1000}
                    />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1">
                      <div className="flex items-center gap-4 text-xs font-label-md text-on-surface-variant">
                        <label className="flex items-center gap-1.5 cursor-pointer hover:text-on-surface transition-colors">
                          <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="rounded border-outline/30 text-primary focus:ring-primary w-3.5 h-3.5" />
                          匿名留言
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer hover:text-on-surface transition-colors" title="留言僅主持人可見">
                          <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="rounded border-outline/30 text-primary focus:ring-primary w-3.5 h-3.5" />
                          <Lock className="w-3.5 h-3.5" />
                          不公開
                        </label>
                      </div>
                      <button 
                        type="submit" 
                        disabled={!newComment.trim() || submitting}
                        className="bg-primary text-on-primary font-label-md text-sm py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 shrink-0"
                      >
                        {submitting ? '傳送中...' : <><Send className="w-4 h-4" /> 傳送留言</>}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-surface border border-outline/20 rounded-lg p-6 text-center">
                    <p className="font-body-md text-sm text-on-surface-variant mb-4">登入後即可參與討論</p>
                    <button 
                      onClick={handleLogin}
                      className="bg-primary text-on-primary font-label-md text-sm py-2 px-6 rounded-full w-full flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                    >
                      <LogIn className="w-4 h-4" /> 
                      使用 Google 登入
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
