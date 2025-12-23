import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n, {updateLanguageFromAPI} from '../i18n';

const LanguageContext = createContext();

export const LanguageProvider = ({children}) => {
  const [selectedLanguage, setSelectedLanguage] = useState(
    i18n.language || 'en',
  );
  const [loading, setLoading] = useState(true);

  // Load the language saved locally or from the API once on mount.
  useEffect(() => {
    const initLanguage = async () => {
      try {
        const stored = await AsyncStorage.getItem('Language');
        const parsed = stored ? JSON.parse(stored) : null;

        if (parsed && i18n.options.supportedLngs.includes(parsed)) {
          await i18n.changeLanguage(parsed);
          setSelectedLanguage(parsed);
        } else {
          // Try to fetch language preference from API helper (already handles errors).
          await updateLanguageFromAPI();
          setSelectedLanguage(i18n.language || 'en');
        }
      } catch (error) {
        console.warn('Failed to load language preference', error);
      } finally {
        setLoading(false);
      }
    };

    initLanguage();
  }, []);

  const changeLanguage = useCallback(async lng => {
    if (!i18n.options.supportedLngs.includes(lng)) {
      console.warn(`Unsupported language: ${lng}`);
      return;
    }

    try {
      await i18n.changeLanguage(lng);
      await AsyncStorage.setItem('Language', JSON.stringify(lng));
      setSelectedLanguage(lng);
    } catch (error) {
      console.warn('Failed to change language', error);
    }
  }, []);

  const value = useMemo(
    () => ({
      selectedLanguage,
      changeLanguage,
      loading,
    }),
    [selectedLanguage, changeLanguage, loading],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

export default LanguageContext;





