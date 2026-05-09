import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function CategoriesScreen() {
  const { t } = useTranslation();
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
    return <div className="p-4 text-center text-muted">{t('loading_categories')}</div>;
  }

  return (
    <div className="p-4 animate-in fade-in duration-300 pb-24">
      <div className="flex items-center mb-6 sticky top-0 bg-[#111111]/90 backdrop-blur-md z-10 py-3 -mx-4 px-4 border-b border-gold/10">
        <BookOpen className="text-gold mr-3" size={24} />
        <h1 className="text-2xl font-bold text-tg-text tracking-wide">{t('categories')}</h1>
        <LanguageSwitcher />
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-10 text-muted">
          <BookOpen size={48} className="mx-auto mb-4 opacity-30 text-gold" />
          <p>{t('no_categories_yet')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {categories.map((category) => (
            <div 
              key={category.id}
              onClick={() => navigate(`/category/${category.id}`)}
              className="bg-card rounded-[20px] aspect-square p-5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-gold/20 hover:border-gold/50 active:scale-[0.98] transition-all cursor-pointer flex flex-col justify-end relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <BookOpen size={48} className="text-gold" />
              </div>
              <h2 className="text-lg font-bold mb-1 text-tg-text leading-tight z-10">{category.name}</h2>
              <div className="w-8 h-1 bg-gold rounded-full mt-2 group-hover:w-12 transition-all z-10 shadow-[0_0_8px_rgba(197,163,89,0.5)]"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

