import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Heart, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function BottomNav() {
  const location = useLocation();
  const { t } = useTranslation();

  const tabs = [
    { name: t('home'), path: '/', icon: Home },
    { name: t('categories'), path: '/categories', icon: BookOpen },
    { name: t('top'), path: '/top', icon: Trophy },
    { name: t('favorites'), path: '/favorites', icon: Heart },
  ];

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="flex justify-around items-center h-16 bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path || (tab.path === '/categories' && location.pathname.startsWith('/category/'));
          return (
            <Link 
              key={tab.name} 
              to={tab.path} 
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative transition-colors ${isActive ? 'text-gold' : 'text-muted hover:text-white'}`}
            >
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-gold rounded-b-full shadow-[0_0_10px_rgba(197,163,89,0.5)]"></div>
              )}
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
