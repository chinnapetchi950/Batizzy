import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import React, {useCallback, useEffect, useState} from 'react';
import axios from 'axios';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import Colors from '../../helper/Colors';
import {deviceHeight, deviceWidth, hp, wp} from '../../helper/constants';
import FontFamily from '../../helper/FontFamily';
import {icons} from '../../helper/imageConstants';
import {BASE_URL} from '../../helper/ApiConstant';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import moment from 'moment';
import {routes} from '../../navigation/Routes';
const ProposalDetailsScreen = props => {
  const {t} = useTranslation(); // Use the translation hook
  const navigation = useNavigation();
  const route = useRoute();
  const [ID, setID] = useState(props.route.params.ID || 0);
  const [proposalData, setProposalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      var Token = await AsyncStorage.getItem('accessToken');
      axios({
        method: 'get',
        url: BASE_URL + `renovation_post_requests/${ID}`,
        headers: {
          Authorization: 'Bearer ' + Token,
          Accept: 'application/json',
        },
      })
        .then(function (response) {
          setIsLoading(false);
          setProposalData(response.data.data);
        })
        .catch(error => {
          setIsLoading(false);
        });
    }
    fetchData();
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
      })
      .catch(error => {
        setIsLoading(false);
      });
  };

  const renderData = item => {
    return (
      <View style={[styles.listCont]}>
        <Text style={[styles.listText]}>{item.name}</Text>
      </View>
    );
  };

  const emptyMesRender = () => {
    return (
      <View style={{flex: 1}}>
        <Text style={[styles.emptyMsg]}>
          {t('proposalDetails.processNotStarted')}
        </Text>
      </View>
    );
  };

  const emptySerMesRender = () => {
    return (
      <View style={{flex: 1}}>
        <Text style={[styles.emptyMsg]}>{t('proposalDetails.noServices')}</Text>
      </View>
    );
  };

  const renderTrackingData = (item, index) => {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          marginBottom: 10,
        }}>
        <View style={{alignItems: 'center'}}>
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: Colors.green,
              borderWidth: 2,
              borderColor: Colors.green,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text style={{color: '#FFFFFF', fontSize: 12, fontWeight: 'bold'}}>
              ✔
            </Text>
          </View>
          <View
            style={{
              height: 40,
              borderLeftWidth: 1,
              borderColor: Colors.green,
              marginTop: 2,
            }}
          />
        </View>
        <View style={{marginLeft: 10}}>
          <Text style={[styles.trackingName]}>
            {item.status_human_readable}
          </Text>
          <Text style={[styles.trackingDate]}>
            {moment(item.updated_at).format('ddd, DD MMM hh:mm A')}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar animated={true} backgroundColor={Colors.white} />
        <View style={[styles.mainPadding]}>
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
              <Text style={styles.headerText}>
                {t('proposalDetails.details')}
              </Text>
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
          <ScrollView>
            <View style={[styles.bottomBorder]}>
              <Text style={[styles.detailsTitle]}>
                {proposalData?.renovation_post?.title}
              </Text>
            </View>
            <View style={[styles.bottomBorder]}>
              <Text style={[styles.midText]}>
                {proposalData?.renovation_types_names}
              </Text>
              <Text style={[styles.smallText]}>
                {proposalData?.renovation_post?.posted_at}
              </Text>
            </View>
            <View style={[styles.keyValueContainer]}>
              <Text style={[styles.key]}>
                {t('proposalDetails.proposalID')}
              </Text>
              <Text style={[styles.value]}>{proposalData?.id}</Text>
            </View>
            <View style={[styles.keyValueContainer]}>
              <Text style={[styles.key]}>
                {t('proposalDetails.clientName')}
              </Text>
              <Text style={[styles.value]}>{proposalData?.user?.name}</Text>
            </View>
            <View style={[styles.keyValueContainer]}>
              <Text style={[styles.key]}>
                {t('proposalDetails.estimatedBudget')}
              </Text>
              <Text style={[styles.value]}>
                {proposalData?.renovation_post?.budget}
              </Text>
            </View>
            <View style={[styles.keyValueContainer]}>
              <Text style={[styles.key]}>{t('proposalDetails.timeline')}</Text>
              <Text style={[styles.value]}>
                {proposalData?.renovation_post?.preferred_timelinef}
              </Text>
            </View>
            <View style={{paddingVertical: hp(1)}}>
              <Text style={[styles.key, {paddingBottom: hp(1)}]}>
                {t('proposalDetails.servicesAccepted')}
              </Text>
              <FlatList
                data={proposalData?.renovation_types}
                horizontal
                scrollEnabled
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => renderData(item)}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => emptySerMesRender()}
              />
            </View>
            <Text style={[styles.keyBlack]}>
              {t('proposalDetails.detailsSection')}
            </Text>
            <Text style={[styles.valueDetails]}>
              {proposalData?.renovation_post?.description}
            </Text>
            <Text style={[styles.keyBlack]}>
              {t('proposalDetails.trackProgress')}
            </Text>
            <View style={[styles.trackContainer]}>
              <FlatList
                data={proposalData?.request_tracking}
                scrollEnabled
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => renderTrackingData(item)}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => emptyMesRender()}
              />
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
      {isLoading && (
        <Modal isVisible={isLoading} style={styles.modalContainer}>
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={'#754595'} />
          </View>
        </Modal>
      )}
    </SafeAreaProvider>
  );
};

