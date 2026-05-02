import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Search, Heart, Clock, User, PlayCircle, Settings } from 'lucide-react';
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

  const openLesson = (url) => {
    WebApp.openTelegramLink(url);
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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-tg-text">Home</h1>
        {isAdmin && (
          <button 
            onClick={() => navigate('/admin')}
            className="p-2 rounded-full bg-tg-secondaryBg text-tg-button hover:opacity-80 transition-opacity"
          >
            <Settings size={20} />
          </button>
        )}
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search size={18} className="text-tg-hint" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by topic, speaker, or category..."
          className="w-full bg-tg-secondaryBg text-tg-text rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-tg-button transition-shadow"
        />
      </div>

      {loading && lessons.length === 0 ? (
        <div className="text-center py-10 text-tg-hint">Searching...</div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-10 text-tg-hint">
          <Search size={48} className="mx-auto mb-4 opacity-50" />
          <p>No lessons found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson) => (
            <div 
              key={lesson.id}
              onClick={() => openLesson(lesson.link)}
              className="bg-tg-secondaryBg rounded-xl p-4 shadow-sm active:scale-[0.98] transition-transform cursor-pointer flex flex-col"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-tg-text line-clamp-2 pr-2 leading-snug">{lesson.topic}</h3>
                <button 
                  onClick={(e) => toggleFavorite(e, lesson)} 
                  className={`shrink-0 p-1 transition-colors ${lesson.is_favorite ? 'text-red-500' : 'text-tg-hint'}`}
                >
                  <Heart size={20} fill={lesson.is_favorite ? "currentColor" : "none"} />
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
