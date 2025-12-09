import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {icons} from '../helper/imageConstants';
import {fontSize, hp, wp} from '../helper/constants';
import SignUpButton from '../common/SignUpButton';
import {useNavigation, useRoute} from '@react-navigation/native';
import {routes} from '../navigation/Routes';
import RBSheet from 'react-native-raw-bottom-sheet';
import {launchCamera} from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import {showMessage} from 'react-native-flash-message';
import FilePicker from '../common/FilePicker';
import {BASE_URL} from '../helper/ApiConstant';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CreateProfile4 = () => {
  const {t} = useTranslation();

  const navigation = useNavigation();
  const bottomSheetRef = useRef();
  const certificateBottomSheetRef = useRef();
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
  const StartTime = route.params?.StartTime;
  const EndTime = route.params?.EndTime;
  const WorkingDays = route.params?.WorkingDays;
  const Hour24 = route.params?.Hour24;
  const CurrentAddress = route.params?.CurrentAddress;
  const CurrentLocation = route.params?.CurrentLocation;

  const [idProofs, setIDProof] = useState([]);
  const [isExperienceCertificate, setExperienceCertificate] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const RegisterUser = async () => {
    const deviceToken = await AsyncStorage.getItem('deviceToken');

    setIsLoading(true);

    var formData = new FormData();
    formData.append('firstname', FirstName);
    formData.append('lastname', LastName);
    formData.append('email', Email);
    formData.append('password', Password);
    formData.append('password_confirmation', Password);
    formData.append('phonecode', CountryCode);
    formData.append('phone', PhoneNumber);
    formData.append('location', CurrentAddress);
    formData.append('lat', CurrentLocation.latitude);
    formData.append('lng', CurrentLocation.longitude);
    formData.append('vat_number', VATNumber);
    formData.append('working_days', WorkingDays);
    formData.append('is_24_hours', Hour24 ? 1 : 0);
    formData.append('working_hours_from', StartTime);
    formData.append('working_hours_to', EndTime);
    formData.append('experience', Experience);
    formData.append('size_of_company', CompanySize);

    selectedSkills.forEach((skillId, index) => {
      formData.append(`skills[${index}]`, skillId);
    });
    idProofs.forEach((image, index) => {
      formData.append('ids[]', {
        uri: image.uri,
        type: image.type,
        name: image.name,
      });
    });
    isExperienceCertificate.forEach((image, index) => {
      formData.append('experience_certificates[]', {
        uri: image.uri,
        type: image.type,
        name: image.name,
      });
    });
    formData.append('fcm_token', deviceToken);
    await fetch(BASE_URL + 'register', {
      method: 'POST',
      headers: {
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
          navigation.navigate(routes.SuccesfullGifScreen);
        } else {
          handleApiError(res);
        }
      })
      .catch(error => {
        console.error(error);
        setIsLoading(false);
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
        const formattedField = field.charAt(0).toUpperCase() + field.slice(1);
        showMessage({
          message: `${formattedField}: ${error_details[field][0]}`,
          type: 'warning',
        });
      });
    }
  };

  const IDProofTakePicture = async () => {
    const options = {
      title: 'Take Picture',
      mediaType: 'photo',
      maxWidth: 800,
      maxHeight: 600,
      quality: 1,
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
          setIDProof(prevDocuments => [...prevDocuments, newDocument]);
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

      setIDProof(prevDocuments => [...prevDocuments, ...newDocuments]);
      bottomSheetRef.current.close();
    } catch (err) {}
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

      setIDProof(prevDocuments => [...prevDocuments, ...newDocuments]);
      bottomSheetRef.current.close();
    } catch (err) {}
  };
  const ExperienceCertificateTakePicture = async () => {
    const options = {
      title: 'Take Picture',
      mediaType: 'photo',
      maxWidth: 800,
      maxHeight: 600,
      quality: 1,
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
          setExperienceCertificate(prevDocuments => [
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
        allowMultiSelection: true,
      });

      const newDocuments = results.map(result => ({
        uri: result.uri,
        type: result.type,
        name: result.name,
      }));

      setExperienceCertificate(prevDocuments => [
        ...prevDocuments,
        ...newDocuments,
      ]);
      certificateBottomSheetRef.current.close();
    } catch (err) {}
  };

  const ExperienceCertificatePickDocuments = async () => {
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

      setExperienceCertificate(prevDocuments => [
        ...prevDocuments,
        ...newDocuments,
      ]);
      certificateBottomSheetRef.current.close();
    } catch (err) {}
  };

  const getFileTypeIcon = type => {
    if (type === 'application/pdf') {
      return icons.pdf;
    } else if (type.includes('word')) {
      return icons.docs;
    } else {
      return icons.blank;
    }
  };

  const handleRemoveDocument = index => {
    const updatedDocuments = [...idProofs];
    updatedDocuments.splice(index, 1);
    setIDProof(updatedDocuments);
  };

  const handleRemoveCertificateDocument = index => {
    const updatedDocuments = [...isExperienceCertificate];
    updatedDocuments.splice(index, 1);
    setExperienceCertificate(updatedDocuments);
  };

  return (
    <>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{flexGrow: 1, backgroundColor: 'white'}}
        keyboardShouldPersistTaps="handled">
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: 'white',
            justifyContent: 'space-between',
          }}>
          <View>
            <ImageBackground
              source={icons.ProfileBG}
              style={{height: hp(28), width: '100%', paddingBottom: hp(5)}}>
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
              <Text
                style={{
                  fontFamily: 'Inter-SemiBold',
                  color: '#FFFFFF',
                  fontSize: fontSize(12),
                  marginTop: hp(3),
                  marginLeft: wp(6),
                }}>
                {t('createprofile4.step4')}
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter-SemiBold',
                  color: '#FFFFFF',
                  fontSize: fontSize(12),
                  marginTop: hp(2),
                  marginLeft: wp(6),
                }}>
                {t('createprofile4.uploadDocument')}
              </Text>
            </ImageBackground>
            <Text
              style={{
                color: '#000000',
                fontFamily: 'Inter-Medium',
                fontSize: fontSize(13),
                marginHorizontal: wp(6),
                marginBottom: hp(1),
              }}>
              {t('createprofile4.idProof')}
            </Text>
            <View style={{marginHorizontal: wp(5), marginBottom: hp(1)}}>
              <FilePicker
                onPressFilePicker={() => {
                  bottomSheetRef.current.open();
                }}
                placeholder={t('createprofile4.chooseIdProof')}
              />
            </View>
            {idProofs.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{marginHorizontal: wp(5)}}>
                {idProofs.map((document, index) => (
                  <View key={document.name} style={{position: 'relative'}}>
                    {document.type.startsWith('image') ? (
                      <Image
                        source={{uri: document.uri}}
                        style={{
                          height: hp(8),
                          width: hp(8),
                          marginBottom: hp(1),
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
                          height: hp(3),
                          width: hp(3),
                        }}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
            <Text
              style={{
                color: '#000000',
                fontFamily: 'Inter-Medium',
                fontSize: fontSize(13),
                marginHorizontal: wp(6),
                marginBottom: hp(1),
                marginTop: 10,
              }}>
              {t('createprofile4.experienceCertificates')}
            </Text>
            <View style={{marginHorizontal: wp(5), marginBottom: hp(1)}}>
              <FilePicker
                onPressFilePicker={() => {
                  certificateBottomSheetRef.current.open();
                }}
                placeholder={t('createprofile4.chooseExperienceCertificates')}
              />
            </View>
            {isExperienceCertificate.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{marginHorizontal: wp(5)}}>
                {isExperienceCertificate.map((document, index) => (
                  <View key={document.name} style={{position: 'relative'}}>
                    {document.type.startsWith('image') ? (
                      <Image
                        source={{uri: document.uri}}
                        style={{
                          height: hp(8),
                          width: hp(8),
                          marginBottom: hp(1),
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
                          height: hp(3),
                          width: hp(3),
                        }}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
          <View
            style={{
              alignItems: 'center',
              marginBottom: hp(2),
              marginHorizontal: wp(6),
            }}>
            <SignUpButton
              title={t('createprofile4.continue').toUpperCase()}
              onPress={() => {
                if (idProofs.length === 0) {
                  showMessage({
                    message: t('createprofile4.uploadIdProofWarning'),
                    type: 'warning',
                  });
                } else if (isExperienceCertificate.length === 0) {
                  showMessage({
                    message: t(
                      'createprofile4.uploadExperienceCertificateWarning',
                    ),
                    type: 'warning',
                  });
                } else {
                  RegisterUser();
                }
              }}
            />
          </View>
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
            <TouchableOpacity
              onPress={() => {
                bottomSheetRef.current.close();
              }}
              style={{
                marginHorizontal: wp(5),
                alignItems: 'flex-end',
                marginTop: hp(1),
              }}>
              <Image
                source={icons.CloseIcon}
                style={{height: hp(2), width: hp(2)}}
              />
            </TouchableOpacity>
            <View
              style={{
                borderWidth: 1,
                marginBottom: hp(1),
                borderColor: 'lightgray',
                marginTop: hp(2),
              }}></View>
            <TouchableOpacity
              style={{}}
              onPress={() => {
                IDProofTakePicture();
              }}>
              <Text
                style={{
                  fontFamily: 'Nunito-SemiBold',
                  color: '#2B2A2A',
                  fontSize: fontSize(18),
                  marginHorizontal: wp(5),
                }}>
                {t('createprofile4.takePictures')}
              </Text>
            </TouchableOpacity>
            <View
              style={{
                borderWidth: 1,
                marginTop: hp(1),
                borderColor: 'lightgray',
              }}></View>
            <TouchableOpacity
              style={{}}
              onPress={() => {
                pickIDProofImages();
              }}>
              <Text
                style={{
                  fontFamily: 'Nunito-SemiBold',
                  color: '#2B2A2A',
                  fontSize: fontSize(18),
                  marginHorizontal: wp(5),
                  marginTop: hp(1),
                }}>
                {t('createprofile4.selectPictures')}
              </Text>
            </TouchableOpacity>
            <View
              style={{
                borderWidth: 1,
                marginTop: hp(1),
                borderColor: 'lightgray',
              }}></View>
            <TouchableOpacity
              style={{}}
              onPress={() => {
                PickIDProofDocuments();
              }}>
              <Text
                style={{
                  fontFamily: 'Nunito-SemiBold',
                  color: '#2B2A2A',
                  fontSize: fontSize(18),
                  marginHorizontal: wp(5),
                  marginTop: hp(1),
                }}>
                {t('createprofile4.selectDocuments')}
              </Text>
            </TouchableOpacity>
            <View
              style={{
                borderWidth: 1,
                marginTop: hp(1),
                borderColor: 'lightgray',
              }}></View>
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
            <TouchableOpacity
              onPress={() => {
                certificateBottomSheetRef.current.close();
              }}
              style={{
                marginHorizontal: wp(5),
                alignItems: 'flex-end',
                marginTop: hp(1),
              }}>
              <Image
                source={icons.CloseIcon}
                style={{height: hp(2), width: hp(2)}}
              />
            </TouchableOpacity>
            <View
              style={{
                borderWidth: 1,
                marginBottom: hp(1),
                borderColor: 'lightgray',
                marginTop: hp(2),
              }}></View>
            <TouchableOpacity
              style={{}}
              onPress={() => {
                ExperienceCertificateTakePicture();
              }}>
              <Text
                style={{
                  fontFamily: 'Nunito-SemiBold',
                  color: '#2B2A2A',
                  fontSize: fontSize(18),
                  marginHorizontal: wp(5),
                }}>
                {t('createprofile4.takePictures')}
              </Text>
            </TouchableOpacity>
            <View
              style={{
                borderWidth: 1,
                marginTop: hp(1),
                borderColor: 'lightgray',
              }}></View>
            <TouchableOpacity
              style={{}}
              onPress={() => {
                ExperienceCertificatePickImages();
              }}>
              <Text
                style={{
                  fontFamily: 'Nunito-SemiBold',
                  color: '#2B2A2A',
                  fontSize: fontSize(18),
                  marginHorizontal: wp(5),
                  marginTop: hp(1),
                }}>
                {t('createprofile4.selectPictures')}
              </Text>
            </TouchableOpacity>
            <View
              style={{
                borderWidth: 1,
                marginTop: hp(1),
                borderColor: 'lightgray',
              }}></View>
            <TouchableOpacity
              style={{}}
              onPress={() => {
                ExperienceCertificatePickDocuments();
              }}>
              <Text
                style={{
                  fontFamily: 'Nunito-SemiBold',
                  color: '#2B2A2A',
                  fontSize: fontSize(18),
                  marginHorizontal: wp(5),
                  marginTop: hp(1),
                }}>
                {t('createprofile4.selectDocuments')}
              </Text>
            </TouchableOpacity>
            <View
              style={{
                borderWidth: 1,
                marginTop: hp(1),
                borderColor: 'lightgray',
              }}></View>
          </RBSheet>
        </SafeAreaView>
      </ScrollView>
    </>
  );
};

export default CreateProfile4;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderRadius: 30,
    color: '#AAAAAA',
    fontSize: fontSize(15),
    fontFamily: 'Inter-Regular',
    paddingVertical: hp(1.4),
    paddingHorizontal: wp(4),
    elevation: 6,
    shadowColor: 'black',
    shadowOffset: {width: -1, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 0,
    backgroundColor: '#FFFFFF',
    marginHorizontal: wp(6),
    marginTop: hp(1.6),
  },
  iconContainer: {
    padding: 5,
    position: 'absolute',
    right: 40,
    top: 25,
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
});
