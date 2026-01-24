import React, {useCallback, useRef, useState} from 'react';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Carousel from 'react-native-snap-carousel';
import Modal from 'react-native-modal';
import {useTranslation} from 'react-i18next';
import axios from 'axios';
import Colors from '../helper/Colors';
import {icons, images} from '../helper/imageConstants';
import {deviceWidth, hp, wp} from '../helper/constants';
import {routes} from '../navigation/Routes';
import {BASE_URL, IMAGE_URL} from '../helper/ApiConstant';
import SignUpButton from '../common/SignUpButton';
import Loader from '../common/Loader';

const RequestDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const ItemID = route.params?.ItemID;
  const [isRequestDetailData, setIsRequestDetailData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const {t} = useTranslation(); // Get translation function

  useFocusEffect(
    useCallback(() => {
      const onScreenFocus = async () => {
        await getRenovationDetail();
      };
      onScreenFocus();
    }, [getRenovationDetail]),
  );

  useFocusEffect(
    useCallback(() => {
      const onScreenFocus = async () => {
        await getUserData();
      };
      onScreenFocus();
    }, [getUserData]),
  );

  const getRenovationDetail = useCallback(async () => {
    const Token = await AsyncStorage.getItem('accessToken');
    const response = await fetch(`${BASE_URL}renovation_posts/${ItemID}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${Token}`,
        Accept: 'application/json',
      },
    });
    const res = await response.json();
    console.log(res,"resresresresresresresresres");
    
    if (res.status === true) {
      setIsRequestDetailData(res.data);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [ItemID]);

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
      })
      .catch(error => {
        setIsLoading(false);
      });
  };

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

  const ImageSlider = ({imagesData}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const carouselRef = useRef(null);

    const renderItem = ({item}) => {
      return (
        <Image
          source={{
            uri: item?.file_path
              ? IMAGE_URL + item?.file_path
              : images.coverDummy,
          }}
          style={styles.sliderImage}
        />
      );
    };

    return (
      <View>
        <Carousel
          ref={carouselRef}
          data={imagesData}
          renderItem={renderItem}
          sliderWidth={deviceWidth}
          itemWidth={deviceWidth}
          onSnapToItem={index => setActiveIndex(index)}
          loop={true}
        />
        <CustomPagination
          activeIndex={activeIndex}
          total={imagesData?.length}
        />
      </View>
    );
  };

  return (
    <View style={styles.wrapper}>
      <ImageBackground style={{height: 230}}>
        <ImageSlider imagesData={isRequestDetailData?.attachments} />
        <View style={styles.headerContainer}>
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
            <Text style={styles.title}>{t('requestDetails.jobDetails')}</Text>
          </Pressable>
          <View style={styles.IconsContainer}>
            <Pressable
              onPress={() =>
                navigation.navigate(routes.NotificationListScreen)
              }>
              <Image
                source={icons.notificationIcon}
                style={styles.notificationIcon}
              />
            </Pressable>
            {userData?.unread_notifications_count != 0 && (
              <Text style={styles.notificationCount}>
                {userData?.unread_notifications_count}
              </Text>
            )}
          </View>
        </View>
      </ImageBackground>
      {!isLoading && (
        <>
          <ScrollView>
            <Text style={styles.projectTitle}>
              {isRequestDetailData?.title}
            </Text>
            <View style={styles.divider} />
            <Text style={styles.subTitle}>
              {isRequestDetailData?.renovation_type?.name}
            </Text>
            <Text style={styles.postedTime}>
              {t('requestDetails.postedAt', {
                postedAt: isRequestDetailData?.posted_at,
              })}
            </Text>
            <View style={styles.divider} />
            <Text style={styles.descriptiontext}>
              {isRequestDetailData?.description}
            </Text>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.text}>
                {t('requestDetails.scopeOfWork')}:
                {isRequestDetailData?.scope_of_workf} -
                {isRequestDetailData?.preferred_timelinef}
              </Text>
              <Text style={styles.text}>
                {t('requestDetails.experience')}:
                {isRequestDetailData?.experiencef}
              </Text>
              <Text style={styles.text}>
                {t('requestDetails.location')}: Belgium
              </Text>
              <Text style={styles.text}>
                {t('requestDetails.budget')}: € {isRequestDetailData?.budget}
              </Text>
            </View>

            <Text style={styles.skillTitle}>
              {t('requestDetails.skillsAndExpertise')}
            </Text>
            <View style={styles.skillsContainer}>
              {isRequestDetailData?.skills?.map((skill, index) => (
                <Pressable key={index} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skill.name}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionTitle}>
              {t('requestDetails.activityOnProject')}
            </Text>
            <View style={styles.activityContainer}>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={styles.text}>
                  {t('requestDetails.lastViewedByClient')}:
                </Text>
                <Text style={styles.text}>5 hours ago</Text>
              </View>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={styles.text}>{t('requestDetails.proposals')}</Text>
                <Text style={styles.text}>10</Text>
              </View>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={styles.text}>
                  {t('requestDetails.invitesSent')}
                </Text>
                <Text style={styles.text}>0</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>
              {t('requestDetails.aboutClient')}
            </Text>
            <Text
              style={{
                fontFamily: 'Inter-Medium',
                fontSize: responsiveFontSize(2),
                color: '#000000',
                marginHorizontal: 15,
                marginVertical: 10,
              }}>
              {isRequestDetailData?.user?.name}
            </Text>
            <Text
              style={{
                fontFamily: 'Inter',
                fontSize: responsiveFontSize(1.6),
                color: '#000000',
                marginHorizontal: 15,
              }}>
              Joined in 2024
            </Text>
            <Text
              style={{
                fontFamily: 'Inter',
                fontSize: responsiveFontSize(1.6),
                color: '#000000',
                marginHorizontal: 15,
              }}>
              {t('requestDetails.followersCount', {
                followers: isRequestDetailData?.user?.followers_count,
              })}
              |
              {t('requestDetails.followingCount', {
                following: isRequestDetailData?.user?.following_count,
              })}
            </Text>
            <Text
              style={{
                fontFamily: 'Inter-Medium',
                fontSize: responsiveFontSize(1.64),
                color: 'gray',
                marginHorizontal: 15,
                marginVertical: 10,
              }}>
              {t('requestDetails.livesIn', {
                location: isRequestDetailData?.location,
              })}
            </Text>
          </ScrollView>
          <View style={styles.applyMainContainer}>
            <View style={styles.heartContainer}>
              <Image
                source={
                  isRequestDetailData?.is_favorited
                    ? icons.heartPurple
                    : icons.heartIcon
                }
                style={styles.heartIcon}
              />
            </View>

            {isRequestDetailData?.post_status == 'accepted' ||
            isRequestDetailData?.post_status == 'completed' ||
            isRequestDetailData?.post_status == 'in_progress' ? (
              <View style={{flex: 1}}>
                <Text
                  style={{
                    fontFamily: 'Inter-Bold',
                    fontSize: responsiveFontSize(1.64),
                    color: Colors.primary,
                  }}>
                  {isRequestDetailData?.post_status_label}
                </Text>
              </View>
            ) : (
              <View style={{flex: 1}}>
                <SignUpButton
                  title={t('requestDetails.apply')}
                  onPress={() => {
                    navigation.navigate(routes.NewProposal, {
                      ItemID: ItemID,
                    });
                  }}
                />
              </View>
            )}
          </View>
        </>
      )}
      {isLoading && <Loader />}
    </View>
  );
};

