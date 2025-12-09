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
import FontFamily from '../../helper/FontFamily';
import Colors from '../../helper/Colors';
import {icons} from '../../helper/imageConstants';
import {RFPercentage} from 'react-native-responsive-fontsize';
import Icons from '../../common/Icons';
import Dialog from 'react-native-dialog';
import {showMessage} from 'react-native-flash-message';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {routes} from '../../navigation/Routes';
import {BASE_URL} from '../../helper/ApiConstant';

const DeleteAccountScreen = props => {
  const {t} = useTranslation(); // You can use 't' for translation.

  // declare useDispatch hook
  const [deleteAlert, setDeleteAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState();

  useEffect(() => {
    gotoSaveToken();
  }, []);

  const gotoSaveToken = async () => {
    var Token = await AsyncStorage.getItem('accessToken');
    setToken(Token);
  };

  const deleteAccount = () => {
    setIsLoading(true);
    const data = {
      _method: 'delete',
    };
    axios({
      method: 'post',
      url: BASE_URL + `delete_account`,
      data: data,
      headers: {
        Authorization: 'Bearer' + token,
        Accept: 'application/json',
      },
    })
      .then(function (response) {
        setDeleteAlert(false);
        setIsLoading(false);
        if (response.data.status) {
          showMessage({
            message: response.data.message,
            floating: true,
            position: 'top',
            icon: 'success',
            type: 'success',
          });
          AsyncStorage.clear();
          props.navigation.navigate(routes.Login);
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
        setDeleteAlert(false);
        showMessage({
          message: JSON.stringify(error.response.data.message),
          floating: true,
          position: 'top',
          icon: 'danger',
          type: 'danger',
        });
      });
  };

  const goBack = () => {
    props.navigation.goBack();
  };

  return (
    <>
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
              {t('deleteAccountScreen.title')}
            </Text>
          </View>
          <Text style={[ProfileStyle.title, {marginTop: 20}]}>
            {t('deleteAccountScreen.confirmationMessage')}
          </Text>
          <Text style={[ProfileStyle.deleteAccountText]}>
            {t('deleteAccountScreen.accountDeletionIrreversible')}
          </Text>
          <Text style={[ProfileStyle.deleteAccountText]}>
            {t('deleteAccountScreen.accessLoss')}
          </Text>
        </SafeAreaView>
      </SafeAreaProvider>

      <View style={{padding: 20, backgroundColor: Colors.white}}>
        <TouchableOpacity
          style={{
            backgroundColor: Colors.green,
            borderRadius: 40,
            alignItems: 'center',
            padding: 15,
          }}>
          <Text style={[ProfileStyle.deleteAccountText, {color: Colors.white}]}>
            {t('deleteAccountScreen.keepAccount').toUpperCase()}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            alignItems: 'center',
            marginTop: 20,
          }}
          onPress={() => {
            setDeleteAlert(!deleteAlert);
          }}>
          <Text style={[ProfileStyle.deleteAccountText, {color: Colors.red}]}>
            {t('deleteAccountScreen.deleteAccount')}
          </Text>
        </TouchableOpacity>
        <View>
          <Dialog.Container visible={deleteAlert}>
            <Dialog.Title>{t('deleteAccountScreen.dialogTitle')}</Dialog.Title>
            <Dialog.Description>
              {t('deleteAccountScreen.dialogDescription')}
            </Dialog.Description>
            <Dialog.Button
              label={t('deleteAccountScreen.cancelButton')}
              onPress={() => setDeleteAlert(false)}
            />
            <Dialog.Button
              label={t('deleteAccountScreen.deleteButton')}
              onPress={() => deleteAccount()}
            />
          </Dialog.Container>
        </View>
      </View>
    </>
  );
};

export default DeleteAccountScreen;

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
