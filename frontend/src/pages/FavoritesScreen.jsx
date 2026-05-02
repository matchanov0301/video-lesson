import { useState, useEffect } from 'react';
import api from '../api';
import WebApp from '@twa-dev/sdk';
import { Heart, PlayCircle, Clock, User } from 'lucide-react';

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

  const openLesson = (url) => {
    WebApp.openTelegramLink(url);
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
      <h1 className="text-2xl font-bold text-tg-text mb-6">Favorites</h1>
      
      {lessons.length === 0 ? (
        <div className="text-center py-10 text-tg-hint">
          <Heart size={48} className="mx-auto mb-4 opacity-30" />
          <p>You haven't saved any lessons yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson) => (
            <div 
              key={lesson.id}
              onClick={() => openLesson(lesson.link)}
              className="bg-tg-secondaryBg rounded-xl p-4 shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-tg-text line-clamp-2 pr-2">{lesson.topic}</h3>
                <button 
                  onClick={(e) => removeFavorite(e, lesson.id)} 
                  className="text-red-500 shrink-0 p-1"
                >
                  <Heart size={20} fill="currentColor" />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-3 text-xs text-tg-hint mt-2">
                {lesson.speaker && (
                  <div className="flex items-center">
                    <User size={14} className="mr-1" />
                    {lesson.speaker}
                  </div>
                )}
                {lesson.duration && (
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1" />
                    {lesson.duration}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
