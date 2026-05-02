import { Link, useLocation } from 'react-router-dom';
import { Home, Search, BookOpen, Heart } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();

  const tabs = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Categories', path: '/categories', icon: BookOpen },
    { name: 'Favorites', path: '/favorites', icon: Heart },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-tg-bg border-t border-tg-hint/20 pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          return (
            <Link 
              key={tab.name} 
              to={tab.path} 
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-tg-button' : 'text-tg-hint hover:text-tg-text'}`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
