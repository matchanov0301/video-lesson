import { useState, useEffect } from 'react';
import api from '../api';
import WebApp from '@twa-dev/sdk';
import { Heart, PlayCircle, Clock, User, Eye } from 'lucide-react';

export default function FavoritesScreen() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await api.get('/favorites');
      setLessons(res.data);
    } catch (error) {
      console.error("Failed to fetch favorites", error);
    } finally {
      setLoading(false);
    }
  };

  const openLesson = async (lesson) => {
    try {
      await api.post(`/lessons/${lesson.id}/view`);
    } catch (e) {
      console.error(e);
    }
    WebApp.openTelegramLink(lesson.link);
  };

  const removeFavorite = async (e, id) => {
    e.stopPropagation();
    try {
      await api.delete(`/favorites/${id}`);
      setLessons(lessons.filter(l => l.id !== id));
    } catch (error) {
      console.error("Failed to remove favorite", error);
    }
  };

  if (loading) {
    return <div className="p-4 text-center text-tg-hint">Loading favorites...</div>;
  }

  return (
    <div className="p-4 animate-in fade-in duration-300 pb-24">
      <div className="flex items-center mb-6 sticky top-0 bg-[#111111]/90 backdrop-blur-md z-10 py-3 -mx-4 px-4 border-b border-gold/10">
        <Heart className="text-gold mr-3" size={24} fill="currentColor" />
        <h1 className="text-2xl font-bold text-tg-text tracking-wide">Favorites</h1>
      </div>
      
      {lessons.length === 0 ? (
        <div className="text-center py-10 text-muted">
          <Heart size={48} className="mx-auto mb-4 opacity-30 text-gold" />
          <p>You haven't saved any lessons yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {lessons.map((lesson) => (
            <div 
              key={lesson.id}
              onClick={() => openLesson(lesson)}
              className="bg-card rounded-2xl p-4 shadow-lg border border-gold/10 hover:border-gold/30 active:scale-[0.98] transition-all cursor-pointer flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-gold/50"></div>
              <div className="flex justify-between items-start mb-2 pl-2">
                <h3 className="font-bold text-tg-text line-clamp-2 pr-2 leading-snug">{lesson.topic}</h3>
                <button 
                  onClick={(e) => removeFavorite(e, lesson.id)} 
                  className="text-gold shrink-0 p-1 hover:text-gold/50 transition-colors"
                >
                  <Heart size={20} fill="currentColor" />
                </button>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted mt-2 pl-2">
                {lesson.speaker && (
                  <div className="flex items-center">
                    <User size={14} className="mr-1 text-gold/70" />
                    {lesson.speaker}
                  </div>
                )}
                {lesson.duration && (
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1 text-gold/70" />
                    {lesson.duration}
                  </div>
                )}
                <div className="flex items-center text-gold/80 ml-auto font-medium">
                  <Eye size={14} className="mr-1" />
                  {lesson.views_count || 0} views
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
