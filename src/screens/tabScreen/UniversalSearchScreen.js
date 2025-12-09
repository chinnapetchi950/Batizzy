import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import React, {useCallback, useState} from 'react';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import CustomSearchBar from '../../common/CustomSearchBar';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_URL} from '../../helper/ApiConstant';
import Loader from '../../common/Loader';
import {deviceHeight, deviceWidth} from '../../helper/constants';
import FontFamily from '../../helper/FontFamily';
import Colors from '../../helper/Colors';
import Icons from '../../common/Icons';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import {goBack, navigate} from '../../navigation/rootNavigator';
import {useFocusEffect} from '@react-navigation/native';
import {routes} from '../../navigation/Routes';

const UniversalSearchScreen = () => {
  const {t} = useTranslation();

  const [uniSearch, setUniSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchUserData, setSearchUserData] = useState('');
  const [userData, setUserData] = useState('');
  const [loginUserID, setLoginUserID] = useState();

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
        setLoginUserID(response.data.data?.id);
      })
      .catch(error => {
        setIsLoading(false);
      });
  };

  const onChangeUniSearch = text => {
    setUniSearch(text);
    if (text.length > 3) {
      gotoUniverrsalSearch(text);
    }
  };

  const gotoUniverrsalSearch = async text => {
    var Token = await AsyncStorage.getItem('accessToken');
    setIsLoading(true);
    axios({
      method: 'get',
      url: BASE_URL + `search?query=${text}`,
      headers: {
        Authorization: 'Bearer' + Token,
        Accept: 'application/json',
      },
    })
      .then(function (response) {
        setIsLoading(false);
        setSearchUserData(response.data.data);
      })
      .catch(error => {
        setIsLoading(false);
      });
  };

  const gotoSocialProfile = item => {
    if (loginUserID === item?.id) {
      navigate(routes.UserProfile);
    } else {
      navigate(routes.OtherUserProfile, {
        UserID: item?.id,
        type: item?.type,
      });
    }
  };
  const gotoMarketProfile = item => {
    if (loginUserID === item?.id) {
      navigate(routes.MySelllerProfile, {
        UserID: item?.id,
        type: item?.type,
      });
    } else {
      navigate(routes.SelllerProfile, {
        UserID: item?.id,
        type: item?.type,
      });
    }
  };

  const renderUniversalData = item => {
    return (
      <View style={{borderBottomWidth: 0.5}}>
        <View style={{paddingHorizontal: 20}}>
          <View
            style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
            <Image
              style={[styles.profileimg]}
              source={{uri: item.profile_image}}
            />
            <View style={{marginLeft: 10}}>
              <Text style={[styles.userNAme]}>{item.name}</Text>
              <Text style={[styles.userType]}>{item.type}</Text>
              <Text style={[styles.userType]}>{item.gender}</Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              flex: 1,
            }}>
            <TouchableOpacity
              style={{flex: 0.48}}
              onPress={() => gotoSocialProfile(item)}>
              <View style={[styles.socialSmallbtn]}>
                <Text
                  style={[styles.socialProfileText, {color: Colors.primary}]}>
                  {t('universalSearch.socialProfile')}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => gotoMarketProfile(item)}
              style={{flex: 0.48}}>
              <View style={[styles.smallbtn]}>
                <Text style={[styles.socialProfileText]}>
                  {t('universalSearch.marketplaceProfile')}
                </Text>
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
        <Text style={[styles.emptyMsg]}>{t('error.recordNotFound')}</Text>
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar animated={true} backgroundColor={Colors.white} />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            alignItems: 'center',
          }}>
          <TouchableOpacity onPress={() => goBack()}>
            <Icons
              iconSetName={'Ionicons'}
              iconName={'arrow-back-outline'}
              iconColor={Colors.black}
              iconSize={20}
            />
          </TouchableOpacity>

          <Text style={[styles.UniAppText]}>{t('universalSearch.search')}</Text>
          <Icons
            iconSetName={'Ionicons'}
            iconName={'arrow-back-outline'}
            iconColor={Colors.white}
            iconSize={20}
          />
        </View>

        <View
          style={{
            paddingVertical: 20,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <CustomSearchBar
            value={uniSearch}
            placeholder={t('universalSearch.universalSearch')}
            width={deviceWidth - 40}
            isFilterBtn={false}
            onChangeText={text => onChangeUniSearch(text)}
            onPressSearch={() => gotoUniverrsalSearch(uniSearch)}
          />
        </View>
        <FlatList
          data={searchUserData}
          scrollEnabled
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}, index) => renderUniversalData(item, index)}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => emptyMesRender()}
        />

        {isLoading && <Loader />}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default UniversalSearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 10 : 0,
  },
  socialProfileText: {
    fontFamily: FontFamily.InterMedium,
    color: Colors.white,
    fontSize: responsiveFontSize(1.6),
    alignSelf: 'center',
  },
  smallbtn: {
    padding: 6,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    marginVertical: 10,
  },
  socialSmallbtn: {
    padding: 6,
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 0.9,
    borderColor: Colors.primary,
  },
  UniAppText: {
    fontFamily: FontFamily.InterMedium,
    fontSize: responsiveFontSize(2.6),
    color: Colors.black,
  },
  userNAme: {
    fontFamily: FontFamily.InterSemiBold,
    fontSize: responsiveFontSize(2),
    color: Colors.black,
  },
  userType: {
    fontFamily: FontFamily.InterRegular,
    fontSize: responsiveFontSize(1.8),
    color: Colors.black,
  },
  userGender: {
    fontFamily: FontFamily.InterRegular,
    fontSize: responsiveFontSize(1.8),
    color: Colors.black,
  },
  profileimg: {height: 60, width: 60, borderRadius: 30},
  emptyMsg: {
    color: Colors.fontDarkGray,
    fontSize: responsiveFontSize(2),
    paddingVertical: 10,
    textAlign: 'center',
    marginTop: deviceHeight / 4,
  },
});
