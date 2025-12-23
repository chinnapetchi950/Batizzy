import React, {useEffect, useState} from 'react';
import {
  View,
  TouchableOpacity,
  ImageBackground,
  Image,
  Text,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {WebView} from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaView} from 'react-native-safe-area-context';
import {icons} from '../helper/imageConstants';
import Colors from '../helper/Colors';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import FontFamily from '../helper/FontFamily';
import Loader from '../common/Loader';
import {CommonActions} from '@react-navigation/native';
import {routes} from '../navigation/Routes';

const MOBILE_USER_AGENT =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15A372 Safari/604.1';

const injectedJs = `
  (function() {
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'viewport');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1');
  })();
  true;
`;

export default function MyWebView({navigation}) {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await AsyncStorage.getItem('accessToken');
      setToken(storedToken);
    };
    loadToken();
  }, []);

  // 📌 Internet checking (simple clean version)
  const checkInternet = () => {
    NetInfo.fetch().then(state => {
      if (!state.isConnected) {
        showInternetAlert();
      }
    });
  };

  // 📌 Show Alert + go to Home
  const showInternetAlert = () => {
    Alert.alert(
      'No Internet Connection',
      'Please check your connection and try again.',
      [
        {
          text: 'OK',
          onPress: () => {
            setTimeout(() => {
              navigation.dispatch(
                CommonActions.reset({
                  index: 1,
                  routes: [{name: routes.Tab}],
                }),
              );
            }, 100);
          },
        },
      ],
      {cancelable: false},
    );
  };

  // FIRST TIME — show Loader while fetching token
  if (!token) {
    return (
      <View style={styles.firstLoader}>
        <Loader />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        animated
        backgroundColor={Colors.white}
        barStyle="dark-content"
      />

      {/* HEADER */}
      <View style={styles.mainPadding}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ImageBackground
              source={icons.Bg}
              style={{height: 40, width: 40, justifyContent: 'center'}}>
              <Image
                source={icons.backIcon}
                style={{
                  height: 10,
                  width: 10,
                  tintColor: Colors.grayFont,
                  alignSelf: 'center',
                }}
              />
            </ImageBackground>
          </TouchableOpacity>
          <Text style={styles.headerText}>CRM & Invoice</Text>
        </View>
      </View>

      {/* WEBVIEW */}
      <View style={{flex: 1}}>
        <WebView
          source={{
            uri: `https://batizzy.com/professional_web_api/crm/dashboard?token=${token}`,
          }}
          injectedJavaScript={injectedJs}
          userAgent={MOBILE_USER_AGENT}
          javaScriptEnabled
          domStorageEnabled
          scalesPageToFit
          // Loader start
          onLoadStart={() => setIsLoading(true)}
          // Loader end + check internet
          onLoadEnd={() => {
            setIsLoading(false);
            checkInternet(); // ✅ Check ONLY after loading stops
          }}
          // Error handlers
          onError={() => {
            setIsLoading(false);
            showInternetAlert();
          }}
          onHttpError={() => {
            setIsLoading(false);
            showInternetAlert();
          }}
        />
      </View>

      {/* GLOBAL LOADER */}
      {isLoading && <Loader />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  firstLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainPadding: {
    padding: '4%',
  },
  headerText: {
    fontFamily: FontFamily.InterBlack,
    fontSize: responsiveFontSize(1.5),
    color: Colors.black,
    paddingLeft: 10,
  },
});
