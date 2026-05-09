import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Search, Heart, Clock, User, Eye, Settings } from 'lucide-react';
import WebApp from '@twa-dev/sdk';

export default function MainScreen({ isAdmin }) {
  const [lessons, setLessons] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLessons();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLessons(searchQuery);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchLessons = async (q = "") => {
    setLoading(true);
    try {
      const endpoint = q.trim() ? `/lessons/search?q=${encodeURIComponent(q)}` : `/lessons`;
      const response = await api.get(endpoint);
      setLessons(response.data);
    } catch (error) {
      console.error("Failed to fetch lessons", error);
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
      <div className="sticky top-0 bg-[#111111]/90 backdrop-blur-md z-10 -mx-4 px-4 pt-4 pb-2 border-b border-gold/10 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-tg-text tracking-wide">Home</h1>
          {isAdmin && (
            <button 
              onClick={() => navigate('/admin')}
              className="p-2 rounded-full bg-card text-gold hover:opacity-80 transition-opacity border border-gold/20 shadow-[0_0_15px_rgba(197,163,89,0.15)]"
            >
              <Settings size={20} />
            </button>
          )}
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gold/60" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by topic, speaker, or category..."
            className="w-full bg-[#161616] border border-gold/20 text-tg-text rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all placeholder:text-muted/70 shadow-inner"
          />
        </div>
      </div>

      {loading && lessons.length === 0 ? (
        <div className="text-center py-10 text-tg-hint">Searching...</div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-10 text-tg-hint">
          <Search size={48} className="mx-auto mb-4 opacity-50" />
          <p>No lessons found.</p>
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
                  onClick={(e) => toggleFavorite(e, lesson)} 
                  className={`shrink-0 p-1 transition-colors ${lesson.is_favorite ? 'text-gold' : 'text-muted hover:text-gold/50'}`}
                >
                  <Heart size={20} fill={lesson.is_favorite ? "currentColor" : "none"} />
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
