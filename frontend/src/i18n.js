import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import WebApp from '@twa-dev/sdk';

// Inline translations to completely bypass any bundler/import resolution bugs
const uzLatn = {
  "home": "Asosiy",
  "categories": "Kategoriyalar",
  "top": "Top",
  "top_viewed": "Top Ko‘rilgan",
  "favorites": "Sevimlilar",
  "search_placeholder": "Mavzu, spiker yoki kategoriya bo‘yicha qidirish...",
  "searching": "Qidirilmoqda...",
  "no_lessons_found": "Darslar topilmadi.",
  "views": "ko‘rish",
  "loading_categories": "Kategoriyalar yuklanmoqda...",
  "no_categories_yet": "Kategoriyalar hali mavjud emas.",
  "loading_top_lessons": "Top darslar yuklanmoqda...",
  "no_top_lessons_yet": "Hali top darslar yo‘q.",
  "loading_favorites": "Sevimlilar yuklanmoqda...",
  "no_saved_lessons": "Siz hali hech qanday darsni saqlamadingiz.",
  "lessons": "Darslar",
  "loading_lessons": "Darslar yuklanmoqda...",
  "no_lessons_in_category": "Ushbu kategoriyada darslar mavjud emas.",
  "admin_panel": "Admin Panel",
  "new_category_name": "Yangi kategoriya nomi",
  "category_added": "Kategoriya qo‘shildi!",
  "error_adding_category": "Kategoriya qo‘shishda xato.",
  "delete_category_confirm": "Haqiqatan ham bu kategoriyani o‘chirmoqchimisiz?",
  "error_deleting_category": "Kategoriya o‘chirishda xato.",
  "import_google_sheets": "Google Sheets-dan import qilish",
  "google_sheet_id": "Google Sheet ID (masalan 10ByL...)",
  "import_successful": "Import muvaffaqiyatli yakunlandi! {{count}} ta dars import qilindi.",
  "error_importing": "Google Sheets-dan import qilishda xato.",
  "importing": "Import qilinmoqda...",
  "start_import": "Importni boshlash",
  "add_manual_lesson": "Qo‘lda dars qo‘shish",
  "select_category": "Kategoriyani tanlang",
  "topic_required": "Mavzu (Majburiy)",
  "speaker_optional": "Spiker (Ixtiyoriy)",
  "duration_optional": "Davomiyligi (masalan 15:30) (Ixtiyoriy)",
  "link_required": "https://t.me/c/... (Majburiy)",
  "add_lesson": "Darsni qo‘shish",
  "fill_required_fields": "Iltimos, kerakli maydonlarni to‘ldiring (Mavzu, Havola, Kategoriya).",
  "link_must_start_with": "Havola https://t.me/ bilan boshlanishi kerak",
  "lesson_added_successfully": "Dars muvaffaqiyatli qo‘shildi!",
  "error_adding_lesson": "Dars qo‘shishda xato.",
  "access_denied": "Ruxsat rad etildi",
  "auth_failed": "Avtorizatsiya xatosi. Yopiq guruhda ekanligingizga ishonch hosil qiling."
};

const uzCyrl = {
  "home": "Асосий",
  "categories": "Категориялар",
  "top": "Топ",
  "top_viewed": "Топ Кўрилган",
  "favorites": "Севимлилар",
  "search_placeholder": "Мавзу, спикер ёки категория бўйича қидириш...",
  "searching": "Қидирилмоқда...",
  "no_lessons_found": "Дарслар топилмади.",
  "views": "кўриш",
  "loading_categories": "Категориялар юкланмоқда...",
  "no_categories_yet": "Категориялар ҳали мавжуд эмас.",
  "loading_top_lessons": "Топ дарслар юкланмоқда...",
  "no_top_lessons_yet": "Ҳали топ дарслар йўқ.",
  "loading_favorites": "Севимлилар юкланмоқда...",
  "no_saved_lessons": "Сиз ҳали ҳеч қандай дарсни сақламадингиз.",
  "lessons": "Дарслар",
  "loading_lessons": "Дарслар юкланмоқда...",
  "no_lessons_in_category": "Ушбу категорияда дарслар мавжуд эмас.",
  "admin_panel": "Админ Панел",
  "new_category_name": "Янги категория номи",
  "category_added": "Категория қўшилди!",
  "error_adding_category": "Категория қўшишда хато.",
  "delete_category_confirm": "Ҳақиқатан ҳам бу категорияни ўчирмоқчимисиз?",
  "error_deleting_category": "Категория ўчиришда хато.",
  "import_google_sheets": "Google Sheets-дан импорт қилиш",
  "google_sheet_id": "Google Sheet ID (масалан 10ByL...)",
  "import_successful": "Импорт муваффақиятли якунланди! {{count}} та дарс импорт қилинди.",
  "error_importing": "Google Sheets-дан импорт қилишда хато.",
  "importing": "Импорт қилинмоқда...",
  "start_import": "Импортни бошлаш",
  "add_manual_lesson": "Қўлда дарс қўшиш",
  "select_category": "Категорияни танланг",
  "topic_required": "Мавзу (Мажбурий)",
  "speaker_optional": "Спикер (Ихтиёрий)",
  "duration_optional": "Давомийлиги (масалан 15:30) (Ихтиёрий)",
  "link_required": "https://t.me/c/... (Мажбурий)",
  "add_lesson": "Дарсни қўшиш",
  "fill_required_fields": "Илтимос, керакли майдонларни тўлдиринг (Мавзу, Ҳавола, Категория).",
  "link_must_start_with": "Ҳавола https://t.me/ билан бошланиши керак",
  "lesson_added_successfully": "Дарс муваффақиятли қўшилди!",
  "error_adding_lesson": "Дарс қўшишда хато.",
  "access_denied": "Рухсат рад этилди",
  "auth_failed": "Авторизация хатоси. Ёпиқ гуруҳда эканлигингизга ишонч ҳосил қилинг."
};

const resources = {
  'uz-latn': { translation: uzLatn },
  'uz-cyrl': { translation: uzCyrl }
};

// Intercept WebApp language code
let defaultLang = 'uz-latn';
try {
  if (WebApp.initDataUnsafe?.user?.language_code === 'uz-cyrl') {
    defaultLang = 'uz-cyrl';
  }
} catch (e) {
  // ignore
}

// Safely access localStorage to prevent Telegram WebApp SecurityErrors
let savedLang = null;
try {
  savedLang = localStorage.getItem('i18nextLng');
} catch (e) {
  console.warn("localStorage not available:", e);
}
const initialLang = (savedLang === 'uz-latn' || savedLang === 'uz-cyrl') ? savedLang : defaultLang;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLang, // Force exact language
    fallbackLng: 'uz-latn', // Strict fallback to our primary locale
    supportedLngs: ['uz-latn', 'uz-cyrl'], // Disallow any other languages like "ru" or "en"
    defaultNS: 'translation',
    ns: ['translation'],
    debug: true,
    interpolation: {
      escapeValue: false 
    }
  });

// Save to localStorage when language changes via LanguageSwitcher
i18n.on('languageChanged', (lng) => {
  if (lng === 'uz-latn' || lng === 'uz-cyrl') {
    try {
      localStorage.setItem('i18nextLng', lng);
    } catch (e) {
      console.warn("Could not save language to localStorage:", e);
    }
  }
});

export default i18n;
