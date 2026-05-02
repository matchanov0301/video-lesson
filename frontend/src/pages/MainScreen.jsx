import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { BookOpen, Settings } from 'lucide-react';

export default function MainScreen({ isAdmin }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return <div className="p-4 text-center text-tg-hint">Loading categories...</div>;
  }

  return (
    <div className="p-4 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-tg-text">Library</h1>
        {isAdmin && (
          <button 
            onClick={() => navigate('/admin')}
            className="p-2 rounded-full bg-tg-secondaryBg text-tg-button hover:opacity-80 transition-opacity"
          >
            <Settings size={20} />
          </button>
        )}
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-10 text-tg-hint">
          <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
          <p>No categories available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((category) => (
            <div 
              key={category.id}
              onClick={() => navigate(`/category/${category.id}`)}
              className="bg-tg-secondaryBg rounded-2xl p-5 shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
            >
              <h2 className="text-lg font-semibold mb-1 text-tg-text">{category.name}</h2>
              <p className="text-sm text-tg-hint flex items-center mt-2">
                <span className="text-tg-button mr-1">View lessons</span> →
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
