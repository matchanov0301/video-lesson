import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    // If the language string contains uz-cyrl (like uz-cyrl-UZ) we check it
    const isCyrillic = i18n.language && i18n.language.includes('uz-cyrl');
    const nextLang = isCyrillic ? 'uz-latn' : 'uz-cyrl';
    i18n.changeLanguage(nextLang);
  };

  const isCyrillic = i18n.language && i18n.language.includes('uz-cyrl');

  return (
    <button 
      onClick={toggleLanguage}
      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-card border border-gold/20 shadow-[0_0_15px_rgba(197,163,89,0.1)] text-xs font-bold transition-all active:scale-95 hover:border-gold/40 ml-auto mr-3"
    >
      <span className={!isCyrillic ? 'text-gold' : 'text-muted hover:text-gold/70 transition-colors'}>O‘z</span>
      <span className="text-muted/30">|</span>
      <span className={isCyrillic ? 'text-gold' : 'text-muted hover:text-gold/70 transition-colors'}>Ўз</span>
    </button>
  );
}
