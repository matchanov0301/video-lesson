import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Heart, Clock, User, Eye, Trophy } from 'lucide-react';
import WebApp from '@twa-dev/sdk';

export default function TopScreen() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopLessons = async () => {
      try {
        const response = await api.get('/lessons/top?limit=20');
        setLessons(response.data);
      } catch (error) {
        console.error("Failed to fetch top lessons", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopLessons();
  }, []);

  const openLesson = async (lesson) => {
    try {
      await api.post(`/lessons/${lesson.id}/view`);
    } catch (e) {
      console.error(e);
    }
    WebApp.openTelegramLink(lesson.link);
  };

  const toggleFavorite = async (e, lesson) => {
    e.stopPropagation();
    try {
      if (lesson.is_favorite) {
        await api.delete(`/favorites/${lesson.id}`);
        setLessons(lessons.map(l => l.id === lesson.id ? { ...l, is_favorite: false } : l));
      } else {
        await api.post('/favorites', { lesson_id: lesson.id });
        setLessons(lessons.map(l => l.id === lesson.id ? { ...l, is_favorite: true } : l));
      }
    } catch (error) {
      console.error("Failed to toggle favorite", error);
    }
  };

  return (
    <div className="p-4 animate-in fade-in duration-300 pb-24">
      <div className="flex items-center mb-6 sticky top-0 bg-[#111111]/90 backdrop-blur-md z-10 py-3 -mx-4 px-4 border-b border-gold/10">
        <Trophy className="text-gold mr-3" size={24} />
        <h1 className="text-2xl font-bold text-tg-text tracking-wide">Top Viewed</h1>
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted">Loading top lessons...</div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-10 text-muted">
          <Trophy size={48} className="mx-auto mb-4 opacity-30 text-gold" />
          <p>No top lessons yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {lessons.map((lesson, index) => (
            <div 
              key={lesson.id}
              onClick={() => openLesson(lesson)}
              className="bg-card rounded-2xl p-4 shadow-lg border border-gold/10 hover:border-gold/30 active:scale-[0.98] transition-all cursor-pointer flex flex-col relative overflow-hidden"
            >
              {index < 3 && <div className="absolute top-0 left-0 w-1 h-full bg-gold/70"></div>}
              
              <div className="flex justify-between items-start mb-3 pl-2">
                <div className="flex items-start">
                  <span className={`font-bold text-lg mr-3 mt-0.5 ${index < 3 ? 'text-gold' : 'text-muted'}`}>#{index + 1}</span>
                  <h3 className="font-bold text-tg-text pr-2 leading-snug">{lesson.topic}</h3>
                </div>
                <button 
                  onClick={(e) => toggleFavorite(e, lesson)} 
                  className={`shrink-0 p-1 transition-colors ${lesson.is_favorite ? 'text-gold' : 'text-muted hover:text-gold/50'}`}
                >
                  <Heart size={20} fill={lesson.is_favorite ? "currentColor" : "none"} />
                </button>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted mt-1 pl-8">
                {lesson.speaker && (
                  <div className="flex items-center">
                    <User size={14} className="mr-1 text-gold/50" />
                    {lesson.speaker}
                  </div>
                )}
                {lesson.duration && (
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1 text-gold/50" />
                    {lesson.duration}
                  </div>
                )}
                <div className="flex items-center text-gold/80 ml-auto font-medium">
                  <Eye size={14} className="mr-1" />
                  {lesson.views_count || 0}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
