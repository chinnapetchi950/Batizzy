import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ImageBackground,
  ScrollView,
  FlatList,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import Carousel from 'react-native-snap-carousel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import {showMessage} from 'react-native-flash-message';
import axios from 'axios';
import {deviceWidth, hp, wp} from '../../helper/constants';
import {icons} from '../../helper/imageConstants';
import Input from '../../common/Input';
import Colors from '../../helper/Colors';
import {BASE_URL, IMAGE_URL} from '../../helper/ApiConstant';
import Icons from '../../common/Icons';
import {navigate} from '../../navigation/rootNavigator';
import {routes} from '../../navigation/Routes';
import Loader from '../../common/Loader';

const ProductDetails = () => {
  const {t} = useTranslation();

  const navigation = useNavigation();
  const route = useRoute();
  const ItemID = route.params?.ItemID;
  const [isMarketPlaceDetailData, setIsMarketPlaceDetailData] = useState([]);
  const [isSimilarListData, setIsSimilarListData] = useState([]);
  const [isUserId, setUserId] = useState('');
  const [message, setMessage] = useState();
  const [userType, setUserType] = useState();
  const [userData, setUserData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [words, setWords] = useState([]);
  const [token, setToken] = useState();

  useFocusEffect(
    useCallback(() => {
      const onScreenFocus = async () => {
        await getUserData();
      };
      onScreenFocus();
    }, [getUserData]),
  );

  const getUserData = useCallback(async () => {
    setIsLoading(true);
    var Token = await AsyncStorage.getItem('accessToken');
    await fetch(BASE_URL + 'profile', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + Token,
        Accept: 'application/json',
      },
    })
      .then(res => res.json())
      .then(res => {
        setIsLoading(false);
        if (res.status === true) {
          setUserId(res.data.id);
        }
      })
      .catch(error => {
        setIsLoading(false);
        console.error(error);
      });
  }, []);

  const CustomPagination = ({activeIndex, total}) => {
    return (
      <View style={styles.paginationContainer}>
        {Array?.from({length: total}).map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === activeIndex
                ? styles.paginationDotActive
                : styles.paginationDotInactive,
            ]}
          />
        ))}
      </View>
    );
  };

  const ImageSlider = ({images}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const carouselRef = useRef(null);

    const renderItem = ({item}) => (
      <Image
        source={{uri: IMAGE_URL + item?.file_path}}
        style={styles.sliderImage}
      />
    );

    return (
      <View>
        <Carousel
          ref={carouselRef}
          data={images}
          renderItem={renderItem}
          sliderWidth={deviceWidth}
          itemWidth={deviceWidth}
          onSnapToItem={index => setActiveIndex(index)}
          // autoplay={false}
          // autoplayInterval={3000}
          loop={true}
        />
        <CustomPagination activeIndex={activeIndex} total={images?.length} />
      </View>
    );
  };

  const renderItem = ({item}) => {
    return (
      <Pressable style={styles.listingCard} onPress={() => {}}>
        <Image
          source={{uri: IMAGE_URL + item?.first_attachment?.file_path}}
          style={styles.listingImage}
        />
        <View style={styles.listingDetails}>
          <Text style={styles.listingPrice}>
            $ {item.price}・{item.title}
          </Text>
        </View>
      </Pressable>
    );
  };

  useFocusEffect(
    useCallback(() => {
      const onScreenFocus = async () => {
        await getMarketplaceDetails();
      };
      onScreenFocus();
    }, [getMarketplaceDetails]),
  );

  const getMarketplaceDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const Token = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${BASE_URL}marketplaces/${ItemID}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${Token}`,
          Accept: 'application/json',
        },
      });
      const res = await response.json();
      setIsLoading(false);
      if (res.status === true) {
        setIsMarketPlaceDetailData(res.data);
        setIsSimilarListData(res.similar);
        setUserType(res.data.user_type);
      }
    } catch (error) {
      setIsLoading(false);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [ItemID]);

  const followUserAPI = async () => {
    setIsLoading(true);
    var Token = await AsyncStorage.getItem('accessToken');
    var formData = new FormData();
    formData.append('following_type', isMarketPlaceDetailData?.user_type);
    formData.append('user_id', isMarketPlaceDetailData?.user_id);
    await fetch(BASE_URL + 'follow-request', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + Token,
        Accept: 'application/json',
      },
      body: formData,
    })
      .then(res => res.json())
      .then(res => {
        setIsLoading(false);
        getMarketplaceDetails();
        if (res.status === true) {
          showMessage({
            message: res.message,
            floating: true,
            position: 'top',
            icon: 'success',
            type: 'success',
          });
        } else {
          handleApiError(res);
        }
      })
      .catch(error => {
        setIsLoading(false);
        console.error(error);
      });
  };
  const unfollowUserAPI = async () => {
    setIsLoading(true);
    var Token = await AsyncStorage.getItem('accessToken');
    var formData = new FormData();
    formData.append('following_type', isMarketPlaceDetailData?.user_type);
    formData.append('user_id', isMarketPlaceDetailData?.user_id);
    await fetch(BASE_URL + 'unfollow', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + Token,
        Accept: 'application/json',
      },
      body: formData,
    })
      .then(res => res.json())
      .then(res => {
        setIsLoading(false);
        getMarketplaceDetails();
        if (res.status === true) {
          showMessage({
            message: res.message,
            floating: true,
            position: 'top',
            icon: 'success',
            type: 'success',
          });
          getMarketplaceDetails();
        } else {
          handleApiError(res);
        }
      })
      .catch(error => {
        setIsLoading(false);
        console.error(error);
      });
  };

  const handleApiError = response => {
    const {message, error_details} = response;
    showMessage({
      message: message || 'An error occurred',
      type: 'warning',
    });

    if (error_details) {
      Object.keys(error_details).forEach(field => {
        // Capitalize the first letter of the field for better readability
        const formattedField = field.charAt(0).toUpperCase() + field.slice(1);
        showMessage({
          message: `${formattedField}: ${error_details[field][0]}`,
          type: 'warning',
        });
      });
    }
  };

  let followButtonText = '';

  if (isMarketPlaceDetailData.follow_status === 'not_following') {
    followButtonText = 'Follow';
  } else if (isMarketPlaceDetailData.follow_status === 'request_sent') {
    followButtonText = 'Requested';
  } else {
    followButtonText = 'Following';
  }

  useEffect(() => {
    setWords(isMarketPlaceDetailData?.description?.split(' '));
  }, [isMarketPlaceDetailData?.description]);

  useEffect(() => {
    gotosaveToken();
  }, []);

  const gotosaveToken = async () => {
    var Token = await AsyncStorage.getItem('accessToken');
    var userData = await AsyncStorage.getItem('userData');
    setUserData(userData);
    setToken(Token);
  };

  const toggleReadMore = () => {
    setShowFullDescription(!showFullDescription);
  };

  const gotoSendMessage = async () => {
    createConversionID();
  };
  const onChangeMessage = text => {
    setMessage(text);
  };
  const createConversionID = () => {
    const data = {
      to_id: isMarketPlaceDetailData?.user_id,
      to_type: userType,
    };
    axios({
      method: 'post',
      url: BASE_URL + `conversations`,
      headers: {
        Authorization: 'Bearer' + token,
        Accept: 'application/json',
      },
      data: data,
    })
      .then(function (response) {
        setIsLoading(false);
        if (response.data.status) {
          gotoSendMessageAPI(response.data.data.id);
        }
      })
      .catch(error => {
        setIsLoading(false);
      });
  };
  const gotoSendMessageAPI = conversationID => {
    var formData = new FormData();
    formData.append('message', message);
    formData.append('conversation_id', conversationID);

    setMessage('');
    axios({
      method: 'post',
      url: BASE_URL + `messages`,
      headers: {
        Authorization: 'Bearer' + token,
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
      },
      data: formData,
    })
      .then(function (response) {
        showMessage({
          message: response.data.message,
          floating: true,
          position: 'top',
          icon: 'success',
          type: 'success',
        });
        setIsLoading(false);
      })
      .catch(error => {
        setIsLoading(false);
      });
  };
  const gotoSellerProfile = () => {
    navigate(routes.SelllerProfile, {
      UserID: isMarketPlaceDetailData.user?.id,
      type: isMarketPlaceDetailData?.user_type,
    });
  };
  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.threeDotContainer}>
            <Pressable
              onPress={() => {
                navigation.goBack();
              }}
              style={styles.pressable}>
              <ImageBackground
                resizeMode="cover"
                source={icons.Bg}
                style={styles.imageBackground}>
                <Image
                  resizeMode="contain"
                  source={icons.backIcon}
                  style={styles.backIcon}
                />
              </ImageBackground>
            </Pressable>
            <Text style={styles.headerText}>
              {t('productDetails.marketplace')}
            </Text>
          </View>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <ImageSlider images={isMarketPlaceDetailData?.attachments} />
          <View style={styles.listingInfo}>
            <Text style={styles.title}>{isMarketPlaceDetailData?.title}</Text>
            <Text style={styles.price}>$ {isMarketPlaceDetailData?.price}</Text>
            <Text style={styles.location}>
              {isMarketPlaceDetailData?.created_at_hrf}
              {isMarketPlaceDetailData?.location}
            </Text>
          </View>
          {isMarketPlaceDetailData?.user?.id != isUserId && (
            <View style={styles.mainMessageContainer}>
              <View style={styles.sendMessageContainer}>
                <Icons
                  iconSetName={'Ionicons'}
                  iconName={'chatbubbles-sharp'}
                  iconColor={Colors.primary}
                  iconSize={26}
                />
                <Text style={[styles.sendMessageText, {marginLeft: 10}]}>
                  {t('productDetails.sendSellerMessage')}
                </Text>
              </View>
              <View style={[styles.messageContainer]}>
                <View style={{width: deviceWidth - 100}}>
                  <Input
                    value={message}
                    placeholderText={t('productDetails.messagePlaceholder')}
                    blurOnSubmit={true}
                    autoCapitalize="none"
                    // isValidationShow={isMobileError}
                    // validateMesssage={mobileErrorValidMsg}
                    onChangeText={text => onChangeMessage(text)}
                    returnKeyType="done"
                  />
                </View>
                <TouchableOpacity
                  style={{marginTop: '5%'}}
                  onPress={() => gotoSendMessage()}>
                  <Image
                    resizeMode="contain"
                    source={icons.sendMessageIcon}
                    style={styles.sendMessageIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>
              {t('productDetails.descriptionTitle')}
            </Text>
            {words?.length > 20 ? (
              <View>
                <Text style={styles.descriptionText}>
                  {showFullDescription
                    ? isMarketPlaceDetailData?.description
                    : words?.slice(0, 20).join(' ') + '...'}
                </Text>
                <TouchableOpacity onPress={toggleReadMore}>
                  <Text style={[styles.descriptionText, {color: '#754595'}]}>
                    {showFullDescription
                      ? t('productDetails.readLess')
                      : t('productDetails.readMore')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.descriptionText}>
                {isMarketPlaceDetailData?.description}
              </Text>
            )}
          </View>
          <View style={styles.divider} />

          <View style={styles.sellerContainer}>
            {isMarketPlaceDetailData?.user?.id != isUserId && (
              <View style={styles.seeprofileContainer}>
                <Text style={styles.sellerTitle}>
                  {t('productDetails.sellerInformation')}
                </Text>
                <TouchableOpacity onPress={() => gotoSellerProfile()}>
                  <Text style={styles.SellerProfileText}>
                    {t('productDetails.sellerProfile')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            {isMarketPlaceDetailData?.user?.id != isUserId && (
              <View style={styles.sellerInfo}>
                {isMarketPlaceDetailData?.user?.profile_image ? (
                  <Image
                    source={{
                      uri:
                        IMAGE_URL +
                        isMarketPlaceDetailData?.user?.profile_image,
                    }}
                    style={styles.sellerAvatar}
                  />
                ) : (
                  <Image source={icons.dummyUser} style={styles.sellerAvatar} />
                )}

                <View>
                  <Text style={styles.sellerName}>
                    {isMarketPlaceDetailData?.user?.name}
                  </Text>
                  <Text style={styles.sellerJoined}>
                    {t('productDetails.joinedIn') + ' '}
                    {moment(isMarketPlaceDetailData?.user?.created_at).format(
                      'YYYY',
                    )}
                  </Text>
                </View>
                <Pressable
                  style={styles.followButton}
                  onPress={() => {
                    if (isMarketPlaceDetailData.follow_status === 'following') {
                      unfollowUserAPI();
                    } else {
                      followUserAPI();
                    }
                  }}>
                  <Text style={styles.followButtonText}>
                    {followButtonText}
                  </Text>
                </Pressable>
              </View>
            )}
            {isMarketPlaceDetailData?.user?.id != isUserId && (
              <View style={styles.grayLine} />
            )}
          </View>

          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>
              {t('contractsDetails.details')}
            </Text>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>
                {t('productDetails.condition')}
              </Text>
              <Text style={styles.detailValue}>
                {isMarketPlaceDetailData?.condition}
              </Text>
            </View>
            <View style={styles.grayLine} />
          </View>

          <View style={styles.locationContainer}>
            <Text style={styles.detailsTitle}>
              {t('productDetails.location')}
            </Text>
            <Text style={styles.location}>
              {isMarketPlaceDetailData?.location}
            </Text>
          </View>
          <View style={styles.divider} />
          <View>
            <Text style={styles.similarlistText}>
              {t('productDetails.similarListings')}
            </Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={isSimilarListData}
              keyExtractor={item => item.id}
              renderItem={renderItem}
            />
          </View>
        </ScrollView>
      </View>
      {isLoading && <Loader />}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  threeDotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBackground: {
    height: hp(4.8),
    width: hp(4.8),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
  },
  backIcon: {
    height: hp(1.37),
    width: wp(4),
    alignSelf: 'center',
    marginBottom: hp(0.5),
  },
  headerText: {
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    fontSize: responsiveFontSize(1.88),
    marginLeft: 16,
  },
  divider: {
    width: '100%',
    backgroundColor: 'lightgray',
    height: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 200,
  },
  listingInfo: {
    padding: 16,
  },
  title: {
    fontFamily: 'Inter-Medium',
    color: '#000000',
    fontSize: responsiveFontSize(1.64),
  },
  price: {
    fontFamily: 'Inter-Medium',
    color: '#000000',
    fontSize: responsiveFontSize(1.64),
    marginTop: 6,
  },
  location: {
    fontSize: responsiveFontSize(1.41),
    color: '#6B6B6B',
    fontFamily: 'Inter-Medium',
    marginTop: 4,
  },
  sendMessageText: {
    fontSize: responsiveFontSize(1.64),
    color: '#000000',
    fontFamily: 'Inter-Medium',
  },
  chatIcon: {
    height: hp(2.8),
    width: hp(2.8),
    resizeMode: 'contain',
    marginRight: wp(3.8),
  },
  sendMessageIcon: {
    height: 40,
    width: 40,
  },
  mainMessageContainer: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#754595',
    borderRadius: 10,
    padding: 15,
  },
  messageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sendMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageInput: {
    flex: 1,
    marginRight: 12,
    height: hp(4.5),
    backgroundColor: '#6B6B6B54',
    borderRadius: 20,
    paddingHorizontal: 18,
    color: '#1D1D1D',
  },
  sendButton: {
    backgroundColor: '#6200EE',
    borderRadius: 20,
    padding: 8,
  },
  descriptionContainer: {
    padding: 16,
  },
  descriptionTitle: {
    fontSize: responsiveFontSize(1.64),
    color: '#000000',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  similarlistText: {
    fontSize: responsiveFontSize(1.64),
    color: '#000000',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
    marginTop: 15,
    marginHorizontal: 15,
  },
  descriptionText: {
    fontSize: responsiveFontSize(1.64),
    fontFamily: 'Inter-Medium',
    color: '#6B6B6B',
  },
  sellerContainer: {
    padding: 16,
  },
  seeprofileContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sellerTitle: {
    fontSize: responsiveFontSize(1.64),
    color: '#000000',
    fontFamily: 'Inter-SemiBold',
  },
  SellerProfileText: {
    fontSize: responsiveFontSize(1.41),
    color: '#754595',
    fontFamily: 'Inter-Medium',
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerAvatar: {
    width: hp(5.5),
    height: hp(5.5),
    borderRadius: 25,
    marginRight: wp(3),
    resizeMode: 'contain',
  },
  sellerName: {
    fontSize: responsiveFontSize(1.88),
    color: '#000000',
    fontFamily: 'Inter-SemiBold',
  },
  sellerJoined: {
    fontSize: responsiveFontSize(1.64),
    color: '#1D1D1D',
    fontFamily: 'Inter-Medium',
  },
  followButton: {
    marginLeft: 'auto',
    backgroundColor: '#6B6B6B54',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  followButtonText: {
    fontSize: responsiveFontSize(1.64),
    color: '#000000',
    fontFamily: 'Inter-SemiBold',
  },
  grayLine: {
    width: '100%',
    backgroundColor: '#9D9D9D',
    height: 1,
    marginTop: hp(2.4),
  },
  detailsContainer: {
    paddingHorizontal: 16,
  },
  detailsTitle: {
    fontSize: responsiveFontSize(1.64),
    color: '#000000',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
  },
  detailLabel: {
    fontSize: responsiveFontSize(1.64),
    fontFamily: 'Inter-Medium',
    color: '#1D1D1D',
    marginRight: wp(12),
  },
  detailValue: {
    fontSize: responsiveFontSize(1.64),
    fontFamily: 'Inter-Medium',
    color: '#6B6B6B',
  },
  sliderImage: {
    width: '98%',
    height: hp(30),
    resizeMode: 'cover',
    borderRadius: 15,
    marginLeft: 3,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center', // Centering the container
    paddingVertical: 4,
    backgroundColor: '#D9D9D9',
    borderRadius: 10,
    paddingHorizontal: 2,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#754595', // Active dot color (filled)
  },
  paginationDotInactive: {
    borderWidth: 1,
    borderColor: '#754595', // Inactive dot color (outlined)
  },
  locationContainer: {
    paddingHorizontal: 16,
    marginTop: 15,
    marginBottom: 15,
  },
  mapContainer: {
    margin: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: 150,
  },
  locationText: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 10,
  },
  locationDescription: {
    fontSize: 14,
    color: 'gray',
    paddingHorizontal: 10,
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
  listingCard: {
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  listingImage: {
    width: 120,
    height: 150,
    borderRadius: 5,
  },
  listingDetails: {
    width: 120,
  },
  listingPrice: {
    fontFamily: 'Inter-Medium',
    color: '#000000',
    fontSize: responsiveFontSize(1.64),
    marginTop: hp(0.7),
  },
  listingEditText: {
    fontFamily: 'Inter-Medium',
    color: '#754595',
    fontSize: responsiveFontSize(1.64),
  },
});

export default ProductDetails;
