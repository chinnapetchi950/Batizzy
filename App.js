import React, {useEffect} from 'react';
import MainNavigator from './src/navigation/MainNavigator';
import {
  LogBox,
  PermissionsAndroid,
  Platform,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import FlashMessage from 'react-native-flash-message';
import Geolocation from 'react-native-geolocation-service';
import {LanguageProvider} from './src/context/LanguageContext';

LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs(); // Ignore all log notifications

const App = () => {
  useEffect(() => {
    const requestLocationWithDelay = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Add 1-second delay
      requestLocationPermission();
    };
    requestLocationWithDelay();
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const fineLocationGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message:
              'We need access to your location to provide better services.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (fineLocationGranted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Fine location permission granted');
        } else {
          console.log('Fine location permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    } else if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization('whenInUse');
    }
  };
  return (
    <LanguageProvider>
      <View style={styles.wrapper}>
        <StatusBar backgroundColor={'white'} barStyle={'dark-content'} />
        <MainNavigator />
        <FlashMessage position="top" duration={3000} />
      </View>
    </LanguageProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
});
