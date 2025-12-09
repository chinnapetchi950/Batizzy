import React, {useEffect, useRef} from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {icons} from '../helper/imageConstants';
import {fontSize, hp, wp} from '../helper/constants';
import {useNavigation, useRoute} from '@react-navigation/native';
import {routes} from '../navigation/Routes';
import {useState} from 'react';
import SignUpButton from '../common/SignUpButton';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import {BASE_URL} from '../helper/ApiConstant';
import {showMessage} from 'react-native-flash-message';
import Colors from '../helper/Colors';
import FontFamily from '../helper/FontFamily';

const CreateProfile1 = () => {
  const navigation = useNavigation();
  const searchRef = useRef();
  const {t} = useTranslation();

  const [isFirstName, setIsFirstName] = useState('');
  const [isLastName, setIsLastName] = useState('');
  const [isPhoneNumber, setIsPhoneNumber] = useState('');
  const [isEmail, setIsEmail] = useState('');
  const [isPassword, setIsPassword] = useState('');
  const [isVATNumber, setIsVATNumber] = useState('');
  const [clicked, setClicked] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('91');
  const [search, setSearch] = useState('');
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [allCountries, setAllCountries] = useState([]);

  useEffect(() => {
    getCountryCodeData();
  }, []);

  const getCountryCodeData = async () => {
    await fetch(BASE_URL + 'countries', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
      .then(res => res.json())
      .then(res => {
        if (res.status === true) {
          setAllCountries(res.data);
          setFilteredCountries(res.data);
        }
      })
      .catch(error => {
        console.error('Print error', error);
      });
  };

  const onSearch = search => {
    if (search !== '') {
      let tempData = allCountries.filter(item => {
        return item.name.toLowerCase().indexOf(search.toLowerCase()) > -1;
      });
      setFilteredCountries(tempData);
    } else {
      setFilteredCountries(allCountries);
    }
  };

  const onPressContinueBtn = () => {
    if (isFirstName === '') {
      showMessage({
        message: t('messages.enterFirstName'),
        type: 'warning',
      });
    } else if (isLastName === '') {
      showMessage({
        message: t('messages.enterLastName'),
        type: 'warning',
      });
    } else if (!isPhoneNumber.match(/^[0-9]{10}$/)) {
      showMessage({
        message: t('messages.enterValidPhone'),
        type: 'warning',
      });
    } else if (!isEmail.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i)) {
      showMessage({
        message: t('messages.enterValidEmail'),
        type: 'warning',
      });
    } else if (isPassword === '') {
      showMessage({
        message: t('messages.enterPassword'),
        type: 'warning',
      });
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
        isPassword,
      )
    ) {
      showMessage({
        message: t('messages.passwordCriteria'),
        type: 'warning',
      });
    } else if (isVATNumber === '') {
      showMessage({
        message: t('messages.enterVATNumber'),
        type: 'warning',
      });
    } else {
      navigation.navigate(routes.CreateProfile2, {
        FirstName: isFirstName,
        LastName: isLastName,
        PhoneNumber: isPhoneNumber,
        Email: isEmail,
        Password: isPassword,
        VATNumber: isVATNumber,
        CountryCode: selectedCountry,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.safeAreaView}
      behavior={Platform.OS === 'ios' ? 'padding' : 1000}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : hp(2)}>
      <StatusBar backgroundColor={Colors.primary} barStyle={'light-content'} />
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollView}>
        <ImageBackground
          source={icons.ProfileBG}
          style={styles.imageBackground}>
          <Text style={styles.stepText}>{'Step 1'.toUpperCase()}</Text>
          <Text style={styles.createProfileText}>
            {t('createProfile.title')}
          </Text>
        </ImageBackground>

        <View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={{flex: 1}}>
              <Text style={styles.label}>{t('labels.firstName')}</Text>
              <TextInput
                value={isFirstName}
                placeholder={t('placeholders.firstName')}
                placeholderTextColor={Colors.lightPlaceholder}
                style={styles.input}
                onChangeText={text => {
                  const cleanedText = text.replace(/[^a-zA-Z ]/g, '');
                  setIsFirstName(cleanedText);
                }}
              />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.label}>{t('labels.lastName')}</Text>
              <TextInput
                value={isLastName}
                placeholder={t('placeholders.lastName')}
                placeholderTextColor={Colors.lightPlaceholder}
                style={styles.input}
                onChangeText={text => {
                  const cleanedText = text.replace(/[^a-zA-Z ]/g, '');
                  setIsLastName(cleanedText);
                }}
              />
            </View>
          </View>
          <Text style={styles.label}>{t('labels.phoneNumber')}</Text>
          <View style={styles.phoneInputContainer}>
            <Pressable
              style={styles.countryCodeButton}
              onPress={() => {
                setClicked(!clicked);
              }}>
              <Text style={styles.countryCodeText}>
                {selectedCountry === '' ? '+91' : '+' + selectedCountry}
              </Text>
              <Image source={icons.downArrow} style={styles.downArrowIcon} />
            </Pressable>
            <TextInput
              keyboardType="numeric"
              placeholder={t('placeholders.phoneNumber')}
              placeholderTextColor={Colors.lightPlaceholder}
              style={styles.phoneNumberInput}
              onChangeText={text => {
                setIsPhoneNumber(text);
              }}
            />
          </View>
          {clicked && (
            <View style={styles.countryListContainer}>
              <TextInput
                placeholder={t('placeholders.search')}
                placeholderTextColor={Colors.lightPlaceholder}
                value={search}
                ref={searchRef}
                onChangeText={txt => {
                  onSearch(txt);
                  setSearch(txt);
                }}
                style={styles.searchInput}
              />
              <FlatList
                nestedScrollEnabled={true}
                data={filteredCountries}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => (
                  <Pressable
                    style={styles.countryItem}
                    onPress={() => {
                      setSelectedCountry(item.phone_code);
                      setClicked(false);
                      setSearch('');
                      setFilteredCountries(allCountries);
                    }}>
                    <View style={styles.countryItemLeft}>
                      <Image
                        resizeMode="contain"
                        source={{uri: item.flag}}
                        style={styles.countryFlag}
                      />
                      <Text style={styles.countryName}>{item.name}</Text>
                    </View>
                    <View style={styles.countryItemRight}>
                      <Text style={styles.countryCodePrefix}>+</Text>
                      <Text style={styles.countryCode}>{item.phone_code}</Text>
                    </View>
                  </Pressable>
                )}
              />
            </View>
          )}

          <Text style={styles.label}>{t('labels.email')}</Text>
          <TextInput
            value={isEmail}
            placeholder={t('placeholders.email')}
            placeholderTextColor={Colors.lightPlaceholder}
            style={styles.input}
            onChangeText={text => {
              setIsEmail(text);
            }}
          />
          <Text style={styles.label}>{t('labels.password')}</Text>
          <TextInput
            value={isPassword}
            placeholder={t('placeholders.password')}
            placeholderTextColor={Colors.lightPlaceholder}
            style={styles.input}
            onChangeText={text => {
              setIsPassword(text);
            }}
          />
          <Text style={styles.label}>{t('labels.vatNumber')}</Text>
          <TextInput
            value={isVATNumber}
            placeholder={t('placeholders.vatNumber')}
            placeholderTextColor={Colors.lightPlaceholder}
            style={styles.input}
            onChangeText={text => {
              setIsVATNumber(text);
            }}
            keyboardType="decimal-pad"
          />
        </View>
        <View style={styles.signUpButtonContainer}>
          <SignUpButton
            title={t('buttons.continue').toUpperCase()}
            onPress={() => {
              onPressContinueBtn();
            }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateProfile1;

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
    marginTop: hp(6),
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
    marginHorizontal: 15,
    marginTop: hp(2),
  },
  input: {
    borderRadius: 30,
    color: Colors.fontDarkGray,
    fontFamily: FontFamily.InterMedium,
    fontSize: responsiveFontSize(1.8),
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(4),
    elevation: 6,
    shadowColor: 'black',
    shadowOffset: {width: -1, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 0,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 15,
    marginTop: hp(1),
  },
  phoneContainer: {
    flexDirection: 'row',
    marginHorizontal: wp(5),
    marginTop: hp(1.2),
  },
  countryCodeContainer: {
    width: wp(20),
    borderRadius: 30,
    color: '#AAAAAA',
    fontSize: fontSize(13),
    paddingVertical: hp(1.4),
    paddingHorizontal: wp(2),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 6,
    shadowColor: 'black',
    shadowOffset: {width: -1, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 0,
    backgroundColor: '#FFFFFF',
  },
  countryCodeText: {
    color: '#AAAAAA',
    fontFamily: 'Inter-Regular',
    fontSize: responsiveFontSize(1.88),
  },
  downArrow: {
    height: 5,
    width: 10,
    tintColor: '#AAAAAA',
  },
  phoneNumberInput: {
    flex: 1,
    borderRadius: 30,
    color: Colors.fontDarkGray,
    fontFamily: FontFamily.InterMedium,
    fontSize: responsiveFontSize(1.8),
    paddingHorizontal: wp(4),
    elevation: 6,
    shadowColor: 'black',
    shadowOffset: {width: -1, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 0,
    backgroundColor: '#FFFFFF',
    marginLeft: wp(3),
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
  downArrowIcon: {
    height: 5,
    width: 10,
    tintColor: 'black',
    marginLeft: 10,
  },
  countryCodeButton: {
    width: wp(20),
    borderRadius: 30,
    paddingHorizontal: wp(4),
    justifyContent: 'center',
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 6,
    shadowColor: 'black',
    shadowOffset: {width: -1, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 0,
    backgroundColor: '#FFFFFF',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginTop: 10,
  },
  countryListContainer: {
    elevation: 5,
    marginTop: 10,
    height: hp(26.5),
    alignSelf: 'center',
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  searchInput: {
    width: '90%',
    height: 50,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#8e8e8e',
    borderRadius: 7,
    marginTop: 20,
    paddingLeft: 20,
    color: '#AAAAAA',
  },
  countryItem: {
    width: '85%',
    alignSelf: 'center',
    height: 50,
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderColor: '#8e8e8e',
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryFlag: {
    height: 30,
    width: 30,
    marginRight: 10,
  },
  countryName: {
    color: '#000000',
    fontFamily: 'Inter-Bold',
    fontSize: fontSize(11),
    marginLeft: wp(2),
  },
  countryItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodePrefix: {
    color: '#444444',
    fontFamily: 'Inter-Regular',
    fontSize: fontSize(14),
  },
  countryCode: {
    color: '#444444',
    fontFamily: 'Inter-Regular',
    fontSize: fontSize(11),
  },
});
