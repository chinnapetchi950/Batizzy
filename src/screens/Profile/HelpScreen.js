import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  Image,
  TouchableOpacity,
  Pressable,
  ImageBackground,
  ScrollView,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import Colors from '../../helper/Colors';
import FontFamily from '../../helper/FontFamily';
import {icons} from '../../helper/imageConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {deviceHeight, hp, wp} from '../../helper/constants';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import Input from '../../common/Input';
import InputField from '../../common/InputField';
import BottomSheetCondition from '../../common/BottomSheetCondition';
import {showMessage} from 'react-native-flash-message';
import {navigate} from '../../navigation/rootNavigator';
import {routes} from '../../navigation/Routes';
import Loader from '../../common/Loader';
import Icons from '../../common/Icons';
import {BASE_URL} from '../../helper/ApiConstant';

const HelpScreen = () => {
  const {t} = useTranslation(); // Use the translation hook
  const navigation = useNavigation();
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState('');

  const [selectedConditionLabel, setSelectedConditionLabel] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');

  const [marketspaceLabel, setMarketspaceLabel] = useState('');
  const [marketspaceID, setMarketspaceID] = useState('');

  const [typeID, setTypeID] = useState(0);
  const [typeName, setTypeName] = useState('');

  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState('');
  const [isCategory, setIsCategory] = useState(true);
  const [isMarketspace, setIsMarketspace] = useState(false);

  const [token, setToken] = useState();
  const [marketplacesList, setMarketPlacesList] = useState('');

  const categoryList = [
    {
      id: 1,
      type: 'marketplaces',
      name: 'Marketplace',
    },
    {
      id: 2,
      type: 'posts',
      name: 'Social Post',
    },
    {
      id: 3,
      type: 'renovation_posts',
      name: 'Renovation Post',
    },
    {
      id: 4,
      type: 'renovation_post_requests',
      name: 'Renovation Post Request',
    },
  ];

  useEffect(() => {
    gotoSaveToken();
  }, []);

  const gotoSaveToken = async () => {
    var Token = await AsyncStorage.getItem('accessToken');
    setToken(Token);
  };

  const getOptionData = option => {
    setIsLoading(true);
    axios({
      method: 'get',
      url: BASE_URL + option,
      headers: {
        Authorization: 'Bearer' + token,
        Accept: 'application/json',
      },
    })
      .then(function (response) {
        setMarketPlacesList(response.data.data);
        setIsLoading(false);
      })
      .catch(error => {
        setIsLoading(false);
      });
  };

  const gotoOnchangeComment = text => {
    setComment(text);
  };

  const closeCategorySheet = () => {
    setIsCategorySheetOpen(false);
  };

  const gotoSubmitQuestion = () => {
    setIsLoading(true);
    const data = {
      query: comment,
      type: typeName,
      type_id: typeID,
    };
    axios({
      method: 'post',
      url: BASE_URL + 'support',
      headers: {
        Authorization: 'Bearer' + token,
        Accept: 'application/json',
      },
      data: data,
    })
      .then(function (response) {
        setIsLoading(false);
        showMessage({
          message: response.data.message,
          floating: true,
          position: 'top',
          icon: 'success',
          type: 'success',
        });
        setComment('');
        setSelectedConditionLabel('');
        setMarketspaceLabel('');
        setMarketspaceID(0);
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

  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar animated={true} backgroundColor={Colors.white} />
      <View style={[styles.mainPadding]}>
        <View style={[styles.flexRowSB]}>
          <View style={styles.flexRow}>
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
          </View>
          <View>
            <Text style={styles.headerText}>{t('helpScreen.helpCenter')}</Text>
          </View>

          <TouchableOpacity onPress={() => navigate(routes.HelpListScreen)}>
            <Image source={icons.emailOpen} style={styles.emailOpenSize} />
          </TouchableOpacity>
        </View>
        <View style={[styles.helpContainer]}>
          <View style={[styles.help]}>
            <ScrollView scrollEnabled showsVerticalScrollIndicator={false}>
              <Text style={[styles.helpText]}>
                {t('helpScreen.getInTouch')}
              </Text>
              <View>
                <Image
                  source={icons.helpQuestion}
                  style={[styles.helpBigIcon]}
                />
                <Text style={[styles.helpQues]}>
                  {t('helpScreen.issueWithServices')}
                </Text>

                <InputField
                  titleColor={Colors.white}
                  iconColor={Colors.white}
                  placeholderColor={Colors.white}
                  title={t('helpScreen.issueRelatedTo')}
                  placeholder={t('helpScreen.category')}
                  isDropdown
                  editable={false}
                  onPress={() => {
                    setIsCategorySheetOpen(true);
                    setIsCategory(true);
                    setIsMarketspace(false);
                  }}
                  value={selectedConditionLabel}
                />

                {selectedConditionLabel != '' && (
                  <InputField
                    titleColor={Colors.white}
                    iconColor={Colors.white}
                    placeholderColor={Colors.white}
                    title={t('helpScreen.selectOption')}
                    placeholder={t('helpScreen.selectYourOption')}
                    isDropdown
                    editable={false}
                    onPress={() => {
                      setIsCategorySheetOpen(true);
                      setIsCategory(false);
                      setIsMarketspace(true);
                    }}
                    value={marketspaceLabel}
                  />
                )}

                <Input
                  value={comment}
                  inputStyle={[styles.inputText]}
                  placeholderText={t('helpScreen.writeYourComment')}
                  blurOnSubmit={true}
                  autoCapitalize="none"
                  returnKeyType="done"
                  multiline={true}
                  height={100}
                  onChangeText={text => gotoOnchangeComment(text)}
                />

                <TouchableOpacity onPress={() => gotoSubmitQuestion()}>
                  <View style={[styles.button]}>
                    <Text style={[styles.btnText]}>
                      {t('helpScreen.submit')}
                    </Text>
                  </View>
                </TouchableOpacity>
                <Text style={[styles.helpTextSmall]}>
                  {t('helpScreen.getMoreHelp')}
                </Text>
                <Text style={[styles.helpTextbold]}>
                  {t('helpScreen.connectWithUs')}
                </Text>
                <Text style={[styles.helpTextSemiBold]}>
                  {t('helpScreen.contactPhone')}
                </Text>
                <Text style={[styles.helpTextSemiBold]}>
                  {t('helpScreen.contactEmail')}
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </View>

      {isCategorySheetOpen && (
        <BottomSheetCondition
          maxHeight={deviceHeight / 4}
          isOpen={isCategorySheetOpen}
          onClose={() => closeCategorySheet()}
          renderContent={() => {
            return (
              <>
                {isCategory && (
                  <View>
                    <Text style={styles.sheetTitle}>
                      {t('helpScreen.selectYourIssue')}
                    </Text>
                    {categoryList.map((item, index) => (
                      <View key={index} style={styles.row}>
                        <Text style={styles.scopeSubText}>{item.name}</Text>
                        <Pressable
                          style={styles.radioButton}
                          onPress={() => {
                            setSelectedCondition(item.type);
                            setSelectedConditionLabel(item.name);
                            closeCategorySheet();
                            getOptionData(item.type);
                            setIsCategory(false);
                            setIsMarketspace(true);
                            setTypeID(item.id);
                            setTypeName(
                              item.type === 'marketplaces'
                                ? 'marketplace'
                                : item.type === 'posts'
                                ? 'post'
                                : item.type === 'renovation_posts'
                                ? 'renovation_post'
                                : item.type === 'renovation_post_requests'
                                ? 'renovation_post_request'
                                : item.type,
                            );
                          }}>
                          <Icons
                            iconSetName={'MaterialCommunityIcons'}
                            iconName={
                              selectedCondition === item.type
                                ? 'checkbox-marked-circle'
                                : 'checkbox-blank-circle-outline'
                            }
                            iconColor={Colors.primary}
                            iconSize={20}
                          />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}
                {isMarketspace && (
                  <ScrollView style={{flex: 1}}>
                    <View>
                      <Text style={styles.sheetTitle}>
                        {t('helpScreen.selectYourOption')}
                      </Text>
                      {marketplacesList?.map((item, index) => (
                        <View key={index} style={[styles.row, {flex: 1}]}>
                          <Text style={styles.scopeSubText}>
                            {typeID == 1
                              ? item.title
                              : typeID == 2
                              ? item.content
                              : typeID == 3
                              ? item.renovation_post?.title
                              : item?.renovation_post?.title}
                          </Text>
                          <TouchableOpacity
                            style={styles.radioButton}
                            onPress={() => {
                              setMarketspaceLabel(
                                typeID == 1
                                  ? item.title
                                  : typeID == 2
                                  ? item.content
                                  : typeID == 3
                                  ? item.title
                                  : item?.renovation_post?.title,
                              );
                              setMarketspaceID(item.id);
                              setIsMarketspace(false);
                              closeCategorySheet();
                            }}>
                            <Icons
                              iconSetName={'MaterialCommunityIcons'}
                              iconName={
                                marketspaceID === item.id
                                  ? 'checkbox-marked-circle'
                                  : 'checkbox-blank-circle-outline'
                              }
                              iconColor={Colors.primary}
                              iconSize={20}
                            />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                )}
              </>
            );
          }}
        />
      )}

      {isLoading && <Loader />}
    </SafeAreaProvider>
  );
};

export default HelpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  mainPadding: {
    padding: '4%',
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
  backButtonIcon: {
    height: hp(1.37),
    width: wp(4),
    alignSelf: 'center',
    marginBottom: hp(0.5),
  },
  emailOpenSize: {
    height: 20,
    width: 20,
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
  helpContainer: {
    margin: '6%',
  },
  help: {
    backgroundColor: Colors.primary,
    padding: '6%',
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    height: deviceHeight / 1.35,
    elevation: 3,
  },
  helpText: {
    fontSize: responsiveFontSize(1.8),
    color: Colors.white,
    textAlign: 'center',
    paddingTop: '4%',
    fontFamily: FontFamily.InterMedium,
  },
  helpBigIcon: {
    height: 80,
    width: 80,
    alignSelf: 'center',
  },
  helpQues: {
    fontSize: responsiveFontSize(1.6),
    color: Colors.white,
    textAlign: 'center',
    fontFamily: FontFamily.InterLight,
  },
  inputText: {
    borderWidth: 0,
  },
  button: {
    padding: '4%',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.white,
    borderRadius: 30,
    marginTop: '10%',
    alignItems: 'center',
  },
  btnText: {
    color: Colors.white,
    fontSize: responsiveFontSize(1.8),
    fontFamily: FontFamily.InterLight,
  },
  helpTextSmall: {
    fontSize: responsiveFontSize(2),
    color: Colors.white,
    textAlign: 'center',
    marginTop: '10%',
    fontFamily: FontFamily.InterLight,
  },
  helpTextbold: {
    fontSize: responsiveFontSize(2),
    color: Colors.white,
    textAlign: 'center',
    marginTop: '10%',
    fontFamily: FontFamily.InterBold,
  },
  helpTextSemiBold: {
    fontSize: responsiveFontSize(1.8),
    color: Colors.white,
    textAlign: 'center',
    marginTop: '10%',
    fontFamily: FontFamily.InterSemiBold,
  },
  sheetTitle: {
    fontSize: responsiveFontSize(1.8),
    color: Colors.black,
    fontFamily: FontFamily.InterSemiBold,
  },
  conditionText: {
    fontSize: responsiveFontSize(1.64),
    color: Colors.black,
    fontFamily: FontFamily.InterSemiBold,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: hp(0.8),
  },
  conditionText: {
    fontSize: responsiveFontSize(1.64),
    fontFamily: 'Inter-Medium',
    color: '#1D1D1D',
  },
  scopeSubText: {
    fontSize: responsiveFontSize(1.64),
    fontFamily: 'Inter-Medium',
    color: '#6B6B6B',
  },
  radioButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioIcon: {
    height: 20,
    width: 20,
  },
  radioButtonSelected: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  modalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderContainer: {
    height: hp(8),
    width: hp(8),
    backgroundColor: Colors.white,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