export default RequestDetails;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  //   headerContainer: {
  //     flexDirection: 'row',
  //     alignItems: 'center',
  //     justifyContent: 'space-between',
  //     marginHorizontal: 15,
  //     marginTop: 15,
  //   },
  headerContainer: {
    position: 'absolute', // Position the header absolutely over the slider
    top: 15, // Add spacing from the top
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.whiteTransparent,
    paddingHorizontal: '4%',
  },

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  title: {
    color: '#000000',
    fontSize: responsiveFontSize(1.88),
    fontFamily: 'Inter-SemiBold',
    marginLeft: 16,
  },
  viewAccountText: {
    fontFamily: 'Inter-Medium',
    fontSize: responsiveFontSize(1.41),
    color: '#754595',
    marginLeft: wp(2),
  },
  IconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    height: hp(2.2),
    width: hp(2.2),
  },
  notificationIcon: {
    height: hp(3),
    width: hp(3),
    marginHorizontal: 7,
  },
  notificationCount: {
    backgroundColor: 'red',
    height: hp(2.2),
    width: hp(2.2),
    borderRadius: 50,
    textAlign: 'center',
    color: 'white',
    fontFamily: 'Inter-Medium',
    fontSize: responsiveFontSize(1.41),
    position: 'absolute',
    top: -7,
    left: 20,
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
  projectTitle: {
    color: '#000000',
    fontFamily: 'Inter-SemiBold',
    fontSize: responsiveFontSize(1.88),
    paddingHorizontal: 15,
    marginTop: 20,
  },
  skillTitle: {
    color: '#000000',
    fontFamily: 'Inter-SemiBold',
    fontSize: responsiveFontSize(1.88),
    paddingHorizontal: 15,
  },
  subTitle: {
    color: '#263238',
    fontFamily: 'Inter-Medium',
    fontSize: responsiveFontSize(1.64),
    paddingHorizontal: 15,
  },
  postedTime: {
    color: '#787878',
    fontFamily: 'Inter-Medium',
    fontSize: responsiveFontSize(1.41),
    paddingHorizontal: 15,
    marginTop: 5,
  },
  descriptiontext: {
    color: '#787878',
    fontFamily: 'Inter-Medium',
    fontSize: responsiveFontSize(1.64),
    paddingHorizontal: 15,
    lineHeight: 20,
    marginTop: 5,
  },
  heartIcon: {
    height: 18,
    width: 18,
    resizeMode: 'contain',
  },
  applyMainContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
  heartContainer: {
    borderWidth: 1,
    borderRadius: 100,
    borderColor: '#754595',
    padding: 10,
    marginRight: 20,
  },
  divider: {
    height: 1,
    width: '90%',
    backgroundColor: '#A6A6A6',
    marginHorizontal: 15,
    marginVertical: 10,
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
  sliderImage: {
    width: '100%',
    height: hp(30),
    resizeMode: 'cover',
  },
  loderModalContainer: {
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
  row: {
    marginBottom: 10,
    marginHorizontal: 15,
    marginTop: 5,
  },
  text: {
    fontFamily: 'Inter-Medium',
    fontSize: responsiveFontSize(1.64),
    color: '#000',
    marginBottom: 5,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: responsiveFontSize(1.88),
    marginHorizontal: 15,
    color: '#000000',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    marginHorizontal: 15,
  },
  skillBadge: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 10,
    margin: 5,
  },
  skillText: {
    fontSize: 14,
    color: '#000000',
  },
  activityContainer: {
    marginTop: 20,
    marginHorizontal: 15,
  },
});
