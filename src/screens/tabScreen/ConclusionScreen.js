import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Pressable,
  RefreshControl,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import React, {useCallback, useEffect, useState} from 'react';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Modal from 'react-native-modal';
import {deviceHeight, deviceWidth, hp, wp} from '../../helper/constants';
import Colors from '../../helper/Colors';
import FontFamily from '../../helper/FontFamily';
import {icons} from '../../helper/imageConstants';
import {navigate} from '../../navigation/rootNavigator';
import {routes} from '../../navigation/Routes';
import {BASE_URL} from '../../helper/ApiConstant';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

const ConclusionScreen = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();

  const [contractData, setContractData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [token, setToken] = useState('');
  const [userData, setUserData] = useState('');

  const gotoContractDetailsScreen = item => {
    navigate(routes.ContractsDetailScreen, {data: item});
  };

  useEffect(() => {
    getToken();
  }, []);

  const getToken = async () => {
    var Token = await AsyncStorage.getItem('accessToken');
    setToken(Token);
    fetchData(Token);
  };

  const fetchData = async token => {
    setIsLoading(true);
    axios({
      method: 'get',
      url: BASE_URL + 'renovation_post_requests?type=contract',
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/json',
      },
    })
      .then(function (response) {
        setIsLoading(false);
        setContractData(response.data.data);
      })
      .catch(error => {
        setIsLoading(false);
      });
  };

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

  const createConversionID = userID => {
    const data = {
      to_id: userID,
      to_type: 'user',
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
          navigate(routes.MessageScreen, {ID: response.data.data?.id});
        }
      })
      .catch(error => {
        setIsLoading(false);
      });
  };

  const renderListData = (item, index) => {
    const displayStatus = item?.status_human_readable;
    return (
      <View key={index} style={[styles.bottomBorder]}>
        <TouchableOpacity onPress={() => gotoContractDetailsScreen(item)}>
          <View
            style={[
              styles.keyValueContainer,
              {justifyContent: 'space-between'},
            ]}>
            <View style={[styles.keyValueContainer]}>
              <Text style={[styles.key]}>{'Proposal ID :'}</Text>
              <Text style={[styles.value]}>{item.id}</Text>
            </View>
            <View>
              {item.status == 'accepted' && (
                <TouchableOpacity
                  style={{alignItems: 'center', padding: 10}}
                  onPress={() => createConversionID(item.user_id)}>
                  <Image
                    resizeMode="contain"
                    source={icons.chat}
                    style={styles.chaticonSize}
                  />
                </TouchableOpacity>
              )}
              <Text
                style={[
                  styles.statusValue,
                  {
                    color:
                      item.status == 'completed' || item.status == 'accepted'
                        ? Colors.green
                        : item.status == 'rejected'
                        ? Colors.red
                        : item.status == 'pending'
                        ? Colors.yellow
                        : Colors.yellow,
                  },
                ]}>
                {displayStatus.length <= 10
                  ? displayStatus
                  : `${displayStatus.substring(0, 10)}...`}
              </Text>
            </View>
          </View>
          <View style={[styles.keyValueContainer]}>
            <Text style={[styles.key]}>{'Client Name :'}</Text>
            <Text style={[styles.value]}>{item.user.name}</Text>
          </View>
          <View style={[styles.keyValueContainer]}>
            <Text style={[styles.key]}>{'Project :'}</Text>
            <Text style={[styles.value, {width: deviceWidth / 2.1}]}>
              {item?.renovation_post?.title}
            </Text>
          </View>
          <View style={[styles.keyValueContainer]}>
            <Text style={[styles.key]}>{'Estimated Budget :'}</Text>
            <Text style={[styles.value]}>{item.renovation_post.budget}</Text>
          </View>
          <View style={[styles.keyValueContainer]}>
            <Text style={[styles.key]}>{'Completion Date :'}</Text>
            <Text style={[styles.value]}>{item.completion_date}</Text>
          </View>
        </TouchableOpacity>
        <Text style={[styles.key, {paddingVertical: hp(1)}]}>
          {'Services Specification :'}
        </Text>
        <FlatList
          data={item.renovation_types}
          horizontal
          scrollEnabled
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => renderData(item)}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => emptyMesRenderSer()}
        />
      </View>
    );
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
          {t('categoryScreen.emptyMessage')}
        </Text>
      </View>
    );
  };

  const emptyMesRenderSer = () => {
    return (
      <View style={{flex: 1}}>
        <Text style={[styles.emptyMsgSer]}>{'No services'}</Text>
      </View>
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    fetchData(token);
    setRefreshing(false);
  };
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar animated={true} backgroundColor={Colors.white} />
        <View style={[styles.mainPadding]}>
          <View style={[styles.headerContainer]}>
            <Text style={[styles.headerText]}>
              {t('contractsDetails.title')}
            </Text>

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
          <View>
            {/* <View style={[styles.serchContainer]}>
              <CustomSearchBar
                placeholder={'Search here'}
                width={deviceWidth - 100}
              />
              <View style={[styles.iconContainer]}>
                <Image source={icons.filterIcon} style={[styles.filterSize]} />
              </View>
            </View> */}
          </View>

          <FlatList
            contentContainerStyle={{paddingBottom: '30%'}}
            data={contractData}
            scrollEnabled
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item: contractData, index}) =>
              renderListData(contractData, index)
            }
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => emptyMesRender()}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
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

export default ConclusionScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  mainPadding: {
    padding: '4%', // wp(3.8),
  },
  headerText: {
    fontFamily: FontFamily.InterBold,
    fontSize: responsiveFontSize(3),
    color: Colors.black,
  },
  iconSize: {
    height: 26,
    width: 26,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterSize: {
    height: 16,
    width: 16,
  },
  iconContainer: {
    padding: '4%',
    borderWidth: 0.3,
    borderRadius: 50,
  },
  proposalReqContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: Colors.primary,
    borderBottomWidth: 1,
    alignSelf: 'flex-start',
  },
  proposalText: {
    color: Colors.primary,
  },
  textColor: {
    color: Colors.fontGray,
    fontSize: responsiveFontSize(1.6),
    lineHeight: 25,
  },
  bottomBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderColor,
    paddingVertical: hp(1),
  },
  serchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(2),
  },
  statusText: {
    color: Colors.fontDarkGray,
    fontSize: responsiveFontSize(1.8),
  },
  statusValue: {
    color: Colors.green,
    fontSize: responsiveFontSize(1.8),
  },
  keyValueContainer: {
    flexDirection: 'row',
    paddingTop: hp(1),
    alignItems: 'center',
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
  emptyMsg: {
    color: Colors.fontDarkGray,
    fontSize: responsiveFontSize(2),
    paddingVertical: hp(1),
    textAlign: 'center',
    marginTop: deviceHeight / 4,
  },
  emptyMsgSer: {
    color: Colors.fontDarkGray,
    fontSize: responsiveFontSize(2),
    paddingVertical: hp(1),
    textAlign: 'center',
  },
  chaticonSize: {
    height: 20,
    width: 20,
  },
});
