import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import WebApp from '@twa-dev/sdk';
import { ChevronLeft, PlayCircle, Heart, User, Clock, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function CategoryScreen() {
  const { t } = useTranslation();
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

  if (loading) {
    return <div className="p-4 text-center text-tg-hint">{t('Loading lessons...')}</div>;
  }

  return (
    <div className="p-4 animate-in slide-in-from-right-4 duration-300 pb-24">
      <div className="flex items-center mb-6 sticky top-0 bg-[#111111]/90 backdrop-blur-md z-10 py-3 -mx-4 px-4 border-b border-gold/10">
        <h1 className="text-2xl font-bold text-tg-text tracking-wide">{categoryName || t('Lessons')}</h1>
        <LanguageSwitcher />
      </div>
      
      {lessons.length === 0 ? (
        <div className="text-center py-10 text-muted">
          <PlayCircle size={48} className="mx-auto mb-4 opacity-30 text-gold" />
          <p>{t('No lessons available in this category.')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {lessons.map((lesson, index) => (
            <div 
              key={lesson.id}
              onClick={() => openLesson(lesson)}
              className="bg-card rounded-2xl p-4 shadow-lg border border-gold/10 hover:border-gold/30 active:scale-[0.98] transition-all cursor-pointer flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-gold/50"></div>
              <div className="flex justify-between items-start mb-2 pl-2">
                <div className="flex items-start pr-2">
                  <span className="font-bold text-lg mr-3 mt-0.5 text-muted">#{index + 1}</span>
                  <h3 className="font-bold text-tg-text leading-snug">{lesson.topic}</h3>
                </div>
                <button 
                  onClick={(e) => toggleFavorite(e, lesson)} 
                  className={`shrink-0 p-1 transition-colors ${lesson.is_favorite ? 'text-gold' : 'text-muted hover:text-gold/50'}`}
                >
                  <Heart size={20} fill={lesson.is_favorite ? "currentColor" : "none"} />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted mt-2 pl-8">
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
                  {lesson.views_count || 0} {t('views')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
