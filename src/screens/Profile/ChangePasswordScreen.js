import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import React, {useEffect, useState} from 'react';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import Input from '../../common/Input';
import Colors from '../../helper/Colors';
import {icons} from '../../helper/imageConstants';
import FontFamily from '../../helper/FontFamily';
import {RFPercentage} from 'react-native-responsive-fontsize';
import Icons from '../../common/Icons';
import SignUpButton from '../../common/SignUpButton';
import {isEmpty} from '../../helper/Validation';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {showMessage} from 'react-native-flash-message';
import {hp} from '../../helper/constants';
import Loader from '../../common/Loader';
import {routes} from '../../navigation/Routes';
import {BASE_URL} from '../../helper/ApiConstant';

const ChangePasswordScreen = props => {
  const {t} = useTranslation(); // Use 't' for translations

  const [passwd, setPasswd] = useState('');
  const [passwdMsg, setPasswdMsg] = useState('');
  const [ispasswd, setIsPasswd] = useState(false);
  const [isPasswdSecurity, setPasswdSecurity] = useState(true);

  const [changePasswd, setChangePasswd] = useState('');
  const [changePasswdMsg, setChangePasswdMsg] = useState('');
  const [isChangePasswd, setIsChangePasswd] = useState(false);
  const [isChangePasswdSecurity, setChangePasswdSecurity] = useState(true);

  const [newPasswd, setNewPasswd] = useState('');
  const [newPasswdMsg, setNewPasswdMsg] = useState('');
  const [isNewPasswd, setIsNewPasswd] = useState(false);
  const [isNewPasswdSecurity, setNewPasswdSecurity] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState();

  useEffect(() => {
    gotoSaveToken();
  }, []);

  const gotoSaveToken = async () => {
    var Token = await AsyncStorage.getItem('accessToken');
    setToken(Token);
  };

  const goBack = () => {
    props.navigation.goBack();
  };

  const onChangePasswd = text => {
    setPasswd(text);
    setIsPasswd(false);
  };
  const onChangeNewPasswd = text => {
    setNewPasswd(text);
    setIsNewPasswd(false);
  };
  const onChangeChnagePasswd = text => {
    setChangePasswd(text);
    setIsChangePasswd(false);
  };

  const checkValidation = () => {
    if (isEmpty(passwd)) {
      setIsPasswd(true);
      setPasswdMsg(t('changePasswordScreen.enterCurrentPassword'));
      return false;
    }
    if (isEmpty(newPasswd)) {
      setIsNewPasswd(true);
      setNewPasswdMsg(t('changePasswordScreen.enterNewPassword'));
      return false;
    }
    if (isEmpty(changePasswd)) {
      setIsChangePasswd(true);
      setChangePasswdMsg(t('changePasswordScreen.enterReEnterNewPassword'));
      return false;
    }
    gotoChangePasswdRequest();
  };

  const gotoChangePasswdRequest = () => {
    setIsLoading(true);
    const data = {
      current_password: passwd,
      password: newPasswd,
      password_confirmation: changePasswd,
      _method: 'put',
    };
    axios({
      method: 'post',
      url: BASE_URL + `update_password`,
      data: data,
      headers: {
        Authorization: 'Bearer' + token,
        Accept: 'application/json',
      },
    })
      .then(function (response) {
        setIsLoading(false);
        if (response.data.status) {
          showMessage({
            message: response.data.message,
            floating: true,
            position: 'top',
            icon: 'success',
            type: 'success',
          });
          props.navigation.navigate(routes.SettingScreen);
        } else {
          showMessage({
            message: response.data.message,
            floating: true,
            position: 'top',
            icon: 'danger',
            type: 'danger',
          });
        }
      })
      .catch(error => {
        setIsLoading(false);
        showMessage({
          message: JSON.stringify(error.response.data.message),
          floating: true,
          position: 'top',
          icon: 'danger',
          type: 'danger',
        });
      });
  };

  return (
    <SafeAreaProvider style={[ProfileStyle.detailsHeadercontainer]}>
      <SafeAreaView>
        <StatusBar animated={true} backgroundColor={Colors.white} />

        <View style={[ProfileStyle.headerConatinerLeft]}>
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
          <Text style={[ProfileStyle.title, {marginLeft: 20}]}>
            {t('changePasswordScreen.title')}
          </Text>
        </View>
        <View>
          <View style={{paddingTop: 20}}>
            <Text style={[ProfileStyle.label]}>
              {t('changePasswordScreen.currentPassword')}
            </Text>
            <Input
              value={passwd}
              placeholderText={t('changePasswordScreen.enterCurrentPassword')}
              maxLength={50}
              onChangeText={text => onChangePasswd(text)}
              keyboardType={'default'}
              returnKeyType={'done'}
              isValidationShow={ispasswd}
              validateMesssage={passwdMsg}
              secureTextEntry={isPasswdSecurity}
              onPressRight={() => setPasswdSecurity(!isPasswdSecurity)}
            />
          </View>
          <View style={{paddingTop: 20}}>
            <Text style={[ProfileStyle.label]}>
              {t('changePasswordScreen.newPassword')}
            </Text>

            <Input
              value={changePasswd}
              placeholderText={t('changePasswordScreen.enterNewPassword')}
              maxLength={50}
              onChangeText={text => onChangeChnagePasswd(text)}
              keyboardType={'default'}
              returnKeyType={'done'}
              isValidationShow={isChangePasswd}
              validateMesssage={changePasswdMsg}
            />
          </View>
          <View style={{paddingTop: 20}}>
            <Text style={[ProfileStyle.label]}>
              {t('changePasswordScreen.reEnterNewPassword')}
            </Text>
            <Input
              value={newPasswd}
              placeholderText={t(
                'changePasswordScreen.enterReEnterNewPassword',
              )}
              maxLength={50}
              onChangeText={text => onChangeNewPasswd(text)}
              keyboardType={'default'}
              returnKeyType={'done'}
              isValidationShow={isNewPasswd}
              validateMesssage={newPasswdMsg}
              secureTextEntry={isNewPasswdSecurity}
              onPressRight={() => setNewPasswdSecurity(!isNewPasswdSecurity)}
            />
          </View>
          <View style={{paddingTop: 20}}>
            <SignUpButton
              title={t('changePasswordScreen.changePasswordButton')}
              onPress={() => checkValidation()}
            />
          </View>
        </View>
        <View>{isLoading && <Loader />}</View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default ChangePasswordScreen;

const ProfileStyle = StyleSheet.create({
  detailsHeadercontainer: {
    padding: '4%',
    backgroundColor: Colors.white,
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
  label: {
    fontFamily: FontFamily.InterRegular,
    fontSize: RFPercentage(1.6),
    color: Colors.black,
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
    fontFamily: FontFamily.InterMedium,
    fontSize: RFPercentage(1.6),
    color: Colors.black,
  },
  cardTitle: {
    fontFamily: FontFamily.InterBold,
    fontSize: RFPercentage(1.6),
    color: Colors.black,
  },
  deleteAccountText: {
    fontFamily: FontFamily.InterRegular,
    fontSize: RFPercentage(1.6),
    color: Colors.black,
  },
});
