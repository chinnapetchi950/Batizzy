import React, {useCallback, useState} from 'react';
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
  Image,
  Pressable,
  ScrollView,
  TextInput,
  FlatList,
} from 'react-native';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import moment from 'moment';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import CheckBox from '@react-native-community/checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {showMessage} from 'react-native-flash-message';
import axios from 'axios';
import {useTranslation} from 'react-i18next';
import Loader from '../common/Loader';
import {BASE_URL} from '../helper/ApiConstant';
import SignUpButton from '../common/SignUpButton';
import {routes} from '../navigation/Routes';
import {hp, wp} from '../helper/constants';
import {icons} from '../helper/imageConstants';

const NewProposal = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const ItemID = route.params?.ItemID;
  const {t} = useTranslation();

  const [isServiceTypeData, setIsServiceTypeData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isIsInformation, setIsInformation] = useState('');
  const [isPrice, setIsPrice] = useState('');
  const [isNote, setIsNote] = useState('');
  const [userData, setUserData] = useState([]);
  const [code, setCode] = useState();

  useFocusEffect(
    useCallback(() => {
      const onScreenFocus = async () => {
        await getUserData();
        await getLanguageCode();
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

  useFocusEffect(
    useCallback(() => {
      const onScreenFocus = async () => {
        await GetServiceTypes();
      };
      onScreenFocus();
    }, [GetServiceTypes]),
  );

  const GetServiceTypes = useCallback(async () => {
    const Token = await AsyncStorage.getItem('accessToken');
    const response = await fetch(`${BASE_URL}renovation_types`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${Token}`,
        Accept: 'application/json',
      },
    });
    const res = await response.json();
    if (res.status === true) {
      setIsServiceTypeData(res.data);
    }
  }, []);

  const getLanguageCode = async () => {
    var LanguageCode = JSON.parse(await AsyncStorage.getItem('Language'));
    setCode(LanguageCode);
  };

  const SendProposal = async () => {
    const Token = await AsyncStorage.getItem('accessToken');
    var formData = new FormData();
    formData.append('general_information', isIsInformation);
    formData.append(
      'start_date',
      moment(isSelectedStartDate, 'DD/MM/YYYY').format('YYYY-MM-DD'),
    );
    formData.append('price', isPrice);
    formData.append(
      'completion_date',
      moment(isSelectedAppoinmentDate, 'DD/MM/YYYY').format('YYYY-MM-DD'),
    );
    formData.append('note', isNote);

    selectedItems.forEach((item, index) => {
      formData.append(`renovation_type_ids[${index}]`, item);
    });

    await fetch(BASE_URL + 'renovation_post_requests/' + ItemID, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Token}`,
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    })
      .then(res => res.json())
      .then(res => {
        if (res.status == true) {
          showMessage({
            message: res.message,
            floating: true,
            position: 'top',
            icon: 'success',
            type: 'success',
          });
          navigation.navigate(routes.SubmitProposalSuccess);
        } else {
          handleApiError(res);
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  const handleApiError = response => {
    const {message, error_details} = response;
    showMessage({
      message: message || t('newproposal.genericErrorMessage'),
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

  const onPressSendproposal = () => {
    if (isIsInformation === '') {
      showMessage({
        message: t('newproposal.enterGeneralInformation'),
        type: 'warning',
      });
    } else if (selectedItems.length === 0) {
      showMessage({
        message: t('newproposal.selectServiceType'),
        type: 'warning',
      });
    } else if (isSelectedStartDate === '') {
      showMessage({
        message: t('newproposal.selectStartDate'),
        type: 'warning',
      });
    } else if (isPrice === '') {
      showMessage({
        message: t('newproposal.enterPrice'),
        type: 'warning',
      });
    } else if (isSelectedAppoinmentDate === '') {
      showMessage({
        message: t('newproposal.selectAppointmentDate'),
        type: 'warning',
      });
    } else if (isNote === '') {
      showMessage({
        message: t('newproposal.enterNote'),
        type: 'warning',
      });
    } else {
      SendProposal();
    }
  };

  const [isSelectedStartDate, setSelectedStartDate] = useState(
    moment().format('DD/MM/YYYY'),
  );
  const [isSelectedAppoinmentDate, setSelectedAppoinmentDate] = useState(
    moment().format('DD/MM/YYYY'),
  );

  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [isAppoinmentDatePickerVisible, setAppoinmentDatePickerVisible] =
    useState(false);

  const showStartDatePicker = () => setStartDatePickerVisible(true);
  const hideStartDatePicker = () => setStartDatePickerVisible(false);
  const showAppoinmentDatePicker = () => setAppoinmentDatePickerVisible(true);
  const hideAppoinmentDatePicker = () => setAppoinmentDatePickerVisible(false);

  const handleConfirmStartDate = date => {
    const formattedDate = moment(date).format('DD/MM/YYYY');
    setSelectedStartDate(formattedDate);
    hideStartDatePicker();
  };
  const handleConfirmAppoinmentDate = date => {
    const formattedDate = moment(date).format('DD/MM/YYYY');
    setSelectedAppoinmentDate(formattedDate);
    hideAppoinmentDatePicker();
  };

  const [selectedItems, setSelectedItems] = useState([]);

  const handleCheckboxChange = (item, isChecked) => {
    if (isChecked) {
      setSelectedItems([...selectedItems, item.id]); // Add item to the selected list
    } else {
      setSelectedItems(selectedItems.filter(item => item !== item.id)); // Remove item from selected list
    }
  };

  const renderItem = ({item}) => (
    <View style={styles.itemContainer}>
      <CheckBox
        value={selectedItems.includes(item.id)}
        onValueChange={newValue => handleCheckboxChange(item, newValue)}
        tintColors={{true: '#754595', false: '#263238'}}
      />
      <Text style={styles.itemText}>{item.name}</Text>
    </View>
  );

  return (
    <View style={styles.wrapper}>
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
          <Text style={styles.title}>{t('newproposal.newProposal')}</Text>
        </Pressable>
        <View style={styles.IconsContainer}>
          <Pressable
            onPress={() => navigation.navigate(routes.NotificationListScreen)}>
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
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image source={icons.dummyUser} style={styles.profileImage} />
          <View style={styles.headerText}>
            <Text style={styles.name}>{userData?.firstname}</Text>
            <View style={styles.listingInfo}>
              <Text style={styles.listingText}>
                {t('newproposal.submitApplyStartProject')}
              </Text>
              <Image source={icons.tab5} style={styles.listIcon} />
            </View>
          </View>
        </View>
        <View style={{marginHorizontal: 15}}>
          <Text style={styles.generalText}>
            {t('newproposal.generalInformation')}
          </Text>
          <TextInput
            placeholder={t('newproposal.saySomething')}
            placeholderTextColor="#393939"
            style={styles.photoInput}
            multiline
            textAlignVertical="top"
            value={isIsInformation}
            onChangeText={text => {
              setIsInformation(text);
            }}
          />
          <Text style={styles.generalText}>
            {t('newproposal.servicesYouProvide')}
          </Text>
          <FlatList
            data={isServiceTypeData}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
          />
          <Text style={styles.generalText}>
            {t('newproposal.estimatedStartingDate')}
          </Text>
          <Pressable
            style={styles.timeButton}
            onPress={() => {
              showStartDatePicker();
            }}>
            <Text style={styles.timeButtonText}>
              {isSelectedStartDate
                ? isSelectedStartDate
                : t('newproposal.date')}
            </Text>
          </Pressable>
          <DateTimePickerModal
            isVisible={isStartDatePickerVisible}
            mode="date"
            onConfirm={date => {
              handleConfirmStartDate(date);
            }}
            onCancel={() => {
              hideStartDatePicker();
            }}
          />
          <Text style={styles.generalText}>
            {t('newproposal.estimatedPrice')}
          </Text>
          <TextInput
            placeholder={t('newproposal.price')}
            placeholderTextColor="#787878"
            style={styles.Input}
            value={isPrice}
            onChangeText={text => {
              setIsPrice(text);
            }}
            keyboardType="decimal-pad"
          />
          <Text style={styles.generalText}>
            {t('newproposal.selectAppointmentDateForQuote')}
          </Text>
          <Pressable
            style={styles.timeButton}
            onPress={() => {
              showAppoinmentDatePicker();
            }}>
            <Text style={styles.timeButtonText}>
              {isSelectedAppoinmentDate
                ? isSelectedAppoinmentDate
                : t('newproposal.date')}
            </Text>
          </Pressable>
          <DateTimePickerModal
            isVisible={isAppoinmentDatePickerVisible}
            mode="date"
            onConfirm={date => {
              handleConfirmAppoinmentDate(date);
            }}
            onCancel={() => {
              hideAppoinmentDatePicker();
            }}
          />
          <Text style={styles.generalText}>{t('newproposal.note')}</Text>
          <TextInput
            placeholder={t('newproposal.note')}
            placeholderTextColor="#393939"
            style={styles.photoInput}
            multiline
            textAlignVertical="top"
            value={isNote}
            onChangeText={text => {
              setIsNote(text);
            }}
          />
          <Text style={styles.termsText}>
            {t('newproposal.additionalTerms')}
          </Text>
          <Text style={styles.bulletPoint}>
            {'\u2022'} {t('newproposal.termsChangeWork')}
          </Text>
          <Text style={styles.bulletPoint}>
            {'\u2022'} {t('newproposal.termsProvideAccess')}
          </Text>
          <Text style={styles.bulletPoint}>
            {'\u2022'} {t('newproposal.termsUnforeseenIssues')}
          </Text>
        </View>
      </ScrollView>
      <View style={{marginHorizontal: 15, paddingBottom: 20}}>
        <SignUpButton
          title={t('newproposal.submitProposal')}
          onPress={() => {
            onPressSendproposal();
          }}
        />
      </View>
      {isLoading && <Loader />}
    </View>
  );
};

export default NewProposal;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 15,
    marginTop: 15,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1.4),
    marginHorizontal: 15,
    marginTop: 24,
  },
  profileImage: {
    width: hp(4),
    height: hp(4),
    borderRadius: 25,
    marginRight: 12,
  },
  listIcon: {
    width: hp(2.5),
    height: hp(2.5),
    resizeMode: 'contain',
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: responsiveFontSize(2.35),
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
  listingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listingText: {
    fontSize: responsiveFontSize(1.41),
    fontFamily: 'Inter-Regular',
    color: '#393939',
    marginRight: 4,
  },
  generalText: {
    fontSize: responsiveFontSize(1.64),
    fontFamily: 'Inter-Medium',
    color: '#4A4A4A',
    marginTop: 12,
  },
  photoInput: {
    flex: 1,
    height: 100,
    color: '#6C6C6C',
    paddingHorizontal: wp(4),
    textAlignVertical: 'top',
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#00000036',
  },
  timeButton: {
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#00000036',
    paddingVertical: 14,
    marginTop: 16,
  },
  timeButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: responsiveFontSize(1.64),
    color: '#787878',
  },
  Input: {
    flex: 1,
    fontFamily: 'Inter-Medium',
    fontSize: responsiveFontSize(1.64),
    color: '#787878',
    paddingHorizontal: wp(4),
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#00000036',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    fontFamily: 'Inter-Medium',
    fontSize: responsiveFontSize(1.64),
    color: '#000000',
    marginLeft: 10,
  },
  termsText: {
    fontFamily: 'Inter-Medium',
    fontSize: responsiveFontSize(1.64),
    color: '#000000',
    marginTop: 10,
    marginBottom: 5,
  },
  bulletPoint: {
    fontFamily: 'Inter-Regular',
    fontSize: responsiveFontSize(1.64),
    marginBottom: 10,
    color: '#000000',
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
});
