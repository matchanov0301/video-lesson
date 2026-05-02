import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import WebApp from '@twa-dev/sdk';
import { ChevronLeft, PlayCircle } from 'lucide-react';

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
        
        // Find category name (a bit of a hack, normally would have a dedicated endpoint)
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

  if (loading) {
    return <div className="p-4 text-center text-tg-hint">Loading lessons...</div>;
  }

  return (
    <div className="p-4 animate-in slide-in-from-right-4 duration-300">
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
              className="bg-tg-secondaryBg rounded-xl p-4 flex items-center justify-between shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="bg-tg-button text-tg-buttonText rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0">
                  {index + 1}
                </div>
                <h3 className="font-medium text-tg-text truncate">{lesson.title}</h3>
              </div>
              <PlayCircle className="text-tg-button shrink-0 ml-2" size={24} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
