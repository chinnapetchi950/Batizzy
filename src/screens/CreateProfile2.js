import React, {useEffect, useState} from 'react';
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
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {icons} from '../helper/imageConstants';
import {fontSize, hp, wp} from '../helper/constants';
import {useNavigation, useRoute} from '@react-navigation/native';
import SignUpButton from '../common/SignUpButton';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import {Picker} from '@react-native-picker/picker';
import {routes} from '../navigation/Routes';
import {BASE_URL} from '../helper/ApiConstant';
import {showMessage} from 'react-native-flash-message';
import FontFamily from '../helper/FontFamily';
import Colors from '../helper/Colors';
import {useLanguage} from '../context/LanguageContext';

const CreateProfile2 = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {t} = useTranslation(); // Add translation hook

  const FirstName = route.params?.FirstName;
  const LastName = route.params?.LastName;
  const PhoneNumber = route.params?.PhoneNumber;
  const Email = route.params?.Email;
  const Password = route.params?.Password;
  const VATNumber = route.params?.VATNumber;
  const CountryCode = route.params?.CountryCode;

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [experience, setExperience] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [skills, setSkills] = useState([]);
  const {selectedLanguage, changeLanguage} = useLanguage();

  const getSkillsData = async () => {
    await fetch(BASE_URL + 'skills', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
      .then(res => res.json())
      .then(res => {
        if (res.status === true) {
          setSkills(res.data);
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  useEffect(() => {
    getSkillsData();
  }, []);

  const handleSelectSkill = skill => {
    setSelectedSkills(prevSkills => {
      if (prevSkills.some(s => s.id === skill.id)) {
        return prevSkills.filter(s => s.id !== skill.id);
      } else {
        return [...prevSkills, skill];
      }
    });
  };

  const renderSkill = ({item}) => {
    const isSelected = selectedSkills.some(s => s.id === item.id);

    return (
      <View style={styles.skillWrapper}>
        <TouchableOpacity
          onPress={() => handleSelectSkill(item)}
          style={[
            styles.skillContainer,
            isSelected && styles.selectedSkillContainer,
          ]}>
          <Text style={[styles.skillText, isSelected && styles.selectedText]}>
            {selectedLanguage == 'fr' || item?.name_fr?.length > 18
              ? `${item?.name_fr?.slice(0, 18)}...`
              : selectedLanguage == 'de' || item?.name_de?.length > 18
              ? `${item?.name_de?.slice(0, 18)}...`
              : `${item?.name?.slice(0, 30)}...`}
          </Text>
        </TouchableOpacity>
        {isSelected && (
          <Pressable
            onPress={() => handleSelectSkill(item)}
            style={styles.closeButton}>
            <Image
              source={icons.skillCloseBtn}
              style={{height: 20, width: 20}}
            />
          </Pressable>
        )}
      </View>
    );
  };

  const handleContinue = () => {
    const selectedSkillIds = selectedSkills.map(skill => skill.id);

    if (!experience) {
      showMessage({
        message: t('createProfile2.selectExperience'), // Use translated message
        type: 'warning',
      });
    } else if (!companySize) {
      showMessage({
        message: t('createProfile2.selectCompanySize'), // Use translated message
        type: 'warning',
      });
    } else {
      navigation.navigate(routes.CreateProfile3, {
        selectedSkills: selectedSkillIds,
        Experience: experience,
        CompanySize: companySize,
        FirstName: FirstName,
        LastName: LastName,
        PhoneNumber: PhoneNumber,
        Email: Email,
        Password: Password,
        VATNumber: VATNumber,
        CountryCode: CountryCode,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.safeAreaView}
      behavior={Platform.OS === 'ios' ? 'padding' : 1000}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : hp(2)}>
      <ScrollView
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
          <Text style={styles.stepText}>{'Step 2'.toUpperCase()}</Text>
          <Text style={styles.createProfileText}>
            {t('createProfile2.expertiseQuestion')} {/* Translate text */}
          </Text>
        </ImageBackground>

        <View style={{paddingHorizontal: 15}}>
          <Text style={styles.label}>{t('createProfile2.addYourSkills')}</Text>
          <TextInput
            editable={false}
            style={styles.input}
            placeholder={t('createProfile2.bestResultsSkills')}
            placeholderTextColor={Colors.lightPlaceholder}
            value={selectedSkill}
            onChangeText={setSelectedSkill}
            onSubmitEditing={() => {
              if (selectedSkill && !skills.includes(selectedSkill)) {
                setSkills([...skills, selectedSkill]);
                setSelectedSkill('');
              }
            }}
          />
          <FlatList
            data={skills}
            renderItem={renderSkill}
            keyExtractor={item => item.id.toString()}
            horizontal={false}
            numColumns={2}
            contentContainerStyle={styles.skillList}
          />

          <Text style={styles.label}>
            {t('createProfile2.experienceLevel')}
          </Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={experience}
              style={styles.picker}
              onValueChange={itemValue => setExperience(itemValue)}>
              <Picker.Item
                label={t('createProfile2.selectExperience')}
                value=""
                style={{color: Colors.lightPlaceholder}}
              />
              <Picker.Item
                label={t('createProfile2.experience0to2')}
                value="0_2"
                style={{color: Colors.lightPlaceholder}}
              />
              <Picker.Item
                label={t('createProfile2.experience3to7')}
                value="3_7"
                style={{color: Colors.lightPlaceholder}}
              />
              <Picker.Item
                label={t('createProfile2.experience10plus')}
                value="10_above"
                style={{color: Colors.lightPlaceholder}}
              />
            </Picker>
          </View>
          <Text style={styles.label}>{t('createProfile2.companySize')}</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={companySize}
              style={styles.picker}
              onValueChange={itemValue => setCompanySize(itemValue)}>
              <Picker.Item
                label={t('createProfile2.selectCompanySize')}
                value=""
                style={{color: Colors.lightPlaceholder}}
              />
              <Picker.Item
                label={t('createProfile2.size1to3')}
                value="1_3_members"
                style={{color: Colors.lightPlaceholder}}
              />
              <Picker.Item
                label={t('createProfile2.size4to7')}
                value="4_7_members"
                style={{color: Colors.lightPlaceholder}}
              />
              <Picker.Item
                label={t('createProfile2.size8to20')}
                value="8_20_members"
                style={{color: Colors.lightPlaceholder}}
              />
              <Picker.Item
                label={t('createProfile2.sizeMoreThan20')}
                value="more_than_20"
                style={{color: Colors.lightPlaceholder}}
              />
            </Picker>
          </View>
        </View>
        <View style={styles.signUpButtonContainer}>
          <SignUpButton
            title={t('createProfile2.continue').toUpperCase()}
            onPress={handleContinue}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateProfile2;

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
    fontFamily: FontFamily.InterMedium,
    fontSize: responsiveFontSize(1.8),
  },
  skillList: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  skillWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  skillContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderRadius: 10,
    marginRight: 20,
    backgroundColor: '#fff',
    borderColor: '#E2E2E2',
  },
  selectedSkillContainer: {
    backgroundColor: '#754595',
  },
  skillText: {
    color: '#444444',
  },
  selectedText: {
    color: '#fff',
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: -10,
  },
  closeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  pickerContainer: {
    height: 50,
    width: '100%',
    elevation: 6,
    shadowColor: 'black',
    shadowOffset: {width: -1, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 16,
  },
  picker: {
    height: 50,
    width: '100%',
    // color: Colors.white,
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
});
