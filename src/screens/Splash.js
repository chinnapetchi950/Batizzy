import React, {useCallback, useEffect} from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {images} from '../helper/imageConstants';
import {routes} from '../navigation/Routes';
import FastImage from 'react-native-fast-image';
import {useNavigation} from '@react-navigation/native';
import jwt_decode from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {navigate} from '../navigation/rootNavigator';
// import Geolocation from 'react-native-geolocation-service';
import Geolocation from '@react-native-community/geolocation';
import Colors from '../helper/Colors';

const FIRST_LAUNCH_KEY = '@MyApp:firstLaunch';
const ACCESS_TOKEN_KEY = 'accessToken';

const Splash = () => {
  const navigation = useNavigation();

  useEffect(() => {
    Geolocation.getCurrentPosition(
      position => {
        global.latitude = position?.coords?.latitude;
        global.longitude = position?.coords?.longitude;
      },
      error => {
        // See error code charts below.
        console.log(error.code, error.message);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  }, []);
  const checkFirstTimeUser = useCallback(async () => {
    try {
      const hasLaunchedBefore = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
      return hasLaunchedBefore === null;
    } catch (error) {
      console.error('Error checking first time user:', error);
      return true; // Assume it's the first time if there's an error
    }
  }, []);

  const setAppLaunched = useCallback(async () => {
    try {
      await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'true');
    } catch (error) {
      console.error('Error setting app launched:', error);
    }
  }, []);

  const loginCheck = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      if (token) {
        var decoded = jwt_decode(token);
        if (decoded.exp * 1000 < new Date().getTime()) {
          navigation.navigate(routes.Login);
        } else {
          navigation.navigate(routes.Tab);
        }
      } else {
        navigation.navigate(routes.Login);
      }
    } catch (error) {
      navigation.navigate(routes.Login);
    }
  }, [navigation]);

  const handleNavigation = useCallback(async () => {
    const isFirstTimeUser = await checkFirstTimeUser();
    if (isFirstTimeUser) {
      await setAppLaunched();
      navigation.navigate(routes.Login);
    } else {
      loginCheck();
    }
  }, [navigation, checkFirstTimeUser, setAppLaunched, loginCheck]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleNavigation();
    }, 2000);

    return () => clearTimeout(timer);
  }, [handleNavigation]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Colors.primary} barStyle={'light-content'} />
      <FastImage
        source={images.splashscreen}
        style={styles.gif}
        resizeMode={FastImage.resizeMode.contain}
      />
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#754595',
  },
  gif: {
    width: 200,
    height: 200,
  },
});
