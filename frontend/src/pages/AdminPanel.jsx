import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import WebApp from '@twa-dev/sdk';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function AdminPanel() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [lessons, setLessons] = useState([]);
  
  // Forms state
  const [newCatName, setNewCatName] = useState("");
  const [newLesson, setNewLesson] = useState({ topic: "", speaker: "", duration: "", link: "", category_id: "" });
  const [sheetId, setSheetId] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    WebApp.BackButton.show();
    const handleBack = () => navigate(-1);
    WebApp.BackButton.onClick(handleBack);
    return () => {
      WebApp.BackButton.offClick(handleBack);
      WebApp.BackButton.hide();
    };
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const catsRes = await api.get('/categories');
      setCategories(catsRes.data);
      // Let's just fetch all lessons for admin view if we had an endpoint, but we don't. 
      // For now, we'll just manage categories and add lessons to them.
    } catch (error) {
      WebApp.showAlert("Failed to load data.");
    }
  };

  const addCategory = async (e) => {
    e.preventDefault();
    if (!newCatName) return;
    try {
      await api.post('/categories', { name: newCatName });
      setNewCatName("");
      fetchData();
      WebApp.showAlert(t('category_added'));
    } catch (error) {
      WebApp.showAlert(t('error_adding_category'));
    }
  };

  const deleteCategory = async (id) => {
    WebApp.showConfirm(t('delete_category_confirm'), async (confirmed) => {
      if (confirmed) {
        try {
          await api.delete(`/categories/${id}`);
          fetchData();
        } catch (error) {
          WebApp.showAlert(t('error_deleting_category'));
        }
      }
    });
  };

  const addLesson = async (e) => {
    e.preventDefault();
    if (!newLesson.topic || !newLesson.link || !newLesson.category_id) {
      WebApp.showAlert(t('fill_required_fields'));
      return;
    }
    if (!newLesson.link.startsWith("https://t.me/")) {
      WebApp.showAlert(t('link_must_start_with'));
      return;
    }
    
    try {
      await api.post('/lessons', newLesson);
      setNewLesson({ topic: "", speaker: "", duration: "", link: "", category_id: "" });
      WebApp.showAlert(t('lesson_added_successfully'));
    } catch (error) {
      WebApp.showAlert(t('error_adding_lesson'));
    }
  };

  const importFromSheets = async (e) => {
    e.preventDefault();
    if (!sheetId) {
      WebApp.showAlert(t('google_sheet_id'));
      return;
    }
    setIsImporting(true);
    try {
      const res = await api.post('/import/sheets', { sheet_id: sheetId });
      WebApp.showAlert(t('import_successful', { count: res.data.imported }));
      setSheetId("");
      fetchData(); // Refresh categories
    } catch (error) {
      WebApp.showAlert(t('error_importing'));
      console.error(error);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="p-4 space-y-8 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-tg-text">{t('admin_panel')}</h1>
        <LanguageSwitcher />
      </div>
      
      {/* Categories Management */}
      <div className="bg-tg-secondaryBg p-4 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-tg-text">{t('categories')}</h2>
        <form onSubmit={addCategory} className="flex gap-2 mb-4">
          <input 
            type="text" 
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder={t('new_category_name')}
            className="flex-1 bg-[var(--tg-theme-bg-color)] border border-tg-hint/30 rounded-lg px-3 py-2 text-tg-text focus:outline-none focus:border-tg-button"
          />
          <button type="submit" className="bg-tg-button text-tg-buttonText px-4 py-2 rounded-lg font-medium flex items-center">
            <Plus size={20} />
          </button>
        </form>
        
        <div className="space-y-2">
          {categories.map(cat => (
            <div key={cat.id} className="flex justify-between items-center p-3 bg-[var(--tg-theme-bg-color)] rounded-lg">
              <span className="text-tg-text">{cat.name}</span>
              <button onClick={() => deleteCategory(cat.id)} className="text-red-500 p-1">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Google Sheets Import */}
      <div className="bg-tg-secondaryBg p-4 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-tg-text">{t('import_google_sheets')}</h2>
        <form onSubmit={importFromSheets} className="space-y-3">
          <input 
            type="text" 
            value={sheetId}
            onChange={(e) => setSheetId(e.target.value)}
            placeholder={t('google_sheet_id')}
            className="w-full bg-[var(--tg-theme-bg-color)] border border-tg-hint/30 rounded-lg px-3 py-2 text-tg-text focus:outline-none focus:border-tg-button"
          />
          <button type="submit" disabled={isImporting} className="w-full bg-tg-button text-tg-buttonText py-2.5 rounded-lg font-medium opacity-100 disabled:opacity-50">
            {isImporting ? t('importing') : t('start_import')}
          </button>
        </form>
      </div>

      {/* Lessons Management */}
      <div className="bg-tg-secondaryBg p-4 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-tg-text">{t('add_manual_lesson')}</h2>
        <form onSubmit={addLesson} className="space-y-3">
          <select 
            value={newLesson.category_id}
            onChange={(e) => setNewLesson({...newLesson, category_id: e.target.value})}
            className="w-full bg-[var(--tg-theme-bg-color)] border border-tg-hint/30 rounded-lg px-3 py-2 text-tg-text focus:outline-none focus:border-tg-button"
          >
            <option value="">{t('select_category')}</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          
          <input 
            type="text" 
            value={newLesson.topic}
            onChange={(e) => setNewLesson({...newLesson, topic: e.target.value})}
            placeholder={t('topic_required')}
            className="w-full bg-[var(--tg-theme-bg-color)] border border-tg-hint/30 rounded-lg px-3 py-2 text-tg-text focus:outline-none focus:border-tg-button"
          />

          <input 
            type="text" 
            value={newLesson.speaker}
            onChange={(e) => setNewLesson({...newLesson, speaker: e.target.value})}
            placeholder={t('speaker_optional')}
            className="w-full bg-[var(--tg-theme-bg-color)] border border-tg-hint/30 rounded-lg px-3 py-2 text-tg-text focus:outline-none focus:border-tg-button"
          />

          <input 
            type="text" 
            value={newLesson.duration}
            onChange={(e) => setNewLesson({...newLesson, duration: e.target.value})}
            placeholder={t('duration_optional')}
            className="w-full bg-[var(--tg-theme-bg-color)] border border-tg-hint/30 rounded-lg px-3 py-2 text-tg-text focus:outline-none focus:border-tg-button"
          />
          
          <input 
            type="url" 
            value={newLesson.link}
            onChange={(e) => setNewLesson({...newLesson, link: e.target.value})}
            placeholder={t('link_required')}
            className="w-full bg-[var(--tg-theme-bg-color)] border border-tg-hint/30 rounded-lg px-3 py-2 text-tg-text focus:outline-none focus:border-tg-button"
          />
          
          <button type="submit" className="w-full bg-tg-button text-tg-buttonText py-2.5 rounded-lg font-medium">
            {t('add_lesson')}
          </button>
        </form>
      </div>
    </div>
  );
}
