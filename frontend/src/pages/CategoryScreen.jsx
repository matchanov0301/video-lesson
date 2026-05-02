import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import WebApp from '@twa-dev/sdk';
import { ChevronLeft, PlayCircle, Heart, User, Clock } from 'lucide-react';

export default function CategoryScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Setup back button
    WebApp.BackButton.show();
    const handleBack = () => navigate(-1);
    WebApp.BackButton.onClick(handleBack);

    return () => {
      WebApp.BackButton.offClick(handleBack);
      WebApp.BackButton.hide();
    };
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch lessons
        const lessonsRes = await api.get(`/lessons?category_id=${id}`);
        setLessons(lessonsRes.data);
        
        // Find category name
        const catsRes = await api.get('/categories');
        const cat = catsRes.data.find(c => c.id == id);
        if (cat) setCategoryName(cat.name);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

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

  if (loading) {
    return <div className="p-4 text-center text-tg-hint">Loading lessons...</div>;
  }

  return (
    <div className="p-4 animate-in slide-in-from-right-4 duration-300 pb-24">
      <h1 className="text-2xl font-bold text-tg-text mb-6">{categoryName || "Lessons"}</h1>
      
      {lessons.length === 0 ? (
        <div className="text-center py-10 text-tg-hint">
          <PlayCircle size={48} className="mx-auto mb-4 opacity-50" />
          <p>No lessons available in this category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson, index) => (
            <div 
              key={lesson.id}
              onClick={() => openLesson(lesson.link)}
              className="bg-tg-secondaryBg rounded-xl p-4 shadow-sm active:scale-[0.98] transition-transform cursor-pointer flex flex-col"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-start space-x-3 overflow-hidden pr-2">
                  <div className="bg-tg-button text-tg-buttonText rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold text-tg-text line-clamp-2 leading-snug pt-1">{lesson.topic}</h3>
                </div>
                <button 
                  onClick={(e) => toggleFavorite(e, lesson)} 
                  className={`shrink-0 p-1 transition-colors ${lesson.is_favorite ? 'text-red-500' : 'text-tg-hint'}`}
                >
                  <Heart size={20} fill={lesson.is_favorite ? "currentColor" : "none"} />
                </button>
              </div>

              <div className="flex flex-wrap gap-3 text-xs text-tg-hint mt-2 pl-11">
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
