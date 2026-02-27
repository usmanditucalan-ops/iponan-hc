import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'fil' | 'ceb';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'dashboard': 'Dashboard',
    'appointments': 'Appointments',
    'patients': 'Patients',
    'medical_records': 'Medical Records',
    'users': 'Users',
    'vital_signs': 'Vital Signs',
    'inventory': 'Inventory',
    'settings': 'Settings',
    'logout': 'Logout',
    'welcome': 'Welcome',
    'good_morning': 'Good Morning',
    'good_afternoon': 'Good Afternoon',
    'good_evening': 'Good Evening',
    'today_appointments': "Today's Appointments",
    'upcoming_schedule': 'Upcoming Schedule',
    'recent_activity': 'Recent Activity',
    'quick_actions': 'Quick Actions',
    'my_health_portal': 'My Health Portal',
    'book_now': 'Book Now',
    'medical_dashboard': 'Medical Dashboard',
    'clinic_operations': 'Clinic Operations',
    'admin_overview': 'Admin Overview',
  },
  fil: {
    'dashboard': 'Dashboard',
    'appointments': 'Mga Appointment',
    'patients': 'Mga Pasyente',
    'medical_records': 'Rekord Medikal',
    'users': 'Mga User',
    'vital_signs': 'Vital Signs',
    'inventory': 'Imbentaryo',
    'settings': 'Mga Setting',
    'logout': 'Mag-logout',
    'welcome': 'Maligayang Pagdating',
    'good_morning': 'Magandang Umaga',
    'good_afternoon': 'Magandang Hapon',
    'good_evening': 'Magandang Gabi',
    'today_appointments': 'Mga Appointment Ngayon',
    'upcoming_schedule': 'Susunod na Iskedyul',
    'recent_activity': 'Kamakailang Aktibidad',
    'quick_actions': 'Mabilis na Aksyon',
    'my_health_portal': 'Aking Health Portal',
    'book_now': 'Mag-book Ngayon',
    'medical_dashboard': 'Medical Dashboard',
    'clinic_operations': 'Operasyon ng Klinika',
    'admin_overview': 'Pangkalahatang-ideya ng Admin',
  },
  ceb: {
    'dashboard': 'Dashboard',
    'appointments': 'Mga Appointment',
    'patients': 'Mga Pasyente',
    'medical_records': 'Rekord Medikal',
    'users': 'Mga User',
    'vital_signs': 'Vital Signs',
    'inventory': 'Imbentaryo',
    'settings': 'Mga Setting',
    'logout': 'Mag-logout',
    'welcome': 'Maayong Pag-abot',
    'good_morning': 'Maayong Buntag',
    'good_afternoon': 'Maayong Hapon',
    'good_evening': 'Maayong Gabii',
    'today_appointments': 'Mga Appointment Karon',
    'upcoming_schedule': 'Umaabot nga Iskedyul',
    'recent_activity': 'Bag-ong Aktibidad',
    'quick_actions': 'Dali nga Aksyon',
    'my_health_portal': 'Akong Health Portal',
    'book_now': 'Pag-book Karon',
    'medical_dashboard': 'Medical Dashboard',
    'clinic_operations': 'Operasyon sa Klinika',
    'admin_overview': 'Kinatibuk-ang Pagtan-aw sa Admin',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const storedLang = localStorage.getItem('app_language') as Language;
    if (storedLang && ['en', 'fil', 'ceb'].includes(storedLang)) {
      setLanguage(storedLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('app_language', lang);
    // Force reload to update all components without complex prop drilling, 
    // though React context typically handles this, a reload ensures clean state for this specific MVP architecture
    // window.location.reload(); 
    // Actually, Context is reactive, so reload shouldn't be needed if implemented correctly.
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