export default ProposalDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  mainPadding: {
    padding: '4%', // wp(3.8),
  },
  detailsTitle: {
    color: Colors.black,
    fontSize: responsiveFontSize(2),
    fontFamily: FontFamily.InterSemiBold,
  },
  bottomBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderColor,
    paddingVertical: hp(1),
  },
  midText: {
    color: Colors.fontDarkGray,
    fontSize: responsiveFontSize(1.4),
    fontFamily: FontFamily.InterRegular,
  },
  smallText: {
    color: Colors.fontLightGray,
    fontSize: responsiveFontSize(1.5),
    lineHeight: 25,
  },
  keyValueContainer: {
    flexDirection: 'row',
    paddingTop: hp(1),
  },
  key: {
    color: Colors.fontLightGray,
    fontSize: responsiveFontSize(1.8),
    width: deviceWidth / 2.5,
  },
  value: {
    color: Colors.black,
    fontSize: responsiveFontSize(1.8),
  },
  listCont: {
    backgroundColor: Colors.grayBG,
    borderRadius: 4,
    marginRight: 10,
    marginVertical: 10,
  },
  listText: {
    color: Colors.black,
    fontSize: responsiveFontSize(1.6),
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  keyBlack: {
    color: Colors.black,
    fontSize: responsiveFontSize(1.8),
  },
  valueDetails: {
    color: Colors.fontGray,
    fontSize: responsiveFontSize(1.6),
    lineHeight: 22,
    paddingVertical: hp(1),
  },
  headerText: {
    fontFamily: FontFamily.InterMedium,
    fontSize: responsiveFontSize(2),
    color: Colors.black,
    paddingLeft: wp(4),
  },
  iconSize: {
    height: 26,
    width: 26,
  },
  filterSize: {
    height: 16,
    width: 16,
    resizeMode: 'contain',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(1),
  },
  flexDirectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    padding: wp(2),
    borderWidth: 0.3,
    borderRadius: 50,
  },
  trackContainer: {
    paddingVertical: hp(2),
  },
  trackingName: {
    fontSize: responsiveFontSize(1.6),
    color: Colors.black,
    fontFamily: FontFamily.InterMedium,
  },
  trackingDate: {
    fontSize: responsiveFontSize(1.2),
    color: Colors.fontLightGray,
    fontFamily: FontFamily.InterRegular,
  },
  trackPadding: {
    paddingBottom: hp(2),
  },
  flexDirectionRowSB: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  bullets: {
    padding: '5%',
    borderRadius: 10,
    backgroundColor: Colors.black,
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
  emptyMsg: {
    color: Colors.fontDarkGray,
    fontSize: responsiveFontSize(2),
    paddingVertical: hp(1),
    textAlign: 'center',
    marginTop: deviceHeight / 10,
  },
});
