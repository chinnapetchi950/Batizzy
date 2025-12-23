import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import ModalDropdown from 'react-native-modal-dropdown';
import {responsiveScreenFontSize} from 'react-native-responsive-dimensions';
import {useNavigation} from '@react-navigation/native';
import Modal from 'react-native-modal';
import {showMessage} from 'react-native-flash-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SignUpButton from '../common/SignUpButton';
import {icons} from '../helper/imageConstants';
import {hp, StatusBarHeight} from '../helper/constants';
import {routes} from '../navigation/Routes';
import {BASE_URL} from '../helper/ApiConstant';
import Colors from '../helper/Colors';
import Icons from '../common/Icons';
import FontFamily from '../helper/FontFamily';
import LanguageData from '../i18n/LanguageData';
import {CommonActions} from '@react-navigation/native';
import {useLanguage} from '../context/LanguageContext';

const {height} = Dimensions.get('window');

const Login = () => {
  const dropdownRef = useRef();

  const navigation = useNavigation();
  const {t} = useTranslation(); // Hook for translations

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isEmail, setIsEmail] = useState('');
  const [isPassword, setIsPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [storedLanguage, setStoredLanguage] = useState({});
  const {selectedLanguage, changeLanguage} = useLanguage();

  const UserLogin = async () => {
    const deviceToken = await AsyncStorage.getItem('deviceToken');
    setIsLoading(true);

    var formData = new FormData();
    formData.append('email', isEmail.trim());
    formData.append('password', isPassword.trim());
    formData.append('fcm_token', deviceToken);

    await fetch(BASE_URL + 'login', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    })
      .then(res => res.json())
      .then(res => {
        setIsLoading(false);
        if (res.status === true) {
          AsyncStorage.setItem('accessToken', res.token);
          AsyncStorage.setItem('userData', JSON.stringify(res.user));
          showMessage({
            message: res.message,
            floating: true,
            position: 'top',
            icon: 'success',
            type: 'success',
          });
          navigation.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [{name: routes.Tab}],
            }),
          );
        } else {
          handleApiError(res);
        }
      });
  };

  const handleApiError = response => {
    const {message, error_details} = response;
    showMessage({
      message: message || t('login.invalidEmail'),
      type: 'warning',
    });

    if (error_details) {
      Object.keys(error_details).forEach(field => {
        const formattedField = field.charAt(0).toUpperCase() + field.slice(1);
        showMessage({
          message: `${formattedField}: ${error_details[field][0]}`,
          type: 'warning',
        });
      });
    }
  };

  const onPressLogin = () => {
    if (!isEmail.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i)) {
      showMessage({
        message: t('login.invalidEmail'),
        type: 'warning',
      });
    } else if (isPassword === '') {
      showMessage({
        message: t('login.passwordRequired'),
        type: 'warning',
      });
    } else {
      UserLogin();
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const onSelectLanguage = async (index, value, image, code) => {
    setStoredLanguage({image: image, text: value});
    await AsyncStorage.setItem('Language', JSON.stringify(code));
    changeLanguage(code);
    dropdownRef.current.hide();
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      enabled
      keyboardVerticalOffset={Platform.select({ios: 0, android: 500})}>
      <StatusBar backgroundColor={Colors.white} barStyle={'dark-content'} />
      <View
        style={{
          paddingHorizontal: 10,
          paddingTop: 10,
          flexGrow: 1,
          justifyContent: 'space-between',
          flexDirection: 'row',
        }}>
        <View></View>
        <ModalDropdown
          ref={dropdownRef}
          dropdownStyle={[styles.dropdownViewLayout]}
          showsVerticalScrollIndicator={false}
          options={LanguageData}
          onSelect={(index, value, image, code) =>
            onSelectLanguage(index, value, image, code)
          }
          renderRow={(option, index, isSelected) => (
            <TouchableOpacity
              style={[
                styles.renderMainView,
                {backgroundColor: isSelected ? '#DDDDDD' : 'transparent'},
              ]}
              onPress={() =>
                onSelectLanguage(index, option.text, option.image, option.code)
              }>
              <Image
                resizeMode="contain"
                source={option.image}
                style={[styles.dropdownLang]}
              />
              <Text style={[styles.langText]}>{option.text}</Text>
            </TouchableOpacity>
          )}
          renderButtonText={({text}) => (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={[styles.langText]}>{text}</Text>
            </View>
          )}
          defaultValue={storedLanguage?.text || t('language.english')}>
          <View style={[styles.viewLangContainer]}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Image
                resizeMode="contain"
                source={storedLanguage?.image || icons.heartFill}
                style={[styles.dropdownLang]}
              />
              <Text style={[styles.langText, {paddingLeft: 6}]}>
                {storedLanguage?.text || t('language.english')}
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
      <ScrollView>
        <View style={styles.logoContainer}>
          <Image source={icons.Intro1} style={styles.logo} />
        </View>
        <View style={styles.formContainer}>
          <Text style={styles.title}>{t('login.title')}</Text>
          <Text style={styles.label}>{t('login.emailPlaceholder')}*</Text>
          <TextInput
            value={isEmail}
            style={styles.input}
            placeholder={t('login.emailPlaceholder')}
            onChangeText={text => setIsEmail(text)}
            placeholderTextColor={Colors.lightPlaceholder}
          />
          <Text style={styles.label}>{t('login.passwordPlaceholder')}*</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              value={isPassword}
              style={styles.passwordinput}
              placeholder={t('login.passwordPlaceholder')}
              placeholderTextColor={Colors.lightPlaceholder}
              secureTextEntry={!isPasswordVisible}
              onChangeText={text => setIsPassword(text)}
            />
            <Pressable
              style={styles.visibleContainer}
              onPress={togglePasswordVisibility}>
              <Image
                resizeMode="contain"
                source={isPasswordVisible ? icons.view : icons.hide}
                style={styles.icon}
              />
            </Pressable>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate(routes.ForgotPassword)}>
            <Text style={styles.forgotPassword}>
              {t('login.forgotPassword')}
            </Text>
          </TouchableOpacity>
          <View>
            <SignUpButton
              title={t('login.signInButton')}
              onPress={onPressLogin}
            />
          </View>
          <TouchableOpacity
            style={styles.signUpContainer}
            onPress={() => navigation.navigate(routes.CreateProfile1)}>
            <Text style={styles.signUpText}>
              {t('login.newUserText')}
              <Text style={styles.signUpLink}>{t('login.signUpText')}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Modal isVisible={isLoading} style={styles.modalContainer}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={'#754595'} />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: StatusBarHeight,
  },
  logoContainer: {
    marginBottom: 50,
    alignItems: 'center',
  },
  logo: {
    height: height * 0.3,
    resizeMode: 'contain',
    marginTop: 30,
  },
  formContainer: {
    flex: 1,
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 3,
  },
  title: {
    color: 'black',
    fontSize: responsiveScreenFontSize(3),
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Inter-Bold',
    marginTop: 30,
  },
  label: {
    fontSize: responsiveScreenFontSize(1.8),
    marginVertical: 8,
    color: Colors.fontDarkGray,
    fontFamily: FontFamily.InterBold,
  },
  input: {
    width: '100%',
    height: 48,
    borderColor: '#00000036',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
    color: Colors.fontDarkGray,
    fontFamily: FontFamily.InterBlack,
    fontSize: responsiveScreenFontSize(1.6),
  },
  passwordinput: {
    width: '100%',
    height: 48,
    borderColor: '#00000036',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
    color: Colors.fontDarkGray,
    fontFamily: FontFamily.InterMedium,
    fontSize: responsiveScreenFontSize(1.8),
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  visibleContainer: {
    position: 'absolute',
    right: 10,
    top: 15,
  },
  icon: {
    height: 20,
    width: 20,
  },
  forgotPassword: {
    textAlign: 'right',
    marginBottom: 20,
    color: Colors.fontDarkGray,
    fontSize: responsiveScreenFontSize(1.8),
    fontFamily: FontFamily.InterBlack,
  },
  signUpContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  signUpText: {
    color: Colors.fontDarkGray,
    fontFamily: FontFamily.InterBlack,
    fontSize: responsiveScreenFontSize(1.6),
  },
  signUpLink: {
    color: Colors.black,
    fontFamily: FontFamily.InterBold,
    fontSize: responsiveScreenFontSize(1.6),
  },
  modalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderContainer: {
    height: hp(8),
    width: hp(8),
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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

export default Login;
