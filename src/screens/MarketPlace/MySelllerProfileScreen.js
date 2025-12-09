import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import React, {useCallback, useEffect, useState} from 'react';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {deviceHeight, deviceWidth} from '../../helper/constants';
import Icons from '../../common/Icons';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import {useFocusEffect} from '@react-navigation/native';
import {images} from '../../helper/imageConstants';
import FontFamily from '../../helper/FontFamily';
import {goBack} from '../../navigation/rootNavigator';
import Colors from '../../helper/Colors';
import {BASE_URL, IMAGE_URL} from '../../helper/ApiConstant';
import Loader from '../../common/Loader';

const MySelllerProfileScreen = props => {
  const {t} = useTranslation();

  const userID = props.route.params?.UserID;
  const userType = props.route.params?.type;
  const [userData, setUserData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [MarketplaceData, setMarketplaceData] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getMarketplaceData();
  }, []);

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

  const getMarketplaceData = async () => {
    var Token = await AsyncStorage.getItem('accessToken');
    setIsLoading(true);
    axios({
      method: 'get',
      url:
        BASE_URL + `marketplace_user_profile/${userID}?user_type=${userType}`,
      headers: {
        Authorization: 'Bearer' + Token,
        Accept: 'application/json',
      },
    })
      .then(function (response) {
        setIsLoading(false);
        setMarketplaceData(response.data.data);
      })
      .catch(error => {
        setIsLoading(false);
      });
  };

  const emptyMesRender = () => {
    return (
      <View style={{flex: 1}}>
        <Text style={[styles.emptyMsg]}>{t('error.recordNotFound')}</Text>
      </View>
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    getMarketplaceData();
    setRefreshing(false);
  };

  const renderMarketplacesList = (item, index) => {
    return (
      <View style={styles.listingCard}>
        <Image
          source={{
            uri: item?.first_attachment?.file_path
              ? IMAGE_URL + item?.first_attachment?.file_path
              : images.profileDummy,
          }}
          style={styles.listingImage}
        />
        <View style={styles.titleContainer}>
          <Text style={styles.price}>
            ${item.price} {'-'}
          </Text>
          <Text style={[styles.title]}>{item.title}</Text>
        </View>
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

          <Text style={[styles.UniAppText]}>
            {t('marketplace.myMarketplace')}
          </Text>
          <Icons
            iconSetName={'Ionicons'}
            iconName={'arrow-back-outline'}
            iconColor={Colors.white}
            iconSize={20}
          />
        </View>

        <ScrollView>
          <View
            style={{
              padding: '4%',
            }}>
            <View style={[styles.flexRow]}>
              <Image
                source={{
                  uri: MarketplaceData?.user?.profile_image
                    ? IMAGE_URL + MarketplaceData?.user?.profile_image
                    : images.profileDummy,
                }}
                style={[styles.profileImg]}
              />
              <Text style={[styles.userNAme, {marginLeft: 10}]}>
                {MarketplaceData?.user?.name}
              </Text>
            </View>
            <View style={{marginTop: 20}}>
              <TouchableOpacity style={styles.flexRow}>
                <Icons
                  iconSetName={'Ionicons'}
                  iconName={'people-outline'}
                  iconColor={Colors.primary}
                  iconSize={20}
                />
                <Text style={styles.infoText}>
                  {MarketplaceData?.user?.followers_count}{' '}
                  {t('marketplace.followers') + ' | '}
                  {MarketplaceData?.user?.following_count}{' '}
                  {t('marketplace.following')}
                </Text>
              </TouchableOpacity>
              <View style={styles.flexRow}>
                <Icons
                  iconSetName={'Ionicons'}
                  iconName={'list-outline'}
                  iconColor={Colors.primary}
                  iconSize={20}
                />
                <Text style={styles.infoText}>
                  {MarketplaceData?.user?.marketplaces_count}
                  {' ' + t('marketplace.activeListings')}
                </Text>
              </View>
              <View style={styles.flexRow}>
                <Icons
                  iconSetName={'MaterialCommunityIcons'}
                  iconName={'map-marker'}
                  iconColor={Colors.primary}
                  iconSize={20}
                />
                <Text style={styles.infoText}>
                  {MarketplaceData?.user?.location
                    ? MarketplaceData?.user?.location
                    : 'Location'}
                </Text>
              </View>

              <View>
                <Text style={[styles.listingText]}>
                  {MarketplaceData?.user?.name +
                    ' ' +
                    t('marketplace.userListings')}
                </Text>
                <FlatList
                  scrollEnabled
                  columnWrapperStyle={{
                    justifyContent: 'space-between',
                  }}
                  data={MarketplaceData?.user?.marketplaces}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({item: marketplaceList, index}) =>
                    renderMarketplacesList(marketplaceList, index)
                  }
                  numColumns={2}
                  ListEmptyComponent={() => emptyMesRender()}
                  showsVerticalScrollIndicator={false}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                    />
                  }
                />
              </View>
            </View>
          </View>
        </ScrollView>
        {isLoading && <Loader />}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default MySelllerProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 10 : 0,
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
  UniAppText: {
    fontFamily: FontFamily.InterMedium,
    fontSize: responsiveFontSize(2.4),
    color: Colors.black,
  },
  profileImg: {
    height: 80,
    width: 80,
    borderRadius: 50,
  },
  userNAme: {
    fontFamily: FontFamily.InterSemiBold,
    fontSize: responsiveFontSize(2.2),
    color: Colors.black,
  },
  infoText: {
    fontFamily: FontFamily.InterSemiBold,
    color: Colors.fontDarkGray,
    fontSize: responsiveFontSize(1.8),
    marginLeft: 20,
    marginVertical: 2,
  },
  followBtntext: {
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    fontSize: responsiveFontSize(1.41),
  },
  messageBtntext: {
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1D',
    fontSize: responsiveFontSize(1.41),
  },
  followText: {
    fontFamily: 'Inter-Medium',
    color: '#1D1D1D',
    fontSize: responsiveFontSize(1.64),
    textAlign: 'center',
  },
  followBtnMainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  followBtnContainer: {
    backgroundColor: '#754595',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 10,
    justifyContent: 'center',
    flex: 0.48,
  },
  messageBtnContainer: {
    backgroundColor: '#CECECE',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 10,
    justifyContent: 'center',
    flex: 0.48,
  },
  listingCard: {
    width: deviceWidth / 2.4,
    marginBottom: 20,
  },
  listingImage: {
    width: deviceWidth / 2.4,
    height: deviceHeight / 5,
    borderRadius: 10,
  },

  listingPrice: {
    fontFamily: 'Inter-Medium',
    color: '#000000',
    fontSize: responsiveFontSize(1.64),
  },

  titleContainer: {
    // flexDirection: 'row',
    // alignItems: 'center',
    marginVertical: 4,
  },
  price: {
    color: 'black',
    fontSize: responsiveFontSize(1.64),
    fontFamily: 'Inter-Medium',
  },
  title: {
    color: 'black',
    fontSize: responsiveFontSize(1.64),
    fontFamily: 'Inter-Medium',
    flexWrap: 'wrap',
  },
  listingText: {
    color: Colors.black,
    fontSize: responsiveFontSize(1.6),
    fontFamily: FontFamily.InterSemiBold,
    marginVertical: 15,
  },
  emptyMsg: {
    color: Colors.fontDarkGray,
    fontSize: responsiveFontSize(2),
    paddingVertical: 10,
    textAlign: 'center',
    marginTop: deviceHeight / 4,
  },
});
