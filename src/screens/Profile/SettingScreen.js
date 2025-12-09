import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Image,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import Colors from '../../helper/Colors';
import FontFamily from '../../helper/FontFamily';
import {RFPercentage} from 'react-native-responsive-fontsize';
import Icons from '../../common/Icons';
import {icons} from '../../helper/imageConstants';
import {routes} from '../../navigation/Routes';
import ModalDropdown from 'react-native-modal-dropdown';
import LanguageData from '../../i18n/LanguageData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_URL} from '../../helper/ApiConstant';
import {useFocusEffect} from '@react-navigation/native';
import axios from 'axios';
import Loader from '../../common/Loader';
import {navigate} from '../../navigation/rootNavigator';

const SettingScreen = props => {
  const dropdownRef = useRef();
  const {t} = useTranslation();
  const [storedLanguage, setStoredLanguage] = useState({});
  const [userData, setUserData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const gotoChangePasswordScreen = () => {
    props.navigation.navigate(routes.ChangePasswordScreen);
  };

  const goBack = () => {
    props.navigation.goBack();
  };

  const gotoDeleteAccount = () => {
    props.navigation.navigate(routes.DeleteAccountScreen);
  };

  useFocusEffect(
    useCallback(() => {
      const onScreenFocus = async () => {
        await getUserData();
      };
      onScreenFocus();
    }, [getUserData]),
  );

  const getUserData = async () => {
    var Token = await AsyncStorage.getItem('accessToken');
    setIsLoading(true);
    axios({
      method: 'get',
      url: BASE_URL + `profile`,
      headers: {
        Authorization: 'Bearer' + Token,
        Accept: 'application/json',
      },
    })
      .then(function (response) {
        setIsLoading(false);
        setUserData(response.data.data);
        const selectedCodeLang = LanguageData.find(
          lang => lang.code === response.data.data.lang,
        );
        setStoredLanguage(selectedCodeLang);
      })
      .catch(error => {
        setIsLoading(false);
      });
  };

  const onSelectLanguage = async (index, value, image, code) => {
    setStoredLanguage({image: image, text: value});
    await AsyncStorage.setItem('Language', JSON.stringify(code));
    updateLanguageCode(code);
    dropdownRef.current.hide();
  };

  const updateLanguageCode = async code => {
    var Token = await AsyncStorage.getItem('accessToken');
    setIsLoading(true);
    const data = {
      lang: code,
      _method: 'put',
    };

    axios({
      method: 'post',
      url: BASE_URL + `set_language`,
      headers: {
        Authorization: 'Bearer' + Token,
        Accept: 'application/json',
      },
      data: data,
    })
      .then(function (response) {
        setIsLoading(false);
      })
      .catch(error => {
        setIsLoading(false);
      });
  };

  const gotoNavigationList = () => {
    props.navigation.navigate(routes.NotificationListScreen);
  };

  return (
    <SafeAreaProvider style={[ProfileStyle.detailsHeadercontainer]}>
      <SafeAreaView>
        <StatusBar animated={true} backgroundColor={Colors.white} />
        <View style={[ProfileStyle.headerConatiner]}>
          <TouchableOpacity onPress={() => goBack()}>
            <ImageBackground
              source={icons.Bg}
              style={{
                height: 40,
                width: 40,
                justifyContent: 'center',
              }}>
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Icons
                  iconName={'arrow-back-outline'}
                  iconSetName={'Ionicons'}
                  iconColor={Colors.black}
                  iconSize={20}
                />
              </View>
            </ImageBackground>
          </TouchableOpacity>
          <Text style={[ProfileStyle.headerDetailsText]}>
            {t('settings.title')}
          </Text>
          <View>
            <TouchableOpacity onPress={() => gotoNavigationList()}>
              <ImageBackground
                source={icons.Bg}
                style={{height: 40, width: 40, justifyContent: 'center'}}>
                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Icons
                    iconName={'notifications-sharp'}
                    iconSetName={'Ionicons'}
                    iconColor={Colors.black}
                    iconSize={20}
                  />
                </View>
              </ImageBackground>
            </TouchableOpacity>
            {userData?.unread_notifications_count != 0 && (
              <View style={[ProfileStyle.bedgeStyel]}>
                <Text style={[ProfileStyle.bedgeText]}>
                  {userData?.unread_notifications_count}
                </Text>
              </View>
            )}
          </View>
        </View>
        <View>
          <Text style={[ProfileStyle.cardTitle]}>
            {t('settings.generaltitle')}
          </Text>
          <View
            style={{
              flexGrow: 1,
              justifyContent: 'space-between',
              flexDirection: 'row',
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 20,
              }}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Icons
                  iconName={'language'}
                  iconSetName={'FontAwesome'}
                  iconColor={Colors.primary}
                  iconSize={24}
                />
                <Text style={[ProfileStyle.bookingTitle]}>
                  {t('settings.changeLanguage')}
                </Text>
              </View>
            </View>
            <ModalDropdown
              ref={dropdownRef}
              dropdownStyle={[ProfileStyle.dropdownViewLayout]}
              showsVerticalScrollIndicator={false}
              options={LanguageData}
              onSelect={(index, value, image, code) =>
                onSelectLanguage(index, value, image, code)
              }
              renderRow={(option, index, isSelected) => (
                <TouchableOpacity
                  style={[
                    ProfileStyle.renderMainView,
                    {
                      backgroundColor: isSelected ? '#DDDDDD' : 'transparent',
                    },
                  ]}
                  onPress={() =>
                    onSelectLanguage(
                      index,
                      option.text,
                      option.image,
                      option.code,
                    )
                  }>
                  <Image
                    resizeMode="contain"
                    source={option.image}
                    style={[ProfileStyle.dropdownLang]}
                  />

                  <Text style={[ProfileStyle.langText]}>{option.text}</Text>
                </TouchableOpacity>
              )}
              renderButtonText={({text}) => (
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={[ProfileStyle.langText]}>{text}</Text>
                </View>
              )}
              defaultValue={storedLanguage?.text || 'English'}>
              <View style={[ProfileStyle.viewLangContainer]}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Image
                    resizeMode="contain"
                    source={storedLanguage?.image || icons.english}
                    style={[ProfileStyle.dropdownLang]}
                  />
                  <Text style={[ProfileStyle.langText, {paddingLeft: 6}]}>
                    {storedLanguage?.text || 'English'}
                  </Text>
                </View>
                <Icons
                  iconSetName={'FontAwesome6'}
                  iconName={'caret-down'}
                  iconColor={Colors.primary}
                  iconSize={20}
                />
              </View>
            </ModalDropdown>
          </View>
          <TouchableOpacity onPress={() => gotoChangePasswordScreen()}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 20,
              }}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Icons
                  iconName={'password'}
                  iconSetName={'MaterialIcons'}
                  iconColor={Colors.primary}
                  iconSize={20}
                />
                <Text style={[ProfileStyle.bookingTitle]}>
                  {t('settings.changePassword')}
                </Text>
              </View>
              <View>
                <Icons
                  iconName={'arrow-right'}
                  iconSetName={'MaterialIcons'}
                  iconColor={Colors.black}
                  iconSize={28}
                />
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => gotoDeleteAccount()}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 20,
              }}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Icons
                  iconName={'user-minus'}
                  iconSetName={'FontAwesome6'}
                  iconColor={Colors.primary}
                  iconSize={16}
                />
                <Text style={[ProfileStyle.bookingTitle]}>
                  {t('settings.deleteAccount')}
                </Text>
              </View>
              <View>
                <Icons
                  iconName={'arrow-right'}
                  iconSetName={'MaterialIcons'}
                  iconColor={Colors.black}
                  iconSize={28}
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => {
            navigate(routes.AboutScreen, {screenName: 'terms_conditions'});
          }}>
          <View style={{marginTop: 30}}>
            <Text style={[ProfileStyle.title]}>
              {t('settings.terms_conditions')}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigate(routes.AboutScreen, {screenName: 'privacy_policy'});
          }}>
          <View style={{marginTop: 30}}>
            <Text style={[ProfileStyle.title]}>
              {t('settings.privacy_policy')}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigate(routes.AboutScreen, {screenName: 'cancellation_policy'});
          }}>
          <View style={{marginTop: 30}}>
            <Text style={[ProfileStyle.title]}>
              {t('settings.cancellation_policy')}
            </Text>
          </View>
        </TouchableOpacity>
      </SafeAreaView>
      {isLoading && <Loader />}
    </SafeAreaProvider>
  );
};

