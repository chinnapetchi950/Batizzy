import {
  Alert,
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import Colors from '../../helper/Colors';
import {deviceWidth, hp, wp} from '../../helper/constants';
import {icons} from '../../helper/imageConstants';
import {navigate} from '../../navigation/rootNavigator';
import {BASE_URL} from '../../helper/ApiConstant';
import SignUpButton from '../../common/SignUpButton';
import {routes} from '../../navigation/Routes';
import FontFamily from '../../helper/FontFamily';
import {useNavigation} from '@react-navigation/native';
import Loader from '../../common/Loader';

const ContractsDetailScreen = props => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const contractID = props.route.params.data?.id;
  const [contractsData, setContractsData] = useState([]);
  const [workingData, setWorkingData] = useState([]);
  const [remaingData, setRemaingData] = useState([]);
  const [workLength, setWorkLength] = useState(0);
  const [remaingLength, setRemaingLength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    var Token = await AsyncStorage.getItem('accessToken');
    axios({
      method: 'get',
      url: BASE_URL + `renovation_post_requests/${contractID}`,
      headers: {
        Authorization: 'Bearer ' + Token,
        Accept: 'application/json',
      },
    })
      .then(function (response) {
        setIsLoading(false);
        setContractsData(response.data.data);
        setWorkingData(response.data.data?.renovation_types_done);
        setRemaingData(response.data.data?.renovation_types);
        setWorkLength(response?.data?.data?.renovation_types_done.length);
        setRemaingLength(response?.data?.data?.renovation_types?.length);
      })
      .catch(error => {
        setIsLoading(false);
      });
  };

  const renderWorkData = item => {
    return (
      <View>
        <View style={[styles.flexDirectionRowSB, {marginVertical: hp(1)}]}>
          <View style={[styles.flexDirectionRow]}>
            <View style={[styles.bullets]}></View>
            <Text style={[styles.trackingName]}>{item.name}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderRemaingData = (item, index) => {
    return (
      <View key={index}>
        {item.pivot.is_done == 0 && (
          <View style={[styles.flexDirectionRowSB]}>
            <View style={[styles.flexDirectionRow]}>
              <View style={[styles.bullets]}></View>
              <Text style={[styles.trackingName]}>{item.name}</Text>
            </View>
            <TouchableOpacity
              style={[styles.checkBoxStyle]}
              onPress={() => gotpUpdateStatus(item)}></TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const gotpUpdateStatus = async items => {
    setIsLoading(true);

    const data = {
      renovation_post_request_id: items.pivot.renovation_post_request_id,
      renovation_type_id: items.pivot.renovation_type_id,
      _method: 'put',
    };
    var Token = await AsyncStorage.getItem('accessToken');
    axios({
      method: 'post',
      url: BASE_URL + `renovation_post_requests_work_status`,
      data: data,
      headers: {
        Authorization: 'Bearer ' + Token,
        Accept: 'application/json',
      },
    })
      .then(function (response) {
        setIsLoading(false);
        fetchData();
      })
      .catch(error => {
        setIsLoading(false);
      });
  };

  const gotoFinishJobAlert = async () => {
    Alert.alert(
      t('contractsDetails.finishJob'),
      t('contractsDetails.doYouReallyWantToFinishJob'),
      [
        {
          text: t('contractsDetails.cancel'),
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {text: t('contractsDetails.ok'), onPress: () => gotoFinishJob()},
      ],
    );
  };

  const gotoFinishJob = async () => {
    setIsLoading(true);

    const data = {
      status: 'completed',
      _method: 'put',
    };
    var Token = await AsyncStorage.getItem('accessToken');
    axios({
      method: 'post',
      url: BASE_URL + `renovation_post_requests/${contractID}`,
      data: data,
      headers: {
        Authorization: 'Bearer ' + Token,
        Accept: 'application/json',
      },
    })
      .then(function (response) {
        setIsLoading(false);
        navigate(routes.ConclusionScreen);
      })
      .catch(error => {
        setIsLoading(false);
      });
  };

  const emptyMesRenderProg = () => {
    return (
      <View style={{flex: 1}}>
        <Text style={[styles.emptyMsg]}>
          {t('contractsDetails.notStarted')}
        </Text>
      </View>
    );
  };

  const emptyMesRenderRemaining = () => {
    return (
      <View style={{flex: 1}}>
        <Text style={[styles.emptyMsg]}>
          {t('contractsDetails.noTasksRemaining')}
        </Text>
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

  const createConversionID = async userID => {
    var Token = await AsyncStorage.getItem('accessToken');

    const data = {
      to_id: userID,
      to_type: 'user',
    };
    axios({
      method: 'post',
      url: BASE_URL + `conversations`,
      headers: {
        Authorization: 'Bearer' + Token,
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

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar animated={true} backgroundColor={Colors.white} />
        <View style={[styles.mainPadding]}>
          <View style={[styles.headerContainer]}>
            <View style={[styles.flexDirectionRow]}>
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
              <Text style={[styles.headerText]}>
                {t('contractsDetails.details')}
              </Text>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={{paddingBottom: 100}}
            showsVerticalScrollIndicator={false}
            scrollEnabled>
            <View style={[styles.bottomBorder, styles.flexDirectionRowSB]}>
              <Text style={[styles.detailsTitle]}>
                {contractsData?.renovation_post?.title}
              </Text>
              <View>
                {contractsData.status == 'accepted' && (
                  <TouchableOpacity
                    style={{alignItems: 'center', padding: 10}}
                    onPress={() => createConversionID(contractsData.user_id)}>
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
                        contractsData.status == 'completed' ||
                        contractsData.status == 'accepted'
                          ? Colors.green
                          : contractsData.status == 'rejected'
                          ? Colors.red
                          : contractsData.status == 'pending'
                          ? Colors.yellow
                          : Colors.yellow,
                    },
                  ]}>
                  {contractsData.status_human_readable}
                </Text>
              </View>
            </View>

            <View style={[styles.keyValueContainer]}>
              <Text style={[styles.key]}>
                {t('contractsDetails.proposalId')}
              </Text>
              <Text style={[styles.value]}>{contractsData?.id}</Text>
            </View>
            <View style={[styles.keyValueContainer]}>
              <Text style={[styles.key]}>
                {t('contractsDetails.clientName')}
              </Text>
              <Text style={[styles.value]}>{contractsData?.user?.name}</Text>
            </View>
            <View style={[styles.keyValueContainer]}>
              <Text style={[styles.key]}>
                {t('contractsDetails.estimatedBudget')}
              </Text>
              <Text style={[styles.value]}>
                {contractsData?.renovation_post?.budget}
              </Text>
            </View>
            <View style={[styles.keyValueContainer]}>
              <Text style={[styles.key]}>{t('contractsDetails.timeline')}</Text>
              <Text style={[styles.value]}>
                {contractsData?.renovation_post?.preferred_timelinef}
              </Text>
            </View>
            <View style={{paddingVertical: hp(1)}}>
              <Text style={[styles.key, {paddingBottom: hp(1)}]}>
                {t('contractsDetails.servicesAccepted')}
              </Text>
              <FlatList
                data={contractsData?.renovation_types}
                horizontal
                scrollEnabled
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => renderData(item)}
                showsVerticalScrollIndicator={false}
              />
            </View>

            {contractsData.status == 'pending' ? (
              <View>
                <Image
                  source={icons.info}
                  style={[styles.checkIcon, {tintColor: Colors.yellow}]}
                />
                <Text style={[styles.jobMsg, {color: Colors.yellow}]}>
                  {t('contractsDetails.jobPending')}
                </Text>
              </View>
            ) : contractsData.status == 'rejected' ? (
              <View>
                <View
                  style={{
                    padding: 10,
                    borderWidth: 2,
                    borderColor: Colors.red,
                    alignItems: 'center',
                    alignSelf: 'center',
                    backgroundColor: Colors.white,
                    borderRadius: 100,
                    marginTop: 30,
                  }}>
                  <Image source={icons.CloseIcon} style={[styles.close]} />
                </View>
                <Text style={[styles.jobMsg, {color: Colors.red}]}>
                  {t('contractsDetails.jobRejected')}
                </Text>
              </View>
            ) : (
              <View>
                <View style={[styles.bottomBorder, {paddingVertical: hp(1)}]}>
                  <Text style={[styles.bigText]}>
                    {t('contractsDetails.workProgress')}
                  </Text>
                  <FlatList
                    data={workingData}
                    scrollEnabled
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({item}) => renderWorkData(item)}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={() => emptyMesRenderProg()}
                  />
                </View>
                <View style={[styles.bottomBorder, {paddingVertical: hp(1)}]}>
                  <Text style={[styles.bigText]}>
                    {t('contractsDetails.remainingWork')}
                  </Text>
                  <FlatList
                    data={remaingData}
                    scrollEnabled
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({item, index}) =>
                      renderRemaingData(item, index)
                    }
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={() => emptyMesRenderRemaining()}
                  />
                </View>
                {workLength == remaingLength && (
                  <View style={[{paddingVertical: hp(2)}]}>
                    <Text style={[styles.taskStyle]}>
                      {t('contractsDetails.noTasksRemaining')}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View>
              {workLength == remaingLength &&
                contractsData.status != 'completed' && (
                  <View style={[{paddingVertical: hp(2)}]}>
                    <SignUpButton
                      onPress={() => gotoFinishJobAlert()}
                      title={t('contractsDetails.finishJob')}
                    />
                  </View>
                )}
              {contractsData.status == 'completed' && (
                <View>
                  <Image
                    source={icons.checkCircle}
                    style={[styles.checkIcon]}
                  />
                  <Text style={[styles.jobMsg]}>
                    {t('contractsDetails.jobCompleted')}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
      {isLoading && <Loader />}
    </SafeAreaProvider>
  );
};

export default ContractsDetailScreen;

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
    lineHeight: 25,
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
  sendSize: {
    height: 20,
    width: 20,
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
  flexDirectionRowSB: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontSize: responsiveFontSize(1.7),
    color: Colors.black,
    paddingLeft: wp(2),
  },
  trackingDate: {
    fontSize: responsiveFontSize(1.2),
    color: Colors.fontDarkGray,
  },
  padding2: {
    paddingBottom: hp(2),
  },
  bigText: {
    color: Colors.black,
    fontSize: responsiveFontSize(2),
    lineHeight: 25,
    paddingVertical: hp(1),
  },
  bullets: {
    padding: 5,
    borderRadius: 10,
    backgroundColor: Colors.black,
  },
  checkBoxStyle: {
    padding: '2%',
    borderRadius: 1,
    borderColor: Colors.black,
    borderWidth: 1,
    marginVertical: hp(1),
  },
  purpleFont: {
    color: Colors.primary,
    fontSize: responsiveFontSize(2),
    lineHeight: 25,
    paddingLeft: hp(1),
  },
  iconBtnContaienr: {
    padding: '2%',
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  btnView: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginTop: -15,
    marginRight: 10,
  },
  taskStyle: {
    fontSize: responsiveFontSize(2),
    color: Colors.black,
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
  statusValue: {
    color: Colors.yellow,
    fontSize: responsiveFontSize(1.8),
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
  },
  checkIcon: {
    height: 40,
    width: 40,
    tintColor: Colors.primaryGreen,
    alignSelf: 'center',
    marginVertical: 10,
  },
  close: {
    height: 14,
    width: 14,
    tintColor: Colors.red,
    alignSelf: 'center',
  },
  jobMsg: {
    color: Colors.primaryGreen,
    fontSize: responsiveFontSize(2),
    paddingVertical: hp(1),
    textAlign: 'center',
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
  chaticonSize: {
    height: 20,
    width: 20,
  },
});
