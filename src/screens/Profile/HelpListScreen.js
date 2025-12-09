import {
  FlatList,
  Image,
  ImageBackground,
  Linking,
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
import Colors from '../../helper/Colors';
import {hp, wp} from '../../helper/constants';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {icons} from '../../helper/imageConstants';
import Loader from '../../common/Loader';
import moment from 'moment';
import FontFamily from '../../helper/FontFamily';
import Icons from '../../common/Icons';
import {BASE_URL} from '../../helper/ApiConstant';

const HelpListScreen = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();

  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState();
  const [helpData, setHelpData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    gotosaveToken();
  }, []);

  const gotosaveToken = async () => {
    var Token = await AsyncStorage.getItem('accessToken');
    setToken(Token);
    getHelpData(Token);
  };

  const getHelpData = async Token => {
    setIsLoading(true);
    axios({
      method: 'get',
      url: BASE_URL + `support`,
      headers: {
        Authorization: 'Bearer ' + Token,
        Accept: 'application/json',
      },
    })
      .then(function (response) {
        setIsLoading(false);
        setHelpData(response.data.data);
      })
      .catch(error => {
        setIsLoading(false);
      });
  };

  const gotoDialCode = phoneNumber => {
    let phoneURL = `tel:${phoneNumber}`;
    Linking.openURL(phoneURL);
  };

  const renderHelpData = (item, index) => {
    return (
      <View key={index} style={[styles.cardContainer]}>
        <View style={[styles.flexRowSB]}>
          <View style={[styles.faqContainer]} />
          <Text style={[styles.suggestionText]}>
            {moment(item?.created_at).format('ddd, DD MMM YYYY')}
          </Text>
        </View>
        <View style={[styles.flexRow]}>
          <Text style={[styles.servicesType]}>
            {t('helpList.servicesType')}
          </Text>
          <Text style={[styles.servicesValue]}>{item?.type}</Text>
        </View>
        <View style={[styles.flexRow]}>
          <Text style={[styles.servicesType]}>{t('helpList.issue')}</Text>
          <Text style={[styles.answerText]}>{item?.query}</Text>
        </View>
        <View style={[styles.flexRowSB]}>
          <Text
            style={[
              styles.statusValue,
              {
                color:
                  item?.status == 'completed' || item?.status == 'accepted'
                    ? Colors.green
                    : item?.status == 'rejected'
                    ? Colors.red
                    : item?.status == 'pending' || item?.status == 'open'
                    ? Colors.yellow
                    : Colors.yellow,
              },
            ]}>
            {item?.status}
          </Text>
          <View style={[styles.flexRow]}>
            <TouchableOpacity onPress={() => gotoDialCode('18002501232')}>
              <View style={{padding: 6}}>
                <Icons
                  iconName={'call'}
                  iconSetName={'Ionicons'}
                  iconColor={Colors.primary}
                  iconSize={20}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const emptyMesRender = () => {
    return (
      <View style={{flex: 1}}>
        <Text style={[styles.emptyMsg]}>{t('helpList.recordNotFound')}</Text>
      </View>
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    getHelpData();
    setRefreshing(false);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.mainContainer}>
        <StatusBar animated={true} backgroundColor={Colors.borderLight} />
        <View style={[styles.mainPaddingH, {elevation: 10, marginBottom: 1}]}>
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
              <Text style={styles.headerText}>{t('helpList.header')}</Text>
            </View>
          </View>
        </View>
        <FlatList
          data={helpData}
          scrollEnabled
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item: faqData, index}) =>
            renderHelpData(faqData, index)
          }
          ListEmptyComponent={() => emptyMesRender()}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
        {isLoading && <Loader />}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default HelpListScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.borderLight,
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
    padding: 4,
    backgroundColor: Colors.black,
    justifyContent: 'center',
    alignSelf: 'center',
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
    fontSize: responsiveFontSize(1.6),
    marginVertical: 2,
  },
  statusValue: {
    fontSize: responsiveFontSize(1.8),
    fontFamily: FontFamily.InterSemiBold,
  },
  cardContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: Colors.white,
    elevation: 3,
  },
});
