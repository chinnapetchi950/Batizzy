import {
  Alert,
  FlatList,
  Image,
  ImageBackground,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {
  StatusBarHeight,
  deviceHeight,
  fontSize,
  hp,
  wp,
} from '../../helper/constants';
import {icons, images} from '../../helper/imageConstants';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useCallback, useEffect, useRef, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {launchImageLibrary} from 'react-native-image-picker';
import {showMessage} from 'react-native-flash-message';
import RBSheet from 'react-native-raw-bottom-sheet';
import {launchCamera} from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import Geocoder from 'react-native-geocoding';
import Geolocation from '@react-native-community/geolocation';
import SignUpButton from '../../common/SignUpButton';
import {BASE_URL, IMAGE_URL} from '../../helper/ApiConstant';
import FilePicker from '../../common/FilePicker';
import Colors from '../../helper/Colors';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import FontFamily from '../../helper/FontFamily';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {routes} from '../../navigation/Routes';
import Loader from '../../common/Loader';
import {useLanguage} from '../../context/LanguageContext';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();

  const imageRef = useRef();
  const bottomSheetRef = useRef();
  const certificateBottomSheetRef = useRef();

  const [profilePhoto, setProfilePhoto] = useState('');
  const [userData, setUserData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumb, setPhoneNumb] = useState('');
  const [location, setLocation] = useState('');
  const [vatNumb, setVatNumb] = useState('');
  const [skills, setSkills] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [userSkillsID, setUserSkillsID] = useState([]);

  const [idPhotos, setIdPhotos] = useState([]);
  const [isNewUploadedidPhotos, setNewUploadedIdPhotos] = useState([]);
  const [experienceCertificates, setExperienceCertificates] = useState([]);
  const [
    isNewUploadedExperienceCertificates,
    setNewUploadedExperienceCertificates,
  ] = useState([]);

  const [currentLocation, setCurrentLocation] = useState('');
   const {selectedLanguage, changeLanguage} = useLanguage();

  useEffect(() => {
    Geocoder.init('AIzaSyCceRTsiY-2UPVwytF6wytwaGmonWjvTHo');

    const fetchCurrentLocation = async () => {
      Geolocation.getCurrentPosition(
        async position => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });

          try {
            const json = await Geocoder.from({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });

            const address = json.results[0].formatted_address;
          } catch (error) {
            console.error(error);
          }
        },
        error => {
          console.error(error);
        },
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
      );
    };

    fetchCurrentLocation();
  }, []);

  useEffect(() => {
    getUserData();
  }, []);

  useEffect(() => {
    getSkillsData();
  }, []);

  const getUserData = async () => {
    setIsLoading(true);
    var Token = await AsyncStorage.getItem('accessToken');
    await fetch(BASE_URL + 'profile', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + Token,
        Accept: 'application/json',
      },
    })
      .then(res => res.json())
      .then(res => {
        setIsLoading(false);
        if (res.status === true) {
          setUserData(res.data);
          setFirstName(res.data?.firstname);
          setLastName(res.data?.lastname);
          setUserSkills(res.data?.skills);
          setLocation(res.data?.location);
          const userSkillsID = res.data?.skills.map(item => item.id);
          setUserSkillsID(userSkillsID);
        }
      })
      .catch(error => {
        setIsLoading(false);
        console.error(error);
      });
  };

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

  const handleSelectSkill = skill => {
    setUserSkills(prevUserSkills => {
      const isAlreadySelected = prevUserSkills.some(s => s.id === skill.id);
      const updatedUserSkills = isAlreadySelected
        ? prevUserSkills.filter(s => s.id !== skill.id) // Remove skill
        : [...prevUserSkills, skill]; // Add skill
      setUserSkillsID(updatedUserSkills.map(item => item.id));
      return updatedUserSkills; // Return updated state
    });
  };

  const renderSkill = ({item, index}) => {
    const isMatched = userSkillsID.includes(item.id);

    return (
      <View key={index} style={styles.skillWrapper}>
        <TouchableOpacity
          onPress={() => handleSelectSkill(item)} // Trigger selection/deselection
          style={[
            styles.skillContainer,
            isMatched && styles.selectedSkillContainer, // Highlight if selected
          ]}>
          <Text style={[styles.skillText, isMatched && styles.selectedText]}>
            {selectedLanguage == 'fr' || item?.name_fr?.length > 18
              ? `${item?.name_fr?.slice(0, 18)}...`
              : selectedLanguage == 'de' || item?.name_de?.length > 18
              ? `${item?.name_de?.slice(0, 18)}...`
              : `${item?.name?.slice(0, 30)}...`}{' '}
          </Text>
        </TouchableOpacity>
        {isMatched && (
          <TouchableOpacity
            onPress={() => handleSelectSkill(item)} // Allow deselection
            style={styles.closeButton}>
            <Image
              source={icons.skillCloseBtn}
              style={{height: 20, width: 20}}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const updateProfile = async () => {
    setIsLoading(true);
    var formData = new FormData();
    formData.append('_method', 'put');
    formData.append('firstname', firstName ? firstName : userData?.firstname);
    formData.append('lastname', lastName ? lastName : userData?.lastname);
    formData.append('gender', userData?.gender);
    formData.append('location', location);
    formData.append(
      'lat',
      currentLocation.latitude ? currentLocation.latitude : userData?.lat,
    );
    formData.append(
      'lng',
      currentLocation.longitude ? currentLocation.longitude : userData?.lng,
    );
    formData.append('vat_number', vatNumb ? vatNumb : userData?.vat_number);
    formData.append('working_days', userData?.working_days);
    formData.append('size_of_company', userData?.size_of_company);
    formData.append('experience', userData?.experience);

    userSkills?.forEach((skillId, index) => {
      formData.append(`skills[${index}]`, skillId.id);
    });
    if (profilePhoto) {
      formData.append('profile_image', {
        uri: profilePhoto.uri,
        type: profilePhoto.type,
        name: profilePhoto.fileName,
      });
    }
    isNewUploadedidPhotos.forEach((image, index) => {
      formData.append('ids[]', {
        uri: image.uri,
        type: image.type,
        name: image.name,
      });
    });
    isNewUploadedExperienceCertificates.forEach((image, index) => {
      formData.append('experience_certificates[]', {
        uri: image.uri,
        type: image.type,
        name: image.name,
      });
    });
    var Token = await AsyncStorage.getItem('accessToken');

    await fetch(BASE_URL + 'update_profile', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + Token,
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    })
      .then(res => res.json())
      .then(res => {
        setIsLoading(false);
        if (res.status == true) {
          showMessage({
            message: res.message,
            floating: true,
            position: 'top',
            icon: 'success',
            type: 'success',
          });
          getProfileData(Token);
        } else {
          setIsLoading(false);
          handleApiError(res);
        }
      })
      .catch(error => {
        console.error(error);
        setIsLoading(false);
      });
  };

  const getProfileData = async Token => {
    setIsLoading(true);

    await fetch(BASE_URL + 'profile', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + Token,
        Accept: 'application/json',
      },
    })
      .then(res => res.json())
      .then(res => {
        setIsLoading(false);
        if (res.status === true) {
          AsyncStorage.setItem('userData', JSON.stringify(res.data));
          navigation.navigate(routes.ProfileScreen);
        }
      })
      .catch(error => {
        setIsLoading(false);
        console.error(error);
      });
  };

  const selectImgFromCamera = () => {
    const options = {
      title: 'Take Picture',
      mediaType: 'photo', // Specify media type
      maxWidth: 800, // Max width of the image
      maxHeight: 600, // Max height of the image
      quality: 1, // Image quality
    };
    launchCamera(options, response => {
      console.log('in print===>', response);
      imageRef.current.close();
      if (response.didCancel) {
      } else if (response.error) {
      } else {
        setProfilePhoto(response?.assets[0]);
      }
    });
  };

  const selectImgFromGallery = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };
    launchImageLibrary(options, response => {
      imageRef.current.close();
      if (response.didCancel) {
      } else if (response.error) {
      } else {
        setProfilePhoto(response?.assets[0]);
      }
    });
  };

  const handleApiError = response => {
    const {message, error_details} = response;
    showMessage({
      message: message || 'An error occurred',
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

  const handleRemoveDocument = index => {
    const updatedDocuments = [...isNewUploadedidPhotos];
    updatedDocuments.splice(index, 1);
    setNewUploadedIdPhotos(updatedDocuments);
  };

  const handleRemoveCertificateDocument = index => {
    const updatedDocuments = [...isNewUploadedExperienceCertificates];
    updatedDocuments.splice(index, 1);
    setNewUploadedExperienceCertificates(updatedDocuments);
  };

  const IDProofTakePicture = async () => {
    const options = {
      title: 'Take Picture',
      mediaType: 'photo', // Specify media type
      maxWidth: 800, // Max width of the image
      maxHeight: 600, // Max height of the image
      quality: 1, // Image quality
    };

    launchCamera(options, response => {
      if (response.didCancel) {
      } else if (response.error) {
      } else {
        if (Array.isArray(response.assets) && response.assets.length > 0) {
          const newDocument = {
            uri: response.assets[0]?.uri,
            type: response.assets[0]?.type,
            name: response.assets[0]?.fileName,
          };
          setNewUploadedIdPhotos(prevDocuments => [
            ...prevDocuments,
            newDocument,
          ]);
          bottomSheetRef.current.close();
        }
      }
    });
  };

  const pickIDProofImages = async () => {
    try {
      const results = await DocumentPicker.pick({
        type: [DocumentPicker.types.images],
        allowMultiSelection: true,
      });

      const newDocuments = results.map(result => ({
        uri: result.uri,
        type: result.type,
        name: result.name,
      }));
      setNewUploadedIdPhotos(prevDocuments => [
        ...prevDocuments,
        ...newDocuments,
      ]);
      bottomSheetRef.current.close();
    } catch (err) {
      // Handle error
    }
  };

  const PickIDProofDocuments = async () => {
    try {
      const results = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.pdf,
          DocumentPicker.types.doc,
          DocumentPicker.types.docx,
        ],
        allowMultiSelection: true,
      });

      const newDocuments = results.map(result => ({
        uri: result.uri,
        type: result.type,
        name: result.name,
      }));
      setNewUploadedIdPhotos(prevDocuments => [
        ...prevDocuments,
        ...newDocuments,
      ]);
      bottomSheetRef.current.close();
    } catch (err) {
      // Handle error
    }
  };

  const ExperienceCertificateTakePicture = async () => {
    const options = {
      title: 'Take Picture',
      mediaType: 'photo', // Specify media type
      maxWidth: 800, // Max width of the image
      maxHeight: 600, // Max height of the image
      quality: 1, // Image quality
    };

    launchCamera(options, response => {
      if (response.didCancel) {
      } else if (response.error) {
      } else {
        if (Array.isArray(response.assets) && response.assets.length > 0) {
          const newDocument = {
            uri: response.assets[0]?.uri,
            type: response.assets[0]?.type,
            name: response.assets[0]?.fileName,
          };
          setNewUploadedExperienceCertificates(prevDocuments => [
            ...prevDocuments,
            newDocument,
          ]);
          certificateBottomSheetRef.current.close();
        }
      }
    });
  };

  const ExperienceCertificatePickImages = async () => {
    try {
      const results = await DocumentPicker.pick({
        type: [DocumentPicker.types.images],
        // type: [
        //   DocumentPicker.types.pdf,
        //   DocumentPicker.types.doc,
        //   DocumentPicker.types.docx,
        // ],
        allowMultiSelection: true,
      });

      const newDocuments = results.map(result => ({
        uri: result.uri,
        type: result.type,
        name: result.name,
      }));

      // Append new documents to existing ones
      setNewUploadedExperienceCertificates(prevDocuments => [
        ...prevDocuments,
        ...newDocuments,
      ]);
      certificateBottomSheetRef.current.close();
    } catch (err) {
      // Handle error
    }
  };

  const ExperienceCertificatePickDocuments = async () => {
    try {
      const results = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.pdf,
          DocumentPicker.types.doc,
          DocumentPicker.types.docx,
        ],
        // type: [
        //   DocumentPicker.types.pdf,
        //   DocumentPicker.types.doc,
        //   DocumentPicker.types.docx,
        // ],
        allowMultiSelection: true,
      });

      const newDocuments = results.map(result => ({
        uri: result.uri,
        type: result.type,
        name: result.name,
      }));

      // Append new documents to existing ones
      setNewUploadedExperienceCertificates(prevDocuments => [
        ...prevDocuments,
        ...newDocuments,
      ]);
      certificateBottomSheetRef.current.close();
    } catch (err) {
      // Handle error
    }
  };

  const getFileTypeIcon = type => {
    if (type === 'application/pdf') {
      return icons.pdf; // Assume you have a pdf icon in your imageConstants
    } else if (type.includes('word')) {
      return icons.docs; // Assume you have a docs icon in your imageConstants
    } else {
      return icons.blank; // Provide a default icon for other file types
    }
  };
  const gotoFindLetLong = async (data, details) => {
    setLocation(data.description);
    setCurrentLocation({
      latitude: details?.geometry?.location?.lat,
      longitude: details?.geometry?.location?.lng,
    });
  };
  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: Platform.OS == 'android' ? 0 : StatusBarHeight,
        backgroundColor: 'white',
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: '4%',
        }}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}>
          <ImageBackground
            source={icons.Bg}
            style={{height: 40, width: 40, justifyContent: 'center'}}>
            <Image
              source={icons.backIcon}
              style={{
                height: 16,
                width: 16,
                alignItems: 'center',
                alignSelf: 'center',
                resizeMode: 'contain',
              }}
            />
          </ImageBackground>
        </TouchableOpacity>
        <View>
          <Text
            style={{
              fontFamily: FontFamily.InterMedium,
              fontSize: responsiveFontSize(2),
              color: Colors.black,
              marginTop: 10,
            }}>
            {t('editProfile.editProfileTitle')}
          </Text>
        </View>
        <View>
          <ImageBackground
            source={icons.CartIconBg}
            style={{
              height: hp(4.57),
              width: hp(4.57),
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        </View>
      </View>

      <View
        style={{
          elevation: 6,
          shadowColor: 'black',
          shadowOffset: {width: -1, height: 4},
          shadowOpacity: 0.1,
          shadowRadius: 0,
          backgroundColor: 'lightgray',
          width: '100%',
          height: 2,
          marginTop: '4%',
        }}
      />

      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View>
          <View
            style={{
              backgroundColor: Colors.white,
              alignSelf: 'center',
              marginTop: '4%',
            }}>
            {!profilePhoto ? (
              <Image
                source={{
                  uri: userData?.profile_image
                    ? IMAGE_URL + userData?.profile_image
                    : images.profileDummy,
                }}
                style={{
                  height: 150,
                  width: 150,
                  borderRadius: 80,
                }}
              />
            ) : (
              <Image
                source={{
                  uri: profilePhoto?.uri,
                }}
                style={{
                  height: 150,
                  width: 150,
                  borderRadius: 80,
                }}
              />
            )}
            <TouchableOpacity
              onPress={() => {
                imageRef.current.open();
              }}>
              <Image
                source={icons.cameraIcon}
                style={{
                  height: 50,
                  width: 50,
                  marginTop: -40,
                  marginLeft: 90,
                }}
              />
            </TouchableOpacity>
          </View>

          <Text style={[styles.inputLabel]}>{t('editProfile.firstName')}</Text>
          <TextInput
            value={firstName}
            placeholder={t('editProfile.firstName')}
            placeholderTextColor={'#AAAAAA'}
            style={[styles.input]}
            onChangeText={text => {
              setFirstName(text);
            }}
          />
          <Text style={[styles.inputLabel]}>{t('placeholders.lastName')}</Text>
          <TextInput
            value={lastName}
            placeholder={t('placeholders.lastName')}
            placeholderTextColor={'#AAAAAA'}
            style={[styles.input]}
            onChangeText={text => {
              setLastName(text);
            }}
          />

          <Text style={[styles.inputLabel]}>{t('labels.phoneNumber')}</Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginLeft: '4%',
            }}>
            <View
              style={{
                backgroundColor: '#EEEEEE',
                borderRadius: 30,
                width: '20%',
              }}>
              <View
                style={{
                  borderRadius: 30,
                  fontSize: responsiveFontSize(1.6),
                  fontFamily: FontFamily.InterRegular,
                  paddingHorizontal: '16%',
                  paddingVertical: '10%',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  elevation: 6,
                  shadowColor: 'black',
                  shadowOffset: {width: -1, height: 4},
                  shadowOpacity: 0.1,
                  shadowRadius: 0,
                  backgroundColor: Colors.white,
                }}>
                <Text
                  style={{
                    color: Colors.black,
                    fontFamily: FontFamily.InterRegular,
                    fontSize: fontSize(13),
                  }}>
                  {'+'}
                  {userData?.phonecode ? userData?.phonecode : ''}
                </Text>
                <Image
                  resizeMode="contain"
                  source={icons.downArrow}
                  style={{
                    height: 5,
                    width: 10,
                    tintColor: '#AAAAAA',
                  }}
                />
              </View>
            </View>
            <TextInput
              editable={false}
              value={phoneNumb ? phoneNumb : userData?.phone}
              maxLength={10}
              keyboardType="numeric"
              placeholder={t('placeholders.phoneNumber')}
              placeholderTextColor={'#AAAAAA'}
              style={[styles.input, {width: '70%'}]}
              onChangeText={text => {
                setPhoneNumb(text);
              }}
            />
          </View>
          <Text style={[styles.inputLabel]}>
            {t('requestDetails.location')}
          </Text>

          <View
            style={{
              borderRadius: 30,
              elevation: 6,
              shadowColor: 'black',
              shadowOffset: {width: -1, height: 4},
              shadowOpacity: 0.1,
              shadowRadius: 0,
              backgroundColor: Colors.white,
              marginHorizontal: '4%',
              marginTop: '1%',
            }}>
            <GooglePlacesAutocomplete
              placeholder={location}
              // onPress={(data, details) => {
              //   setLocation(data.description);
              // }}
              onPress={(data, details) => gotoFindLetLong(data, details)}
              query={{
                key: 'AIzaSyCceRTsiY-2UPVwytF6wytwaGmonWjvTHo',
                language: 'en',
              }}
              numberOfLines={1}
              fetchDetails
              textInputProps={{
                placeholderTextColor: Colors.lightPlaceholder,
              }}
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
                  borderColor: Colors.black,
                  borderTopWidth: 1,
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
          <Text style={[styles.inputLabel]}>{t('labels.vatNumber')}</Text>
          <TextInput
            value={vatNumb ? vatNumb : userData?.vat_number}
            placeholder={t('labels.vatNumber')}
            placeholderTextColor={'#AAAAAA'}
            style={[styles.input]}
            onChangeText={text => {
              setVatNumb(text);
            }}
            keyboardType="decimal-pad"
          />
          <Text style={[styles.inputLabel]}>
            {t('createProfile2.addYourSkills')}
          </Text>

          <FlatList
            data={skills}
            renderItem={(item, index) => renderSkill(item, index)}
            keyExtractor={item => item.id.toString()}
            horizontal={false}
            numColumns={2}
            contentContainerStyle={[styles.skillList]}
          />
          {/* <Text style={[styles.inputLabel]}>{'ID Proof'}</Text>
          <View style={{marginHorizontal: '4%'}}>
            <FilePicker
              onPressFilePicker={() => {
                bottomSheetRef.current.open();
              }}
              placeholder={'Choose Id Proof'}
            />
          </View> */}
          {idPhotos && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{marginHorizontal: wp(5)}}>
              {idPhotos.map((document, index) => {
                const isImage = /\.(jpg|jpeg|png|gif)$/i.test(
                  document.file_path,
                );
                const isPDF = /\.pdf$/i.test(document);
                return (
                  <View key={document.name} style={{marginTop: 20}}>
                    {isImage ? (
                      // If the document is an image, display the image
                      <Image
                        source={{uri: IMAGE_URL + document.file_path}}
                        // source={{uri: document}}
                        style={{
                          height: hp(8),
                          width: hp(8),
                          marginBottom: hp(1),
                          marginRight: wp(2),
                          borderRadius: wp(2),
                        }}
                      />
                    ) : (
                      // If the document is not an image, display the file type icon
                      <Image
                        resizeMode="contain"
                        source={icons.pdf}
                        style={{
                          height: 50,
                          width: 50,
                          marginTop: '4%',
                        }}
                      />
                    )}
                    <TouchableOpacity
                      onPress={() => handleRemoveDocument(index)}
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        zIndex: 1,
                      }}>
                      <Image
                        resizeMode="contain"
                        source={icons.skillCloseBtn}
                        style={{
                          height: 16,
                          width: 16,
                        }}
                      />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          )}
          {isNewUploadedidPhotos && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{marginHorizontal: wp(5)}}>
              {isNewUploadedidPhotos.map((document, index) => {
                return (
                  <View key={document.name} style={{marginTop: 20}}>
                    {document.type.startsWith('image') ? (
                      <Image
                        source={{uri: document.uri}}
                        style={{
                          height: hp(8),
                          width: hp(8),
                          marginBottom: hp(2),
                          marginRight: wp(2),
                          borderRadius: wp(2),
                        }}
                      />
                    ) : (
                      <Image
                        resizeMode="contain"
                        source={getFileTypeIcon(document.type)}
                        style={{
                          height: hp(8),
                          width: hp(8),
                          marginBottom: hp(2),
                          marginRight: wp(2),
                        }}
                      />
                    )}
                    <TouchableOpacity
                      onPress={() => handleRemoveDocument(index)}
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        zIndex: 1,
                      }}>
                      <Image
                        resizeMode="contain"
                        source={icons.skillCloseBtn}
                        style={{
                          height: 16,
                          width: 16,
                          marginTop: -5,
                        }}
                      />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          )}
          {/* <Text style={[styles.inputLabel]}>{'Experience Certificates'}</Text>
          <View style={{marginHorizontal: '4%'}}>
            <FilePicker
              onPressFilePicker={() => {
                certificateBottomSheetRef.current.open();
              }}
              placeholder={'Choose Experience Certificates'}
            />
          </View> */}
          {experienceCertificates && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{marginHorizontal: wp(5)}}>
              {experienceCertificates.map((document, index) => {
                const isImage = /\.(jpg|jpeg|png|gif)$/i.test(
                  document.file_path,
                );
                const isPDF = /\.pdf$/i.test(document);
                return (
                  <View key={document.name} style={{marginTop: 20}}>
                    {isImage ? (
                      // If the document is an image, display the image
                      <Image
                        source={{uri: IMAGE_URL + document.file_path}}
                        // source={{uri: document}}
                        style={{
                          height: hp(8),
                          width: hp(8),
                          marginBottom: hp(1),
                          marginRight: wp(2),
                          borderRadius: wp(2),
                        }}
                      />
                    ) : (
                      // If the document is not an image, display the file type icon
                      <Image
                        resizeMode="contain"
                        // source={icons.pdf}
                        source={getFileTypeIcon(document.type)}
                        style={{
                          height: hp(8),
                          width: hp(8),
                          marginBottom: hp(2),
                          marginRight: wp(2),
                        }}
                      />
                    )}
                    <TouchableOpacity
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        zIndex: 1,
                      }}>
                      <Image
                        resizeMode="contain"
                        source={icons.skillCloseBtn}
                        style={{
                          height: 16,
                          width: 16,
                        }}
                      />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          )}
          {isNewUploadedExperienceCertificates && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{marginHorizontal: wp(5)}}>
              {isNewUploadedExperienceCertificates.map((document, index) => {
                const isImage = /\.(jpg|jpeg|png|gif)$/i.test(document.type);
                const isPDF = /\.pdf$/i.test(document);
                return (
                  <View key={document.name} style={{marginTop: 20}}>
                    {document.type.startsWith('image') ? (
                      // If the document is an image, display the image
                      <Image
                        // resizeMode="contain"
                        source={{uri: document.uri}}
                        style={{
                          height: hp(8),
                          width: hp(8),
                          marginBottom: hp(2),
                          marginRight: wp(2),
                          borderRadius: wp(2),
                        }}
                      />
                    ) : (
                      // If the document is not an image, display the file type icon
                      <Image
                        resizeMode="contain"
                        source={getFileTypeIcon(document.type)}
                        style={{
                          height: hp(8),
                          width: hp(8),
                          marginBottom: hp(2),
                          marginRight: wp(2),
                        }}
                      />
                    )}
                    <TouchableOpacity
                      onPress={() => handleRemoveCertificateDocument(index)}
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        zIndex: 1,
                      }}>
                      <Image
                        resizeMode="contain"
                        source={icons.skillCloseBtn}
                        style={{
                          height: 16,
                          width: 16,
                        }}
                      />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
        <View
          style={{
            alignItems: 'center',
            marginHorizontal: '4%',
            marginVertical: '10%',
          }}>
          <SignUpButton
            title={t('editProfile.updateNow')}
            onPress={() => {
              updateProfile();
            }}
          />
        </View>
      </ScrollView>

      <RBSheet
        ref={bottomSheetRef}
        closeOnPressMask={true}
        customStyles={{
          wrapper: {},
          container: {
            borderTopLeftRadius: wp(8),
            borderTopRightRadius: wp(8),
            height: '30%',
          },
        }}>
        <View style={{padding: '4%'}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text style={[styles.midLabel]}>
              {t('editProfile.selectOption')}
            </Text>
            <TouchableOpacity
              onPress={() => {
                bottomSheetRef.current.close();
              }}>
              <Image source={icons.CloseIcon} style={{height: 16, width: 16}} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={{}}
            onPress={() => {
              IDProofTakePicture();
              bottomSheetRef.current.close();
            }}>
            <Text style={[styles.optionText]}>
              {t('editProfile.selectFromCamera')}
            </Text>
          </TouchableOpacity>
          <View
            style={{
              borderTopWidth: 1,
              borderColor: 'lightgray',
            }}
          />
          <TouchableOpacity
            style={{}}
            onPress={() => {
              pickIDProofImages();
              bottomSheetRef.current.close();
            }}>
            <Text style={[styles.optionText]}>
              {t('editProfile.selectFromGallery')}
            </Text>
          </TouchableOpacity>
          <View
            style={{
              borderTopWidth: 1,
              borderColor: 'lightgray',
            }}
          />
          <TouchableOpacity
            style={{}}
            onPress={() => {
              PickIDProofDocuments();
              bottomSheetRef.current.close();
            }}>
            <Text style={[styles.optionText]}>
              {t('createprofile4.selectDocuments')}
            </Text>
          </TouchableOpacity>
        </View>
      </RBSheet>
      <RBSheet
        ref={certificateBottomSheetRef}
        closeOnPressMask={true}
        customStyles={{
          wrapper: {},
          container: {
            borderTopLeftRadius: wp(8),
            borderTopRightRadius: wp(8),
            height: '30%',
          },
        }}>
        <View style={{padding: '4%'}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text style={[styles.midLabel]}>
              {t('editProfile.selectOption')}
            </Text>

            <TouchableOpacity
              onPress={() => {
                certificateBottomSheetRef.current.close();
              }}>
              <Image source={icons.CloseIcon} style={{height: 16, width: 16}} />
            </TouchableOpacity>
          </View>
          <View style={{marginVertical: '4%'}}>
            <TouchableOpacity
              style={{}}
              onPress={() => {
                ExperienceCertificateTakePicture();
                certificateBottomSheetRef.current.close();
              }}>
              <Text style={[styles.optionText]}>
                {t('editProfile.selectFromCamera')}
              </Text>
            </TouchableOpacity>
            <View
              style={{
                borderTopWidth: 1,
                borderColor: 'lightgray',
              }}
            />
            <TouchableOpacity
              style={{}}
              onPress={() => {
                ExperienceCertificatePickImages();
                certificateBottomSheetRef.current.close();
              }}>
              <Text style={[styles.optionText]}>
                {t('editProfile.selectFromGallery')}
              </Text>
            </TouchableOpacity>
            <View
              style={{
                borderTopWidth: 1,
                borderColor: 'lightgray',
              }}
            />
            <TouchableOpacity
              style={{}}
              onPress={() => {
                ExperienceCertificatePickDocuments();
                certificateBottomSheetRef.current.close();
              }}>
              <Text style={[styles.optionText]}>
                {t('createprofile4.selectDocuments')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </RBSheet>
      <RBSheet
        ref={imageRef}
        closeOnPressMask={true}
        customStyles={{
          wrapper: {},
          container: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            height: deviceHeight / 4.5,
          },
        }}>
        <View style={{padding: '4%'}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text style={[styles.midLabel]}>
              {t('editProfile.selectOption')}
            </Text>
            <TouchableOpacity onPress={() => imageRef.current.close()}>
              <Image source={icons.CloseIcon} style={{height: 16, width: 16}} />
            </TouchableOpacity>
          </View>
          <View style={{paddingVertical: '4%'}}>
            <TouchableOpacity onPress={() => selectImgFromCamera()}>
              <View style={[styles.smallBtn]}>
                <Text style={[styles.smallLabel]}>
                  {t('editProfile.selectFromCamera')}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => selectImgFromGallery()}>
              <View style={[styles.smallBtn, {marginTop: '6%'}]}>
                <Text style={[styles.smallLabel]}>
                  {t('editProfile.selectFromGallery')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </RBSheet>
      <View>{isLoading && <Loader />}</View>
    </SafeAreaView>
  );
};
export default EditProfileScreen;

const styles = StyleSheet.create({
  inputLabel: {
    fontSize: responsiveFontSize(1.6),
    marginHorizontal: '4%',
    fontFamily: FontFamily.InterMedium,
    color: Colors.black,
    marginTop: '4%',
  },
  smallBtn: {
    padding: '2%',
    backgroundColor: Colors.primary,
    borderRadius: 10,
    alignItems: 'center',
  },
  smallLabel: {
    fontSize: responsiveFontSize(1.6),
    fontFamily: FontFamily.InterMedium,
    color: Colors.white,
  },

  midLabel: {
    fontSize: responsiveFontSize(2),
    fontFamily: FontFamily.InterMedium,
    color: Colors.black,
  },
  input: {
    borderRadius: 30,
    fontSize: responsiveFontSize(1.6),
    fontFamily: FontFamily.InterRegular,
    elevation: 6,
    shadowColor: 'black',
    shadowOffset: {width: -1, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 0,
    backgroundColor: Colors.white,
    marginHorizontal: '4%',
    paddingLeft: 10,
    marginTop: '1%',
    color: Colors.black,
  },
  iconContainer: {
    padding: 5,
    position: 'absolute',
    right: 35,
    top: 10,
  },
  iconContainer1: {
    padding: 5,
    position: 'absolute',
    right: 35,
    top: 23,
  },
  container: {
    backgroundColor: Colors.primary,
    padding: 16,
  },
  dropdown: {
    height: hp(6),
    marginLeft: wp(5),
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 30,
    paddingHorizontal: wp(4),
    backgroundColor: Colors.primary,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'red',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: wp(8),
    fontSize: 14,
    color: 'white',
  },
  placeholderStyle: {
    fontSize: 16,
    color: 'white',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: 'white',
  },
  iconStyle: {
    width: 25,
    height: 25,
    tintColor: 'white',
  },
  containerStyle: {
    borderRadius: 30,
  },
  skillList: {
    justifyContent: 'space-between',
    marginBottom: 16,
    marginHorizontal: '4%',
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
  optionText: {
    fontFamily: FontFamily.InterRegular,
    color: Colors.fontDarkGray,
    fontSize: responsiveFontSize(1.6),
    paddingVertical: '3%',
  },
});
