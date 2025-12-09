import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import Colors from '../../helper/Colors';
import FontFamily from '../../helper/FontFamily';
import {icons} from '../../helper/imageConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_URL} from '../../helper/ApiConstant';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import Loader from '../../common/Loader';

const AboutScreen = props => {
  const screenName = props.route.params?.screenName;
  const {t} = useTranslation(); // Use the translation hook
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(false);
  const [aboutData, setAboutData] = useState();

  useEffect(() => {
    gotosaveToken();
  }, []);

  const gotosaveToken = async () => {
    var Token = await AsyncStorage.getItem('accessToken');
    getAboutData(Token);
  };

  const getAboutData = async Token => {
    setIsLoading(true);
    axios({
      method: 'get',
      url: BASE_URL + `cms?for=${screenName}`,
      headers: {
        Authorization: 'Bearer ' + Token,
        Accept: 'application/json',
      },
    })
      .then(function (response) {
        setIsLoading(false);
        setAboutData(response.data.data?.description);
      })
      .catch(error => {
        setIsLoading(false);
      });
  };
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar animated={true} backgroundColor={Colors.white} />
        <View style={[styles.mainPadding]}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}>
              <ImageBackground
                source={icons.Bg}
                style={{height: 40, width: 40, justifyContent: 'center'}}>
                <Image
                  source={icons.backIcon}
                  style={{
                    height: 10,
                    width: 10,
                    tintColor: Colors.grayFont,
                    alignItems: 'center',
                    alignSelf: 'center',
                  }}
                />
              </ImageBackground>
            </TouchableOpacity>
            <Text style={[styles.headerText]}>
              {screenName == 'terms_conditions'
                ? t('settings.terms_conditions')
                : screenName == 'privacy_policy'
                ? t('settings.privacy_policy')
                : screenName == 'cancellation_policy'
                ? t('settings.cancellation_policy')
                : t('aboutScreen.aboutUs')}
            </Text>
          </View>
          <Text
            style={{
              paddingTop: 10,
              fontSize: 14,
              color: Colors.black,
              lineHeight: 20,
            }}>
            {aboutData}
          </Text>
        </View>
        {isLoading && <Loader />}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default AboutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
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
