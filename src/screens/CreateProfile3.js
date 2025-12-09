import React, {useEffect, useRef, useState} from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  PermissionsAndroid,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {icons} from '../helper/imageConstants';
import {deviceHeight, deviceWidth, fontSize, hp, wp} from '../helper/constants';
import {useNavigation, useRoute} from '@react-navigation/native';
import SignUpButton from '../common/SignUpButton';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Geocoder from 'react-native-geocoding';
import Geolocation from '@react-native-community/geolocation';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import moment from 'moment';
import {routes} from '../navigation/Routes';
import {showMessage} from 'react-native-flash-message';
import MapView, {Marker} from 'react-native-maps';
import Icons from '../common/Icons';
import Colors from '../helper/Colors';
import FontFamily from '../helper/FontFamily';

const CreateProfile3 = () => {
  const {t} = useTranslation();

  const navigation = useNavigation();
  const route = useRoute();

  const FirstName = route.params?.FirstName;
  const LastName = route.params?.LastName;
  const PhoneNumber = route.params?.PhoneNumber;
  const Email = route.params?.Email;
  const Password = route.params?.Password;
  const VATNumber = route.params?.VATNumber;
  const CountryCode = route.params?.CountryCode;
  const selectedSkills = route.params?.selectedSkills;
  const Experience = route.params?.Experience;
  const CompanySize = route.params?.CompanySize;

  const [isCurrentAddress, setCurrentAddress] = useState('');
  const [isCurrentLocation, setCurrentLocation] = useState('');

  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);

  const [isSelectedStartDate, setSelectedStartDate] = useState(
    moment().format('HH:mm'),
  );
  const [isSelectedEndDate, setSelectedEndDate] = useState(
    moment().format('HH:mm'),
  );

  const showStartDatePicker = () => setStartDatePickerVisible(true);
  const hideStartDatePicker = () => setStartDatePickerVisible(false);
  const showEndDatePicker = () => setEndDatePickerVisible(true);
  const hideEndDatePicker = () => setEndDatePickerVisible(false);

  const handleConfirmStartDate = date => {
    const formattedDate = moment(date).format('HH:mm');
    setSelectedStartDate(formattedDate);
    hideStartDatePicker();
  };

  const handleConfirmEndDate = date => {
    const formattedDate = moment(date).format('HH:mm');
    setSelectedEndDate(formattedDate);
    hideEndDatePicker();
  };

  const days = [
    {label: 'S', index: 1},
    {label: 'M', index: 2},
    {label: 'T', index: 3},
    {label: 'W', index: 4},
    {label: 'T', index: 5},
    {label: 'F', index: 6},
    {label: 'S', index: 7},
  ];

  const [selectedIndexes, setSelectedIndexes] = useState('');
  const [is24Hours, setIs24Hours] = useState(true);

  const toggleDay = index => {
    setSelectedIndexes(prevIndexes => {
      const indexesArray = prevIndexes
        ? prevIndexes.split(',').map(Number)
        : [];

      if (indexesArray.includes(index)) {
        const updatedArray = indexesArray.filter(i => i !== index);
        return updatedArray.join(',');
      } else {
        indexesArray.push(index);
        return indexesArray.join(',');
      }
    });
  };
  useEffect(() => {
    Geocoder.init('AIzaSyCceRTsiY-2UPVwytF6wytwaGmonWjvTHo');
  }, []);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const fineLocationGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: t('createProfile3.permissions.locationTitle'),
            message: t('createProfile3.permissions.locationMessage'),
            buttonNeutral: t('createProfile3.permissions.askMeLater'),
            buttonNegative: t('createProfile3.permissions.cancel'),
            buttonPositive: t('createProfile3.permissions.ok'),
          },
        );

        if (fineLocationGranted !== PermissionsAndroid.RESULTS.GRANTED) {
          return;
        }
        const backgroundLocationGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
          {
            title: t('createProfile3.permissions.backgroundLocationTitle'),
            message: t('createProfile3.permissions.backgroundLocationMessage'),
            buttonNeutral: t('createProfile3.permissions.askMeLater'),
            buttonNegative: t('createProfile3.permissions.cancel'),
            buttonPositive: t('createProfile3.permissions.ok'),
          },
        );

        if (backgroundLocationGranted === PermissionsAndroid.RESULTS.GRANTED) {
          fetchCurrentLocation();
        }
      } else if (Platform.OS === 'ios') {
        const authStatus = await Geolocation.requestAuthorization('whenInUse');
        if (authStatus !== 'granted') {
          return;
        }
      }
    } catch (error) {
      console.error(t('createProfile3.errors.locationPermission'), error);
    }
  };

  const fetchCurrentLocation = async () => {
    Geolocation.getCurrentPosition(
      async position => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        const json = await Geocoder.from({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        const address = json.results[0].formatted_address;
        setCurrentAddress(address);
      },
      error => {
        console.error(error);
        setCurrentAddress(t('createProfile3.errors.locationNotFound'));
      },
      {enableHighAccuracy: false, timeout: 20000, maximumAge: 1000},
    );
  };

  const validateForm = () => {
    if (!selectedIndexes) {
      showMessage({
        message: t('createProfile3.validation.selectWorkingDay'),
        type: 'warning',
      });
      return false;
    }

    if (!is24Hours && (!isSelectedStartDate || !isSelectedEndDate)) {
      showMessage({
        message: t('createProfile3.validation.selectWorkingHours'),
        type: 'warning',
      });
      return false;
    }

    if (!is24Hours && (isSelectedStartDate || isSelectedEndDate)) {
      if (isSelectedStartDate >= isSelectedEndDate) {
        showMessage({
          message: t('createProfile3.validation.startTimeEarlier'),
          type: 'warning',
        });
        return false;
      }
    }

    if (
      isCurrentAddress === t('createProfile3.fetchingLocation') ||
      !isCurrentAddress
    ) {
      showMessage({
        message: t('createProfile3.validation.unableToFetchLocation'),
        type: 'warning',
      });
      return false;
    }

    return true;
  };

  const handleContinue = () => {
    if (validateForm()) {
      navigation.navigate(routes.CreateProfile4, {
        selectedSkills: selectedSkills,
        Experience: Experience,
        CompanySize: CompanySize,
        FirstName: FirstName,
        LastName: LastName,
        PhoneNumber: PhoneNumber,
        Email: Email,
        Password: Password,
        VATNumber: VATNumber,
        CountryCode: CountryCode,
        StartTime: isSelectedStartDate,
        EndTime: isSelectedEndDate,
        WorkingDays: selectedIndexes,
        Hour24: is24Hours,
        CurrentAddress: isCurrentAddress,
        CurrentLocation: isCurrentLocation,
      });
    }
  };

  const gotoFindLetLong = async (data, details) => {
    setCurrentAddress(data.description);
    setCurrentLocation({
      latitude: details?.geometry?.location?.lat,
      longitude: details?.geometry?.location?.lng,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.safeAreaView}
      behavior={Platform.OS === 'ios' ? 'padding' : 1000}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : hp(2)}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollView}>
        <ImageBackground
          source={icons.ProfileBG}
          style={styles.imageBackground}>
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
          <Text style={styles.stepText}>
            {t('createProfile3.step3').toUpperCase()}
          </Text>
          <Text style={styles.createProfileText}>
            {t('createProfile3.setAvailabilityAndLocation').toUpperCase()}
          </Text>
        </ImageBackground>

        <View style={styles.container}>
          <Text style={styles.titleLabel}>
            {t('createProfile3.workingDays')}
          </Text>
          <View style={styles.daysContainer}>
            {days.map(day => (
              <TouchableOpacity
                key={day.index}
                style={[
                  styles.dayButton,
                  selectedIndexes.includes(day.index) && styles.selectedDay,
                ]}
                onPress={() => toggleDay(day.index)}>
                <Text
                  style={[
                    styles.dayText,
                    selectedIndexes.includes(day.index) &&
                      styles.selectedDayText,
                  ]}>
                  {day.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.hoursContainer}>
            <Text style={styles.titleLabel}>
              {t('createProfile3.workingHours')}
            </Text>
            <TouchableOpacity
              style={styles.hoursButton}
              onPress={() => {
                setIs24Hours(!is24Hours);
                setSelectedStartDate('');
                setSelectedEndDate('');
              }}>
              <Image
                tintColor={'#754595'}
                source={is24Hours ? icons.check : icons.unCheck}
                style={{height: 20, width: 20}}
              />
              <Text style={styles.hoursButtonText}>
                {t('createProfile3.24Hrs')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timeContainer}>
            <TouchableOpacity
              disabled={is24Hours}
              style={styles.timeButton}
              onPress={() => {
                showStartDatePicker();
              }}>
              <Text style={styles.timeButtonText}>
                {isSelectedStartDate
                  ? isSelectedStartDate
                  : t('createProfile3.startTime')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={is24Hours}
              style={styles.timeButton}
              onPress={() => {
                showEndDatePicker();
              }}>
              <Text style={styles.timeButtonText}>
                {isSelectedEndDate
                  ? isSelectedEndDate
                  : t('createProfile3.endTime')}
              </Text>
            </TouchableOpacity>
          </View>
          <DateTimePickerModal
            isVisible={isStartDatePickerVisible}
            mode="time"
            onConfirm={date => {
              handleConfirmStartDate(date);
            }}
            onCancel={() => {
              hideStartDatePicker();
            }}
          />
          <DateTimePickerModal
            isVisible={isEndDatePickerVisible}
            mode="time"
            onConfirm={date => {
              handleConfirmEndDate(date);
            }}
            onCancel={() => {
              hideEndDatePicker();
            }}
          />

          <Text style={styles.titleLabel}>
            {t('createProfile3.preferredLocation')}
          </Text>
          <View
            style={{
              justifyContent: 'space-between',
              alignItems: 'center',
              flexDirection: 'row',
            }}>
            <View style={styles.locationInputContainer}>
              <View style={styles.locationTextcontainer}>
                <Image
                  source={icons.markerIcon}
                  style={styles.filterMarkerIcon}
                />
                <GooglePlacesAutocomplete
                  placeholder={
                    isCurrentAddress
                      ? isCurrentAddress
                      : t('createProfile3.fetchingLocation')
                  }
                  textInputProps={{
                    placeholderTextColor: Colors.lightPlaceholder,
                  }}
                  onPress={(data, details) => gotoFindLetLong(data, details)}
                  query={{
                    key: 'AIzaSyCceRTsiY-2UPVwytF6wytwaGmonWjvTHo',
                    language: 'en',
                  }}
                  numberOfLines={1}
                  fetchDetails
                  styles={{
                    textInput: {
                      color: Colors.fontDarkGray,
                      fontFamily: FontFamily.InterMedium,
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
          </View>
          <Text
            style={{
              width: '80%',
              fontFamily: 'Inter-SemiBold',
              color: '#000',
              fontSize: fontSize(10),
            }}>
            {isCurrentAddress}
          </Text>
        </View>
        <View style={styles.signUpButtonContainer}>
          <SignUpButton
            title={t('createProfile3.continue').toUpperCase()}
            onPress={handleContinue}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateProfile3;

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    paddingBottom: hp(10),
  },
  imageBackground: {
    height: hp(25),
    width: '100%',
    paddingBottom: hp(5),
    resizeMode: 'contain',
  },
  stepText: {
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    fontSize: fontSize(13),
    marginTop: hp(3),
    marginLeft: wp(6),
  },
  createProfileText: {
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    fontSize: fontSize(13),
    marginTop: hp(1.14),
    marginLeft: wp(6),
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: responsiveFontSize(1.88),
    color: '#000000',
    marginBottom: 8,
  },
  input: {
    elevation: 6,
    shadowColor: 'black',
    shadowOffset: {width: -1, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 16,
    paddingHorizontal: 15,
  },
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dayButton: {
    width: 40,
    height: 50,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: 'black',
    shadowOffset: {width: -1, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 0,
    backgroundColor: '#FFFFFF',
  },
  selectedDay: {
    backgroundColor: '#ffd700',
  },
  dayText: {
    color: '#000000',
    fontFamily: 'Inter-Bold',
    fontSize: responsiveFontSize(2),
  },
  selectedDayText: {
    color: '#000000',
    fontFamily: 'Inter-Bold',
    fontSize: responsiveFontSize(2),
  },
  hoursContainer: {
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hoursButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  hoursButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: responsiveFontSize(1.88),
    marginLeft: 10,
    color: '#787878',
  },
  checkmark: {
    fontSize: 18,
    color: '#4CAF50',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timeButton: {
    padding: 12,
    width: '48%',
    elevation: 6,
    shadowColor: 'black',
    shadowOffset: {width: -1, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 0,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  timeButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: responsiveFontSize(1.88),
    textAlign: 'center',
    color: '#787878',
  },
  locationContainer: {
    marginBottom: 20,
  },
  locationButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: '#8a2be2',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signUpButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 15,
    paddingBottom: hp(2),
    backgroundColor: 'white',
  },
  locationButtonText: {
    fontSize: 16,
    textAlign: 'center',
  },
  titleLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: responsiveFontSize(1.88),
    color: '#000000',
    marginBottom: hp(1),
  },
  locationInput: {
    borderRadius: 30,
    color: '#AAAAAA',
    fontFamily: 'Inter-Medium',
    fontSize: responsiveFontSize(1.88),
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(4),
    elevation: 6,
    shadowColor: 'black',
    shadowOffset: {width: -1, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 0,
    backgroundColor: '#FFFFFF',
    marginTop: hp(1),
    width: '80%',
  },
  locationBG: {
    height: 60,
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
  },
  backButton: {
    marginHorizontal: 15,
    marginTop: 20,
  },
  backButtonBackground: {
    height: hp(4.8),
    width: hp(4.8),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
  },
  backButtonIcon: {
    height: hp(1.37),
    width: wp(4),
    alignSelf: 'center',
    marginBottom: hp(0.5),
  },
  locationInputContainer: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.borderColor,
  },
  filterMarkerIcon: {
    height: hp(3),
    width: hp(3),
    resizeMode: 'contain',
    tintColor: '#000000',
  },
  locationTextcontainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
