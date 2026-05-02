import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import WebApp from '@twa-dev/sdk';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export default function AdminPanel() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [lessons, setLessons] = useState([]);
  
  // Forms state
  const [newCatName, setNewCatName] = useState("");
  const [newLesson, setNewLesson] = useState({ title: "", link: "", category_id: "" });

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
      WebApp.showAlert("Category added!");
    } catch (error) {
      WebApp.showAlert("Error adding category.");
    }
  };

  const deleteCategory = async (id) => {
    WebApp.showConfirm("Are you sure you want to delete this category?", async (confirmed) => {
      if (confirmed) {
        try {
          await api.delete(`/categories/${id}`);
          fetchData();
        } catch (error) {
          WebApp.showAlert("Error deleting category.");
        }
      }
    });
  };

  const addLesson = async (e) => {
    e.preventDefault();
    if (!newLesson.title || !newLesson.link || !newLesson.category_id) {
      WebApp.showAlert("Please fill all fields.");
      return;
    }
    if (!newLesson.link.startsWith("https://t.me/")) {
      WebApp.showAlert("Link must start with https://t.me/");
      return;
    }
    
    try {
      await api.post('/lessons', newLesson);
      setNewLesson({ title: "", link: "", category_id: "" });
      WebApp.showAlert("Lesson added successfully!");
    } catch (error) {
      WebApp.showAlert("Error adding lesson.");
    }
  };

  return (
    <div className="p-4 space-y-8 animate-in slide-in-from-right-4 duration-300">
      <h1 className="text-2xl font-bold text-tg-text">Admin Panel</h1>
      
      {/* Categories Management */}
      <div className="bg-tg-secondaryBg p-4 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-tg-text">Categories</h2>
        <form onSubmit={addCategory} className="flex gap-2 mb-4">
          <input 
            type="text" 
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="New Category Name" 
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

      {/* Lessons Management */}
      <div className="bg-tg-secondaryBg p-4 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-tg-text">Add Lesson</h2>
        <form onSubmit={addLesson} className="space-y-3">
          <select 
            value={newLesson.category_id}
            onChange={(e) => setNewLesson({...newLesson, category_id: e.target.value})}
            className="w-full bg-[var(--tg-theme-bg-color)] border border-tg-hint/30 rounded-lg px-3 py-2 text-tg-text focus:outline-none focus:border-tg-button"
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          
          <input 
            type="text" 
            value={newLesson.title}
            onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
            placeholder="Lesson Title" 
            className="w-full bg-[var(--tg-theme-bg-color)] border border-tg-hint/30 rounded-lg px-3 py-2 text-tg-text focus:outline-none focus:border-tg-button"
          />
          
          <input 
            type="url" 
            value={newLesson.link}
            onChange={(e) => setNewLesson({...newLesson, link: e.target.value})}
            placeholder="https://t.me/c/..." 
            className="w-full bg-[var(--tg-theme-bg-color)] border border-tg-hint/30 rounded-lg px-3 py-2 text-tg-text focus:outline-none focus:border-tg-button"
          />
          
          <button type="submit" className="w-full bg-tg-button text-tg-buttonText py-2.5 rounded-lg font-medium">
            Add Lesson
          </button>
        </form>
      </div>
    </div>
  );
}
