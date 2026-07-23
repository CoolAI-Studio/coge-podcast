import { Globe, Heart, Sun, Moon, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';

export function Navbar({ title, onShowFavorites, isDarkMode, toggleDarkMode }: { title: string; onShowFavorites?: () => void; isDarkMode?: boolean; toggleDarkMode?: () => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSync = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/sync-github', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`同步失敗: ${data.error}`);
      } else {
        alert('同步成功，GitHub Pages 將在幾分鐘內更新！');
      }
    } catch (e: any) {
      alert(`同步失敗: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const isAdmin = user?.email === 'coolaistudio@gmail.com';

  return (
    <nav className="w-full top-0 sticky bg-surface border-b border-outline/10 z-40 transition-colors">
      <div className="flex justify-between items-center max-w-[var(--spacing-container-max)] mx-auto px-margin-mobile md:px-margin-desktop h-20">
        <div className="flex items-center gap-2">
          <Globe className="text-primary w-8 h-8" />
          <a href="#" className="font-headline-md text-2xl text-on-surface tracking-tight">
            {title}
          </a>
        </div>
        <div className="hidden md:flex items-center gap-8 font-body-md text-base">
          <a href="#hero" className="text-on-surface-variant hover:text-secondary transition-colors duration-200">旅程</a>
          <a href="#archive" className="text-on-surface-variant hover:text-secondary transition-colors duration-200">存檔</a>
          <a href="#map" className="text-secondary border-b-2 border-secondary pb-1 hover:text-secondary transition-colors duration-200">地圖</a>
          <a href="#footer" className="text-on-surface-variant hover:text-secondary transition-colors duration-200">關於</a>
        </div>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container disabled:opacity-50"
              title="強制同步至 GitHub"
            >
              <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          )}
          {toggleDarkMode && (
            <button 
              onClick={toggleDarkMode}
              className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container"
              title={isDarkMode ? "切換至亮色模式" : "切換至暗色模式"}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}
          <button 
            onClick={onShowFavorites}
            className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 p-2 rounded-full hover:bg-surface-container"
            title="收藏清單"
          >
            <Heart className="w-5 h-5" />
            <span className="hidden sm:inline font-label-md text-sm">收藏</span>
          </button>
          <button className="bg-primary hover:bg-primary-container text-on-primary font-label-md text-sm px-6 py-2 transition-all duration-300 rounded">
            訂閱
          </button>
        </div>
      </div>
    </nav>
  );
}