export default SettingScreen;

const ProfileStyle = StyleSheet.create({
  detailsHeadercontainer: {
    padding: '4%',
    backgroundColor: Colors.white,
  },
  headerConatiner: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  headerConatinerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bedgeStyel: {
    backgroundColor: Colors.red,
    borderRadius: 10,
    alignSelf: 'center',
    paddingHorizontal: 6,
    marginTop: -50,
    marginLeft: 20,
  },
  bedgeText: {
    fontFamily: FontFamily.InterRegular,
    fontSize: RFPercentage(1.6),
    color: Colors.white,
  },
  headerDetailsText: {
    fontFamily: FontFamily.InterSemiBold,
    fontSize: RFPercentage(1.6),
    color: Colors.black,
    marginTop: 10,
  },
  dummyImgProfile: {
    height: 50,
    width: 50,
    borderRadius: 50,
  },
  dummyImgContinaer: {
    height: 50,
    width: 50,
    borderRadius: 50,
    backgroundColor: Colors.grayBG,
  },
  usernameText: {
    fontFamily: FontFamily.InterSemiBold,
    fontSize: RFPercentage(1.6),
    color: Colors.black,
  },
  phoneNumbText: {
    fontFamily: FontFamily.InterRegular,
    fontSize: RFPercentage(1.6),
    color: Colors.black,
  },
  bookingText: {
    fontFamily: FontFamily.InterBold,
    fontSize: RFPercentage(1.6),
    color: Colors.primary,
  },
  bookingcontainer: {
    marginTop: 20,
  },
  typeText: {
    fontFamily: FontFamily.InterRegular,
    fontSize: RFPercentage(1.6),
    color: Colors.black,
    marginVertical: 10,
  },
  paidContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingTitle: {
    fontFamily: FontFamily.Inter,
    color: Colors.black,
    marginLeft: 20,
    fontSize: RFPercentage(1.6),
  },
  title: {
    fontFamily: FontFamily.InterBold,
    fontSize: RFPercentage(2),
    color: Colors.black,
  },
  cardTitle: {
    fontFamily: FontFamily.InterBold,
    fontSize: RFPercentage(1.6),
    color: Colors.black,
  },
  dropdownViewLayout: {
    borderRadius: 10,
    color: Colors.fontGray,
    borderColor: Colors.borderLight,
    borderWidth: 0.5,
    height: 'auto',
  },
  dropdownLang: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
  },
  viewLangContainer: {
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: Colors.primary,
    borderWidth: 0.5,
    paddingHorizontal: 6,
    paddingVertical: 10,
  },
  renderMainView: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  langText: {
    color: Colors.fontDarkGray,
    fontFamily: FontFamily.InterMedium,
    fontSize: 12,
    paddingHorizontal: 10,
  },
});
