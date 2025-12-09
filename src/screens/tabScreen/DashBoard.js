import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Pressable,
  FlatList,
  StatusBar,
  Platform,
  RefreshControl,
  ScrollView,
  Modal as RNModal,
  KeyboardAvoidingView,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import ModalDropdown from 'react-native-modal-dropdown';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {navigate} from '../../navigation/rootNavigator';
import {routes} from '../../navigation/Routes';
import {icons} from '../../helper/imageConstants';
import {deviceHeight, deviceWidth, hp, wp} from '../../helper/constants';
import {BASE_URL} from '../../helper/ApiConstant';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import Colors from '../../helper/Colors';
import CustomSearchBar from '../../common/CustomSearchBar';
import BottomSheetCondition from '../../common/BottomSheetCondition';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import axios from 'axios';
import {showMessage} from 'react-native-flash-message';
import Loader from '../../common/Loader';
import Geolocation from '@react-native-community/geolocation';
import FontFamily from '../../helper/FontFamily';
import Icons from '../../common/Icons';
import LanguageData from '../../i18n/LanguageData';
// import {useLanguage} from '../../context/LanguageContext';

const DashBoard = () => {
  const dropdownRef = useRef();
  const {t} = useTranslation();

  const navigation = useNavigation();
  const [token, setToken] = useState();
  const [code, setCode] = useState();
  const [userData, setUserData] = useState([]);
  const [storedLanguage, setStoredLanguage] = useState({});
  // const {selectedLanguage, changeLanguage} = useLanguage();

  const [isCommentSheetOpen, setIsCommentSheetOpen] = useState(false);
  const [search, setSearch] = useState('');

  const [minPrice, setMinPrice] = useState('');

  const [maxPrice, setMaxPrice] = useState('');
  const [isFilterLatitude, setFilterLatitude] = useState('');
  const [isFilterLongitude, setFilterLongitude] = useState('');
  const [isFilterAddress, setFilterAddress] = useState('');

  const [isBestTab, setBestTab] = useState(true);
  const [isApplied, setApplied] = useState(false);
  const [isRecentTab, setRecentTab] = useState(false);
  const [isSaveTab, setSaveTab] = useState(false);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [refreshing, setRefreshing] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [otherRnovationPost, setOtherRnovationPost] = useState([]);
  const [isOtherPost, setIsOtherPost] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getUserCurrentLocation();
    getToken();
    getLanguageCode();
  }, []);

  const getUserCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      async position => {
        setFilterLatitude(position?.coords?.latitude);
        setFilterLongitude(position?.coords?.longitude);
        setLatitude(position?.coords?.latitude);
        setLongitude(position?.coords?.longitude);
      },
      error => {
        console.log(error.code, error.message);
      },
      {enableHighAccuracy: false, timeout: 20000, maximumAge: 1000},
    );
  };

  const getToken = async () => {
    var Token = await AsyncStorage.getItem('accessToken');
    setToken(Token);
    getRequestData(Token, 'best');
  };

  const getLanguageCode = async () => {
    var LanguageCode = JSON.parse(await AsyncStorage.getItem('Language'));
    setCode(LanguageCode);
    // changeLanguage(LanguageCode);
    if (LanguageCode != null) {
      updateLanguageCode(LanguageCode);
    }
  };

  const updateLanguageCode = async code => {
    var Token = await AsyncStorage.getItem('accessToken');
    setIsLoading(true);
    const data = {
      lang: code,
      _method: 'put',
    };

    axios({
      method: 'post',
      url: BASE_URL + `set_language`,
      headers: {
        Authorization: 'Bearer' + Token,
        Accept: 'application/json',
      },
      data: data,
    })
      .then(function (response) {
        setIsLoading(false);
        getUserData();
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
        const selectedCodeLang = LanguageData.find(
          lang => lang.code === response.data.data.lang,
        );
        // changeLanguage(selectedCodeLang?.code);
        setStoredLanguage(selectedCodeLang);
      })
      .catch(error => {
        setIsLoading(false);
      });
  };

  const getRequestData = async (Token, type) => {
    let url = `${BASE_URL}home?type=${type}`;
    if (global.latitude && global.longitude) {
      url += `&lat=${global.latitude}&lng=${global.longitude}`;
    }

    setIsLoading(true);
    axios({
      method: 'get',
      url: url,
      headers: {
        Authorization: 'Bearer' + Token,
        Accept: 'application/json',
      },
    })
      .then(function (response) {
        setIsLoading(false);
        if (response.data.data.length != 0) {
          setFilteredData(response.data.data);
          setIsOtherPost(false);
        } else if (response.data.data.length === 0) {
          setIsOtherPost(true);
          setOtherRnovationPost(response.data.other_suggested_renovation_posts);
        }
      })
      .catch(error => {
        setIsLoading(false);
      });
  };

  const toggleCommentSheet = () => {
    setIsCommentSheetOpen(!isCommentSheetOpen);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const type = isBestTab
      ? 'best'
      : isApplied
      ? 'applied'
      : isRecentTab
      ? 'recent'
      : 'saved';
    getRequestData(token, type);
    setRefreshing(false);
  };

  const resetFilters = () => {
    toggleCommentSheet();
    setMinPrice('');
    setMaxPrice('');
    setFilterLatitude('');
    setFilterLongitude('');
    setFilterAddress('');
    getRequestData(token, 'best');
  };

  const applyFilters = () => {
    const type = isBestTab
      ? 'best'
      : isApplied
      ? 'applied'
      : isRecentTab
      ? 'recent'
      : 'saved';

    setIsCommentSheetOpen(false);
    getFilterData(type);
  };

  const getFilterData = useCallback(
    async type => {
      setIsLoading(true);
      try {
        let url = `${BASE_URL}home?type=${type}`;
        if (isFilterLatitude && isFilterLongitude) {
          url += `&lat=${isFilterLatitude}&lng=${isFilterLongitude}`;
        }
        if (search) {
          url += `&search=${search}`;
        }
        axios({
          method: 'get',
          url: url,
          headers: {
            Authorization: 'Bearer' + token,
            Accept: 'application/json',
          },
        })
          .then(function (response) {
            setIsLoading(false);
            setFilteredData(response.data.data);
            if (response.data.data.length != 0) {
              setIsOtherPost(false);
            } else if (response.data.data.length === 0) {
              setIsOtherPost(true);
              setOtherRnovationPost(
                response.data.other_suggested_renovation_posts,
              );
            }
          })
          .catch(error => {
            setIsLoading(false);
          });
      } catch (error) {
        setIsLoading(false);
      }
    },
    [isFilterLatitude, isFilterLongitude, maxPrice, minPrice],
  );

  const renderSkillData = (item, index) => {
    return (
      <View key={index} style={styles.tag}>
        <Text style={styles.tagText}>{item?.name}</Text>
      </View>
    );
  };

  const addToWishList = async item => {
    setIsLoading(true);
    axios({
      method: 'post',
      url: BASE_URL + `favorites/toggle/${item?.id}`,
      headers: {
        Authorization: 'Bearer' + token,
        Accept: 'application/json',
      },
    })
      .then(function (response) {
        setIsLoading(false);
        getRequestData(token, 'best');
        showMessage({
          message: response?.data?.message,
          type: 'success',
        });
      })
      .catch(error => {
        setIsLoading(false);
      });
  };

  const renderRequestData = (item, index) => {
    return (
      <View key={index}>
        <View
          style={{
            height: 1,
            backgroundColor: '#A6A6A6',
            marginBottom: '4%',
            marginHorizontal: '4%',
          }}
        />
        <Pressable
          style={styles.projectCard}
          onPress={() => {
            navigate(routes.RequestDetails, {
              ItemID: item?.id,
            });
          }}>
          <View style={[styles.iconContainerSB]}>
            <Text style={styles.postedDate}>
              {'Posted'} {item.posted_at}
            </Text>
            <TouchableOpacity
              style={{padding: '1%'}}
              onPress={() => addToWishList(item)}>
              <Image
                source={item?.is_favorited ? icons.heartFill : icons.heart}
                style={[styles.iconHeartStyle]}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.projectTitle}>{item.title}</Text>
          <Text style={styles.projectDetails}>
            {item.scope_of_workf}
            {'-'} {item?.experiencef} {'-'} {item?.preferred_timelinef}
          </Text>
          <Text
            numberOfLines={4}
            style={[styles.projectDescription, {textOverflow: 'ellipsis'}]}>
            {item.description}
          </Text>
        </Pressable>
        <View style={[styles.tagsContainer, styles.mainPaddingH]}>
          <FlatList
            data={item?.skills}
            horizontal
            scrollEnabled
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => renderSkillData(item, index)}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <View
          style={[
            styles.projectFooter,
            styles.mainPaddingH,
            styles.mainpaddingBottom,
          ]}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Image
              resizeMode="contain"
              source={icons.markerIcon}
              style={styles.markerIcon}
            />
            <Text style={styles.projectLocation}>{item.location}</Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Image
              resizeMode="contain"
              source={icons.currencyIcon}
              style={styles.markerIcon}
            />
            <Text style={styles.projectBudget}>{item.budget}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderOtherRequestData = (item, index) => {
    return (
      <View key={index}>
        <View
          style={{
            height: 1,
            backgroundColor: '#A6A6A6',
            marginBottom: '4%',
            marginHorizontal: '4%',
          }}
        />
        <Pressable
          style={styles.projectCard}
          onPress={() => {
            navigate(routes.RequestDetails, {
              ItemID: item?.id,
            });
          }}>
          <View style={[styles.iconContainerSB]}>
            <Text style={styles.postedDate}>
              {'Posted'} {item.posted_at}
            </Text>
            <TouchableOpacity
              style={{padding: '1%'}}
              onPress={() => addToWishList(item)}>
              <Image
                source={item?.is_favorited ? icons.heartFill : icons.heart}
                style={[styles.iconHeartStyle]}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.projectTitle}>{item.title}</Text>
          <Text style={styles.projectDetails}>
            {item.scope_of_workf}
            {'-'} {item?.experiencef} {'-'} {item?.preferred_timelinef}
          </Text>
          <Text
            numberOfLines={3}
            style={[styles.projectDescription, {textOverflow: 'ellipsis'}]}>
            {item.description}
          </Text>
        </Pressable>
        <View style={[styles.tagsContainer, styles.mainPaddingH]}>
          <FlatList
            data={item?.skills}
            horizontal
            scrollEnabled
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => renderSkillData(item, index)}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <View
          style={[
            styles.projectFooter,
            styles.mainPaddingH,
            styles.mainpaddingBottom,
          ]}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Image
              resizeMode="contain"
              source={icons.markerIcon}
              style={styles.markerIcon}
            />
            <Text style={styles.projectLocation}>{item.location}</Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Image
              resizeMode="contain"
              source={icons.currencyIcon}
              style={styles.markerIcon}
            />
            <Text style={styles.projectBudget}>{item.budget}</Text>
          </View>
        </View>
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

  const onChangeSearch = text => {
    setSearch(text);
  };

  const onSelectLanguage = async (index, value, image, code) => {
    setStoredLanguage({image: image, text: value});
    await AsyncStorage.setItem('Language', JSON.stringify(code));
    updateLanguageCode(code);
    // changeLanguage(code);
    dropdownRef.current.hide();
  };

  const gotoUniverrsalSearchScreen = () => {
    navigate(routes.UniversalSearch);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container]}>
        <StatusBar animated={true} backgroundColor={Colors.white} />
        <View style={{flex: 1}}>
          <View style={[styles.headerContainer, styles.mainPaddingH]}>
            <View style={styles.titleContainer}>
              <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                <Text style={styles.title}>{t('Home.greeting') + ' '} </Text>
                <Text style={[styles.title]}>
                  {/* {selectedLanguage != 'en' && userData?.name?.length > 6
                    ? `${userData.name.substring(0, 6)}...`
                    : userData?.name} */}
                </Text>
              </View>
            </View>
            <View style={styles.IconsContainer}>
              <ModalDropdown
                ref={dropdownRef}
                dropdownStyle={[styles.dropdownViewLayout]}
                showsVerticalScrollIndicator={false}
                options={LanguageData}
                onSelect={(index, value, image, code) =>
                  onSelectLanguage(index, value, image, code)
                }
                renderRow={(option, index, isSelected) => (
                  <TouchableOpacity
                    style={[
                      styles.renderMainView,
                      {
                        backgroundColor: isSelected ? '#DDDDDD' : 'transparent',
                      },
                    ]}
                    onPress={() =>
                      onSelectLanguage(
                        index,
                        option.text,
                        option.image,
                        option.code,
                      )
                    }>
                    <Image
                      resizeMode="contain"
                      source={option.image}
                      style={[styles.dropdownLang]}
                    />
                    <Text style={[styles.langText]}>
                      {option.code.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                )}
                renderButtonText={({text}) => (
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={[styles.langText]}>{text}</Text>
                  </View>
                )}>
                <View style={[styles.viewLangContainer]}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Image
                      resizeMode="contain"
                      source={storedLanguage?.image || icons.heartFill}
                      style={[styles.dropdownLang]}
                    />
                    <Text style={[styles.langText, {paddingLeft: 3}]}>
                      {/* {storedLanguage?.code.toUpperCase() || 'EN'} */}
                    </Text>
                  </View>
                  <Icons
                    iconSetName={'FontAwesome6'}
                    iconName={'caret-down'}
                    iconColor={Colors.primary}
                    iconSize={20}
                  />
                </View>
              </ModalDropdown>
              <TouchableOpacity
                style={{
                  justifyContent: 'center',
                  flexDirection: 'row',
                  marginLeft: 5,
                }}
                onPress={() => gotoUniverrsalSearchScreen()}>
                <Text style={[styles.AppText]}>{t('Home.search')}</Text>
                <Icons
                  iconSetName={'Ionicons'}
                  iconName={'search-outline'}
                  iconColor={Colors.primary}
                  iconSize={20}
                />
              </TouchableOpacity>
              <View>
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
          </View>
          <ScrollView>
            <LinearGradient
              colors={['#FFFFFF', '#754595']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={{marginTop: '4%'}}>
              <View style={styles.banner}>
                <Image source={icons.homeRepair} style={styles.bannerImage} />
                <View style={styles.bannerTextWrapper}>
                  <Text style={styles.bannerText}>{t('Home.bannerText')}</Text>
                  <View style={styles.bannerButtons}>
                    <TouchableOpacity style={styles.bannerButton}>
                      <Text style={styles.buttonText}>
                        {t('Home.submitButton')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.bannerButton}>
                      <Text style={styles.buttonText}>
                        {t('Home.applyButton')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.bannerButton}>
                      <Text style={styles.buttonText}>
                        {t('Home.startButton')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </LinearGradient>
            <View style={[styles.mainPadding]}>
              <Text style={[styles.projectText]}>
                {t('Home.projectsTitle')}
              </Text>
            </View>
            <View style={[styles.mainPaddingH, styles.mainpaddingBottom]}>
              <CustomSearchBar
                value={search}
                placeholder={t('Home.searchPlaceholder')}
                width={deviceWidth - 100}
                isFilterBtn={true}
                onPressFilter={() => toggleCommentSheet()}
                onChangeText={text => onChangeSearch(text)}
                onPressSearch={() => applyFilters()}
              />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.tabs}>
                <Pressable
                  onPress={() => {
                    setBestTab(true);
                    setRecentTab(false);
                    setSaveTab(false);
                    setApplied(false);
                    getRequestData(token, 'best');
                  }}>
                  <Text
                    style={isBestTab ? styles.activeTab : styles.inActivetab}>
                    {t('Home.bestMatchesTab')}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setBestTab(false);
                    setRecentTab(true);
                    setSaveTab(false);
                    setApplied(false);
                    getRequestData(token, 'recent');
                  }}>
                  <Text
                    style={[
                      isRecentTab ? styles.activeTab : styles.inActivetab,
                      {marginHorizontal: 15},
                    ]}>
                    {t('Home.mostRecentTab')}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setBestTab(false);
                    setRecentTab(false);
                    setSaveTab(false);
                    setApplied(true);
                    getRequestData(token, 'applied');
                  }}>
                  <Text
                    style={[
                      isApplied ? styles.activeTab : styles.inActivetab,
                      {marginHorizontal: 15},
                    ]}>
                    {t('Home.appliedTab')}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setBestTab(false);
                    setRecentTab(false);
                    setSaveTab(true);
                    setApplied(false);
                    getRequestData(token, 'saved');
                  }}>
                  <Text
                    style={[
                      isSaveTab ? styles.activeTab : styles.inActivetab,
                      {marginHorizontal: 15},
                    ]}>
                    {t('Home.savedTab')}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
            <Text style={styles.tabDescription}>
              {t('Home.tabDescription')}
            </Text>
            <FlatList
              nestedScrollEnabled={true}
              data={filteredData}
              scrollEnabled
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item: data, index}) =>
                renderRequestData(data, index)
              }
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
            {filteredData?.length == 0 && (
              <Text style={[styles.emptyMsgpost]}>
                {t('Home.noPostsMessage')}
              </Text>
            )}
            {isOtherPost && (
              <View>
                <Text style={[styles.textboldPost]}>
                  {t('Home.otherPostsTitle')}
                </Text>
                <FlatList
                  nestedScrollEnabled={true}
                  data={otherRnovationPost}
                  scrollEnabled
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({item: data, index}) =>
                    renderOtherRequestData(data, index)
                  }
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
            )}
          </ScrollView>
        </View>
        {isCommentSheetOpen && (
          <BottomSheetCondition
            maxHeight={deviceHeight}
            isOpen={isCommentSheetOpen}
            onClose={() => toggleCommentSheet()}
            renderContent={() => {
              return (
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  style={{flex: 1}}>
                  <ScrollView
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{flexGrow: 1}}>
                    <View style={styles.conditionHeader}>
                      <Text style={styles.conditionHeaderText}>
                        {t('Home.filtersHeader')}
                      </Text>
                    </View>

                    <View style={styles.locationInputContainer}>
                      <View style={styles.locationTextcontainer}>
                        <Image
                          source={icons.markerIcon}
                          style={styles.filterMarkerIcon}
                        />
                        <GooglePlacesAutocomplete
                          placeholder={
                            isFilterAddress
                              ? isFilterAddress
                              : t('Home.selectLocationPlaceholder')
                          }
                          onPress={(data, details) => {
                            setFilterAddress(data.description);
                            setFilterLatitude(details.geometry.location.lat);
                            setFilterLongitude(details.geometry.location.lng);
                          }}
                          query={{
                            key: 'AIzaSyCceRTsiY-2UPVwytF6wytwaGmonWjvTHo',
                            language: 'en',
                          }}
                          fetchDetails
                          textInputProps={{
                            placeholderTextColor: Colors.lightPlaceholder,
                          }}
                          styles={{
                            textInput: {
                              color: Colors.fontDarkGray,
                              fontFamily: FontFamily.InterMedium,
                              fontSize: 14,
                            },
                            poweredContainer: {
                              justifyContent: 'flex-end',
                              alignItems: 'center',
                              borderBottomRightRadius: 5,
                              borderBottomLeftRadius: 5,
                              borderColor: '#c8c7cc',
                              borderTopWidth: 0.5,
                            },
                            powered: {},
                            listView: {},
                            row: {
                              backgroundColor: '#FFFFFF',
                              padding: 13,
                              height: 44,
                              flexDirection: 'row',
                            },
                            separator: {
                              height: 0.5,
                              backgroundColor: '#c8c7cc',
                            },
                            description: {
                              color: Colors.fontDarkGray,
                            },
                            loader: {
                              flexDirection: 'row',
                              justifyContent: 'flex-end',
                              height: 20,
                            },
                          }}
                        />
                      </View>
                    </View>

                    <View
                      style={{
                        marginBottom: 20,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                      <TouchableOpacity
                        style={{flex: 0.4}}
                        onPress={() => applyFilters()}>
                        <View style={[styles.bttonApplyContainer]}>
                          <Text style={[styles.buttonTextApply]}>
                            {t('Home.applyButton')}
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => resetFilters()}
                        style={{flex: 0.4}}>
                        <View style={[styles.bttonApplyContainer]}>
                          <Text style={[styles.buttonTextApply]}>
                            {t('Home.resetButton')}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </KeyboardAvoidingView>
              );
            }}
          />
        )}
        {isLoading && <Loader />}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default DashBoard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 10 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontFamily: FontFamily.InterBold,
    fontSize: responsiveFontSize(2),
    color: Colors.black,
  },
  notificationWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: -8,
    top: -8,
    backgroundColor: 'red',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  banner: {
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 16,
  },
  bannerImage: {
    width: 150,
    height: 150,
    marginRight: 16,
  },
  bannerTextWrapper: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  bannerText: {
    fontFamily: 'Inter-Bold',
    fontSize: responsiveFontSize(1.88),
    color: '#FFFFFF',
    marginBottom: 16,
  },
  projectText: {
    fontFamily: 'Inter-Bold',
    fontSize: responsiveFontSize(2.2),
    color: Colors.black,
  },
  AppText: {
    fontFamily: FontFamily.InterRegular,
    fontSize: responsiveFontSize(1.6),
    color: Colors.black,
    marginRight: 3,
  },

  bannerButtons: {
    flexDirection: 'row',
  },
  bannerButton: {
    backgroundColor: '#FFC727',
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 4,
    marginRight: 8,
  },
  buttonText: {
    fontFamily: 'Inter-Medium',
    fontSize: responsiveFontSize(1.41),
    color: '#000000',
  },
  bttonApplyContainer: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonTextApply: {
    fontFamily: FontFamily.InterBold,
    fontSize: responsiveFontSize(1.6),
    color: Colors.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 8,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 8,
    marginHorizontal: 15,
  },
  inActivetab: {
    fontFamily: FontFamily.InterBlack,
    fontSize: responsiveFontSize(1.8),
    color: '#787878',
  },
  activeTab: {
    fontFamily: FontFamily.InterBold,
    fontSize: responsiveFontSize(1.8),
    textDecorationLine: 'underline',
    textDecorationColor: Colors.primary,
    color: Colors.primary,
  },
  tabDescription: {
    fontFamily: 'Inter-Medium',
    fontSize: responsiveFontSize(1.41),
    color: '#787878',
    marginBottom: 16,
    marginHorizontal: 15,
    lineHeight: 20,
  },
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  postedDate: {
    color: '#263238',
    fontFamily: 'Inter-Medium',
    fontSize: responsiveFontSize(1.64),
    marginBottom: 8,
  },
  projectTitle: {
    color: '#000000',
    fontFamily: 'Inter-SemiBold',
    fontSize: responsiveFontSize(1.88),
    marginBottom: 4,
  },
  projectDetails: {
    color: '#263238',
    fontFamily: 'Inter-Medium',
    fontSize: responsiveFontSize(1.64),
    marginBottom: 8,
  },
  projectDescription: {
    color: '#787878',
    fontFamily: 'Inter-Medium',
    fontSize: responsiveFontSize(1.64),
    lineHeight: 20,
    flexWrap: 'wrap',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#C7C7C7',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontFamily: 'Inter-Medium',
    fontSize: responsiveFontSize(1.64),
    color: '#000000',
  },
  projectFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  projectLocation: {
    color: '#1D1D1D',
    fontFamily: 'Inter-Medium',
    fontSize: responsiveFontSize(1.64),
    width: deviceWidth / 1.8,
    marginLeft: 10,
  },
  projectBudget: {
    color: '#1D1D1D',
    fontFamily: 'Inter-Medium',
    fontSize: responsiveFontSize(1.64),
    marginLeft: wp(3),
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  title: {
    color: '#000000',
    fontSize: responsiveFontSize(1.8),
    fontFamily: 'Inter-SemiBold',
  },
  logOutText: {
    color: '#754595',
    fontSize: responsiveFontSize(2),
    fontFamily: 'Inter-SemiBold',
    marginLeft: 5,
    textDecorationLine: 'underline',
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
  searchBarContainer: {
    marginBottom: 15,
    marginHorizontal: 15,
  },
  markerIcon: {
    height: 20,
    width: 20,
  },
  noDataText: {
    fontSize: responsiveFontSize(2.35),
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    marginTop: hp(5),
    color: '#000000',
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
  conditionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conditionHeaderText: {
    fontFamily: FontFamily.InterSemiBold,
    fontSize: responsiveFontSize(1.8),
    color: Colors.black,
  },
  resetText: {
    fontSize: responsiveFontSize(1.4),
    fontFamily: 'Inter-Regular',
    color: '#754595',
    paddingVertical: 10,
  },
  priceText: {
    fontSize: responsiveFontSize(1.64),
    fontFamily: 'Inter-Medium',
    color: '#1D1D1D',
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#dcdcdc',
    marginVertical: 10,
  },
  priceInputField: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 4,
  },
  priceMainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(1.3),
  },
  locationInputContainer: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: '5%',
    marginTop: '2%',
    borderColor: Colors.borderColor,
  },
  filterMarkerIcon: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
    tintColor: '#000000',
  },
  filterLocationText: {
    color: '#000000',
    fontSize: responsiveFontSize(1.64),
    fontFamily: 'Inter-Medium',
    marginLeft: 5,
  },
  filterLocationChangeText: {
    color: '#754595',
    fontSize: responsiveFontSize(1.64),
    fontFamily: 'Inter-Medium',
    marginLeft: 5,
  },
  locationTextcontainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLocationText: {
    color: '#000000',
    fontSize: responsiveFontSize(1.64),
    fontFamily: 'Inter-Medium',
    marginLeft: 5,
  },
  filterLocationChangeText: {
    color: '#754595',
    fontSize: responsiveFontSize(1.64),
    fontFamily: 'Inter-Medium',
    marginLeft: 5,
  },
  emptyMsg: {
    color: Colors.fontDarkGray,
    fontSize: responsiveFontSize(2),
    paddingVertical: hp(1),
    textAlign: 'center',
    marginTop: deviceHeight / 2,
  },
  emptyMsgpost: {
    color: Colors.fontDarkGray,
    fontSize: responsiveFontSize(2),
    paddingVertical: '10%',
    textAlign: 'center',
  },
  textboldPost: {
    color: Colors.fontDarkGray,
    fontSize: responsiveFontSize(2),
    fontFamily: FontFamily.InterBold,
    marginLeft: 12,
    marginBottom: 20,
  },
  textInputContainer: {
    backgroundColor: '#FAF9F6',
    paddingHorizontal: hp(1),
    borderRadius: 4,
  },
  textInput: {
    color: '#000000',
    paddingVertical: hp(1),
    fontSize: responsiveFontSize(1.88),
    width: '100%',
    backgroundColor: '#FAF9F6',
  },
  listView: {
    width: '100%',
    zIndex: 999,
  },
  row: {
    backgroundColor: 'lightgray',
  },
  listCont: {
    padding: hp(1),
    backgroundColor: Colors.grayBG,
    marginVertical: hp(1),
    marginHorizontal: wp(1),
    borderRadius: 4,
  },
  listText: {
    color: Colors.black,
    fontSize: responsiveFontSize(1.8),
  },
  iconHeartStyle: {
    height: 20,
    width: 20,
  },
  iconContainerSB: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownViewLayout: {
    borderRadius: 10,
    color: Colors.fontGray,
    borderColor: Colors.borderLight,
    borderWidth: 0.5,
    height: 'auto',
  },
  dropdownLang: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
  },
  viewLangContainer: {
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: Colors.primary,
    borderWidth: 0.5,
    paddingHorizontal: 6,
    paddingVertical: 10,
  },
  renderMainView: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  langText: {
    color: Colors.fontDarkGray,
    fontFamily: FontFamily.InterMedium,
    fontSize: 12,
    paddingHorizontal: 10,
  },
  modalTransprentColor: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
    justifyContent: 'center',
    // alignItems: 'center',
  },
  socialProfileText: {
    fontFamily: FontFamily.InterBold,
    color: Colors.white,
    fontSize: 14,
  },
  smallbtn: {
    padding: 5,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    marginVertical: 10,
  },
});
