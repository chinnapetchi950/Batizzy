import {
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import Colors from '../helper/Colors';
import {deviceHeight, deviceWidth, hp, wp} from '../helper/constants';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {icons, images} from '../helper/imageConstants';
import Loader from '../common/Loader';
import FontFamily from '../helper/FontFamily';
import Icons from '../common/Icons';
import {showMessage} from 'react-native-flash-message';
import {BASE_URL, IMAGE_URL} from '../helper/ApiConstant';

const NotificationListScreen = () => {
  const {t} = useTranslation(); // Use 't' for translations
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState();
  const [notificationListData, setNotificationListData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    gotosaveToken();
  }, []);

  const gotosaveToken = async () => {
    var Token = await AsyncStorage.getItem('accessToken');
    setToken(Token);
    getNotificationList(Token);
  };

  const getNotificationList = async Token => {
    setIsLoading(true);

    axios({
      method: 'get',
      url: BASE_URL + `notifications`,
      headers: {
        Authorization: 'Bearer ' + Token,
        Accept: 'application/json',
      },
    })
      .then(function (response) {
        setIsLoading(false);
        setNotificationListData(response.data.data);
      })
      .catch(error => {
        setIsLoading(false);
      });
  };

  const gotoDeleteNotification = ID => {
    setIsLoading(true);
    const data = {
      _method: 'delete',
    };
    axios({
      method: 'post',
      url: BASE_URL + `notifications/` + ID,
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/json',
      },
      data: data,
    })
      .then(function (response) {
        if (response.data.status) {
          showMessage({
            message: response.data.message,
            floating: true,
            position: 'top',
            icon: 'success',
            type: 'success',
          });
          getNotificationList(token);
          setIsLoading(false);
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

  const gotoReadNotification = ID => {
    setIsLoading(true);
    const data = {
      _method: 'put',
    };
    axios({
      method: 'post',
      url: BASE_URL + `notifications_read/` + ID,
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/json',
      },
      data: data,
    })
      .then(function (response) {
        if (response.data.status) {
          showMessage({
            message: response.data.message,
            floating: true,
            position: 'top',
            icon: 'success',
            type: 'success',
          });
          getNotificationList(token);
          setIsLoading(false);
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

  const renderNotificationList = (item, index) => {
    console.log('in print item profile==>', item);
    return (
      <TouchableOpacity
        key={index}
        style={[styles.cardContainer]}
        onPress={() => gotoReadNotification(item.id)}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <View style={[styles.flexRow]}>
            <Image
              source={{
                uri: item?.image
                  ? IMAGE_URL + item?.image
                  : images.profileDummy,
              }}
              style={[styles.profileImg]}
            />
            <View>
              <Text style={[styles.servicesType]}>{item?.title}</Text>
              <Text style={[styles.servicesValue]}>{item?.body}</Text>
            </View>
          </View>
          {item?.read_at == null && <View style={[styles.bullets]} />}
        </View>
        <View style={[styles.flexRowSB]}>
          <Text style={[styles.statusValue]}>{item?.time_ago}</Text>
          <TouchableOpacity
            style={{padding: 6}}
            onPress={() => gotoDeleteNotification(item.id)}>
            <Icons
              iconName={'trash-outline'}
              iconSetName={'Ionicons'}
              iconColor={Colors.red}
              iconSize={20}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const emptyMesRender = () => {
    return (
      <View style={{flex: 1}}>
        <Text style={[styles.emptyMsg]}>
          {t('notificationListScreen.emptyMessage')}
        </Text>
      </View>
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    getNotificationList();
    setRefreshing(false);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.mainContainer}>
        <StatusBar animated={true} backgroundColor={Colors.white} />
        <View style={[styles.mainPaddingH]}>
          <View style={styles.leftContainer}>
            <Pressable
              onPress={() => {
                navigation.goBack();
              }}
              style={styles.backButton}>
              <ImageBackground
                resizeMode="cover"
                source={icons.Bg}
                style={styles.backButtonBackground}>
                <Image
                  resizeMode="contain"
                  source={icons.backIcon}
                  style={styles.backButtonIcon}
                />
              </ImageBackground>
            </Pressable>
            <View>
              <Text style={styles.headerText}>
                {t('notificationListScreen.title')}
              </Text>
            </View>
          </View>
        </View>
        <View style={[styles.mainPaddingH, {flex: 1}]}>
          <FlatList
            scrollEnabled
            contentContainerStyle={{paddingBottom: 10}}
            data={notificationListData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item: faqData, index}) =>
              renderNotificationList(faqData, index)
            }
            ListEmptyComponent={() => emptyMesRender()}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        </View>
        {isLoading && <Loader />}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default NotificationListScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  mainPadding: {
    padding: '4%',
  },
  mainPaddingH: {
    paddingHorizontal: '4%',
  },
  mainPaddingV: {
    paddingVertical: '4%',
  },
  mainPaddingTop: {
    paddingTop: '4%',
  },
  mainpaddingBottom: {
    paddingBottom: '4%',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonIcon: {
    height: hp(1.37),
    width: wp(4),
    alignSelf: 'center',
    marginBottom: hp(0.5),
  },
  backButtonBackground: {
    height: hp(4.8),
    width: hp(4.8),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
  },
  headerText: {
    fontFamily: 'Inter-SemiBold',
    color: Colors.black,
    fontSize: responsiveFontSize(1.8),
    marginLeft: '10%',
  },
  suggestionText: {
    fontFamily: FontFamily.InterSemiBold,
    fontSize: responsiveFontSize(1.8),
    color: Colors.primary,
  },
  faqContainer: {
    flexDirection: 'row',
  },
  questionText: {
    fontFamily: 'Inter-SemiBold',
    color: Colors.black,
    fontSize: responsiveFontSize(1.8),
    marginTop: 10,
  },
  answerText: {
    fontFamily: 'Inter',
    color: Colors.fontDarkGray,
    fontSize: responsiveFontSize(1.6),
    // width: deviceWidth / 1.3,
    lineHeight: 22,
    paddingLeft: 10,
  },
  bullets: {
    padding: 5,
    backgroundColor: Colors.primaryGreen,
    alignSelf: 'flex-start',
    borderRadius: 10,
  },
  linkIconSize: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
  },
  linkContainner: {
    padding: '2%',
    backgroundColor: '#75459559',
    borderRadius: 20,
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexRowSB: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  servicesType: {
    fontFamily: FontFamily.InterLight,
    color: Colors.black,
    fontSize: responsiveFontSize(1.6),
    marginVertical: 2,
  },
  servicesValue: {
    fontFamily: FontFamily.InterMedium,
    color: Colors.black,
    fontSize: responsiveFontSize(1.4),
    marginVertical: 2,
    width: deviceWidth / 1.4,
  },
  statusValue: {
    fontSize: responsiveFontSize(1.4),
    fontFamily: FontFamily.InterSemiBold,
    color: Colors.primary,
  },
  cardContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: Colors.white,
    elevation: 3,
    borderWidth: 0.5,
    borderRadius: 10,
    borderColor: Colors.borderLight,
    marginHorizontal: 2,
  },
  profileImg: {
    height: 30,
    width: 30,
    borderRadius: 30,
    marginRight: 10,
  },
  emptyMsg: {
    color: Colors.fontDarkGray,
    fontSize: responsiveFontSize(2),
    paddingVertical: 10,
    textAlign: 'center',
    marginTop: deviceHeight / 4,
  },
});
