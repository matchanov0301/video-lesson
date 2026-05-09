import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainScreen from './pages/MainScreen';
import CategoriesScreen from './pages/CategoriesScreen';
import CategoryScreen from './pages/CategoryScreen';
import FavoritesScreen from './pages/FavoritesScreen';
import TopScreen from './pages/TopScreen';
import AdminPanel from './pages/AdminPanel';
import BottomNav from './components/BottomNav';
import WebApp from '@twa-dev/sdk';
import { useEffect, useState } from 'react';
import api from './api';
import { useTranslation } from 'react-i18next';

function App() {
  const { t } = useTranslation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Expand the Web App to full height
    WebApp.expand();
    
    // Check user auth and role
    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/me');
        setIsAdmin(response.data.is_admin);
        setLoading(false);
      } catch (err) {
        console.error("Auth error", err);
        setError(err.response?.data?.detail || t("Authentication failed. Make sure you are in the private group."));
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tg-button"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold mb-2">{t('Access Denied')}</h1>
        <p className="text-tg-hint">{error}</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-tg-bg text-tg-text">
        <Routes>
          <Route path="/" element={<MainScreen isAdmin={isAdmin} />} />
          <Route path="/categories" element={<CategoriesScreen />} />
          <Route path="/top" element={<TopScreen />} />
          <Route path="/favorites" element={<FavoritesScreen />} />
          <Route path="/category/:id" element={<CategoryScreen />} />
          {isAdmin && <Route path="/admin" element={<AdminPanel />} />}
        </Routes>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
