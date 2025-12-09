import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

// Import translations
import en from './translations/en.json';
import fr from './translations/fr.json';
import de from './translations/de.json';
import AsyncStorage from '@react-native-async-storage/async-storage';

const resources = {
  en: {translation: en},
  fr: {translation: fr},
  de: {translation: de},
};

i18n
  .use(initReactI18next) // Pass the instance to react-i18next
  .init({
    resources, // Attach the translations
    fallbackLng: 'en',
    lng: 'en', // Set default language explicitly to English (or any other default language)
    supportedLngs: ['en', 'fr', 'de'], // List of supported languages
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export const updateLanguageFromAPI = async () => {
  try {
    // const response = await fetch('https://your-api-endpoint.com/user-language');
    // const data = await response.json();

    const preferredLanguage = JSON.parse(
      await AsyncStorage.getItem('Language'),
    );
    console.log('in print===>', preferredLanguage);
    if (i18n.options.supportedLngs.includes(preferredLanguage)) {
      i18n.changeLanguage(preferredLanguage); // Update the language dynamically
    } else {
      console.warn(`Unsupported language: ${preferredLanguage}`);
    }
  } catch (error) {
    console.error('Error fetching the language from API:', error);
  }
};

export default i18n;
