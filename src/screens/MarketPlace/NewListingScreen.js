import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {hp, wp} from '../../helper/constants';
import {icons} from '../../helper/imageConstants';
import {useNavigation, useRoute} from '@react-navigation/native';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import InputField from '../../common/InputField';
import BottomSheetCondition from '../../common/BottomSheetCondition';
import RBSheet from 'react-native-raw-bottom-sheet';
import {launchCamera} from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import {showMessage} from 'react-native-flash-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import BigInputField from '../../common/BigInputField';
import Geocoder from 'react-native-geocoding';
import {routes} from '../../navigation/Routes';
import Modal from 'react-native-modal';
import Colors from '../../helper/Colors';
import FontFamily from '../../helper/FontFamily';
import Input from '../../common/Input';
import {BASE_URL, IMAGE_URL} from '../../helper/ApiConstant';
import {useLanguage} from '../../context/LanguageContext';
import Loader from '../../common/Loader';

const NewListingScreen = () => {
  const navigation = useNavigation();
  const bottomSheetRef = useRef();
  const route = useRoute();
  const EditAddress = route.params?.EditAddress;
  const latEdit = route.params?.latEdit;
  const langEdit = route.params?.langEdit;
  const [isPhotos, setIsPhotos] = useState([]);
  const [isPublishModalVisible, setIsPublishModalVisible] = useState(false);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [isConditionSheetOpen, setIsConditionSheetOpen] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [selectedConditionLabel, setSelectedConditionLabel] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isSelectedCategoryID, setSelectedCategoryID] = useState(null);
  const [isDescription, setIsDescription] = useState('');
  const [isCurrentAddress, setCurrentAddress] = useState(
    'Fetching location...',
  );
  const [isAllCategoryList, setIsAllCategoryList] = useState([]);
  const [isCurrentLocation, setCurrentLocation] = useState('');
  const [isuserData, setUserData] = useState('');
  const [isTitle, setTitle] = useState('');
  const [isPrice, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {selectedLanguage, changeLanguage} = useLanguage();

  const conditions = [
    {label: t('marketplace.new'), value: 'new'},
    {label: t('marketplace.old_like_new'), value: 'old_like_new'},
    {label: t('marketplace.used_good'), value: 'used_good'},
    {label: t('marketplace.used_fair'), value: 'used_fair'},
  ];

  useEffect(() => {
    getCategoryData();
  }, []);

  const getCategoryData = async () => {
    setIsLoading(true);
    var Token = await AsyncStorage.getItem('accessToken');
    await fetch(BASE_URL + 'categories', {
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
          setIsAllCategoryList(res.data);
        }
      })
      .catch(error => {
        setIsLoading(false);
        console.error(error);
      });
  };

  useEffect(() => {
    GetUserData();
  }, []);

  const GetUserData = async () => {
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
        }
      })
      .catch(error => {
        setIsLoading(false);
        console.error(error);
      });
  };

  const CreateMarketPlace = async () => {
    var Token = await AsyncStorage.getItem('accessToken');
    setIsLoading(true);
    var formData = new FormData();
    formData.append('title', isTitle);
    formData.append('category_id', isSelectedCategoryID);
    formData.append('condition', selectedCondition);
    formData.append('price', isPrice);
    formData.append('description', isDescription);
    formData.append('location', EditAddress ? EditAddress : isCurrentAddress);
    formData.append('lat', latEdit ? latEdit : isCurrentLocation.latitude);
    formData.append('lng', langEdit ? langEdit : isCurrentLocation.longitude);
    isPhotos.forEach((image, index) => {
      formData.append('attachments[]', {
        uri: image.uri,
        type: image.type,
        name: image.name,
      });
    });
    await fetch(BASE_URL + 'marketplaces', {
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
        if (res.status === true) {
          setIsPublishModalVisible(true);
        } else {
          handleApiError(res);
        }
      })
      .catch(error => {
        setIsLoading(false);
        console.error(error);
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

  const onPressPublish = () => {
    if (isPhotos.length === 0) {
      showMessage({
        message: 'Please Upload Images ',
        type: 'warning',
      });
    } else if (isTitle === '') {
      showMessage({
        message: 'Please Enter Title',
        type: 'warning',
      });
    } else if (isPrice === '') {
      showMessage({
        message: 'Please Enter Price',
        type: 'warning',
      });
    } else if (!isSelectedCategoryID) {
      showMessage({
        message: 'Please Select Category',
        type: 'warning',
      });
    } else if (!selectedCondition) {
      showMessage({
        message: 'Please Select Condition',
        type: 'warning',
      });
    } else {
      CreateMarketPlace();
    }
  };

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
            setCurrentAddress(address);
          } catch (error) {
            console.error(error);
            setCurrentAddress('Location not found');
          }
        },
        error => {
          console.error(error);
          setCurrentAddress('Location not found');
        },
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
      );
    };

    fetchCurrentLocation();
  }, [isCurrentAddress]);

  const renderCategoryItem = ({item}) => {
    return (
      <Pressable
        style={styles.categoryContainer}
        onPress={() => {
          setSelectedCategory(item.name); // Set selected category name
          setSelectedCategoryID(item.id); // Set selected category name
          toggleCategorySheet(); // Close the category sheet
        }}>
        <ImageBackground source={icons.Bg} style={styles.categoryBG}>
          <Image
            source={{uri: IMAGE_URL + item.image}}
            style={styles.categoryIcon}
          />
        </ImageBackground>
        <Text style={styles.categoryText}>{item.name}</Text>
      </Pressable>
    );
  };

  const handleReset = () => {
    setSelectedCondition(null);
    setSelectedConditionLabel(null);
    toggleConditionSheet();
  };

  const toggleCategorySheet = () => {
    setIsCategorySheetOpen(!isCategorySheetOpen);
  };

  const toggleConditionSheet = () => {
    setIsConditionSheetOpen(!isConditionSheetOpen);
  };

  const TakePicture = async () => {
    if (isPhotos.length >= 10) {
      showMessage({
        message: 'You can only upload up to 10 images.',
        type: 'warning',
      });
      return;
    }
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

          setIsPhotos(prevDocuments => [...prevDocuments, newDocument]);
          bottomSheetRef.current.close();
        }
      }
    });
  };

  const PickPhotos = async () => {
    if (isPhotos.length >= 10) {
      showMessage({
        message: 'You can only upload up to 10 images.',
        type: 'warning',
      });
      return;
    }
    try {
      const results = await DocumentPicker.pick({
        type: [DocumentPicker.types.images],
        allowMultiSelection: true,
      });

      const currentImageCount = isPhotos.length;
      const selectedImageCount = results.length;

      // Check if adding the new images will exceed the limit of 10
      if (currentImageCount + selectedImageCount > 10) {
        showMessage({
          message: 'You can only upload up to 10 images.',
          type: 'warning',
        });
        return;
      }

      // If within the limit, add the selected images
      const newDocuments = results.map(result => ({
        uri: result.uri,
        type: result.type,
        name: result.name,
      }));

      setIsPhotos(prevDocuments => [...prevDocuments, ...newDocuments]);
      bottomSheetRef.current.close();
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
      }
    }
  };

  const renderPhotos = ({item, index}) => (
    <View style={styles.imageContainer}>
      <Image source={{uri: item.uri}} style={styles.image} />
      <TouchableOpacity
        onPress={() => handleRemoveDocument(index)}
        style={styles.removeButton}>
        <Image
          resizeMode="contain"
          source={icons.closeBtn}
          style={styles.removeIcon}
        />
      </TouchableOpacity>
    </View>
  );

  const handleRemoveDocument = index => {
    const updatedDocuments = [...isPhotos];
    updatedDocuments.splice(index, 1);
    setIsPhotos(updatedDocuments);
  };

  return (
    <>
      <View style={styles.wrapper}>
        {/* <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.wrapper}
        contentContainerStyle={styles.scrollContainer}> */}
        {/* Header with back button */}
        <View style={styles.container}>
          <View style={styles.leftContainer}>
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
            <View>
              <Text style={styles.editProfileText}>{'New Listing'}</Text>
            </View>
          </View>
          <View style={styles.rightContainer}>
            <Pressable
              onPress={() => {
                onPressPublish();
              }}>
              <Text style={styles.publishText}>{'Publish'}</Text>
            </Pressable>
          </View>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}>
          <View style={styles.userContainer}>
            <View style={styles.header}>
              {isuserData?.profile_image != null ? (
                <Image
                  source={{uri: IMAGE_URL + isuserData.profile_image}}
                  style={styles.profileImage}
                />
              ) : (
                <Image source={icons.dummyUser} style={styles.profileImage} />
              )}
              <View style={styles.headerText}>
                <Text style={styles.name}>{isuserData?.name}</Text>
                <View style={styles.listingInfo}>
                  <Text style={styles.listingText}>Listing on Marketplace</Text>
                  <Image source={icons.tab5} style={styles.listIcon} />
                </View>
              </View>
            </View>

            <Pressable
              style={styles.photoBox}
              onPress={() => {
                bottomSheetRef.current.open();
              }}>
              <View style={styles.iconContainer}>
                <Image source={icons.AddPhoto} style={styles.addIcon} />
              </View>
              <Text style={styles.addPhotoText}>Add photos</Text>
            </Pressable>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Choose your listings main photo first.
              </Text>
              <Text style={styles.photoCount}>
                Photos: {isPhotos.length}/10
              </Text>
            </View>
          </View>
          {isPhotos.length > 0 && (
            <FlatList
              data={isPhotos}
              renderItem={renderPhotos}
              keyExtractor={item => item.name}
              numColumns={3}
              style={styles.uploadImageContainer}
              contentContainerStyle={styles.gallery}
            />
          )}
          <Text style={[styles.inputLabel]}>{'Product Title'}</Text>
          <Input
            placeholder={'Product Title'}
            titleColor={'#4A4A4A'}
            onChangeText={text => {
              setTitle(text);
            }}
          />
          <View>
            <Text style={[styles.inputLabel]}>{'Price'}</Text>
            <Input
              placeholder={'Price'}
              titleColor={'#4A4A4A'}
              onChangeText={text => {
                setPrice(text);
              }}
            />
          </View>

          <InputField
            titleColor={'#4A4A4A'}
            title={'Category'}
            placeholder={'Category'}
            isDropdown
            editable={false}
            onPress={() => {
              toggleCategorySheet();
            }}
            value={selectedCategory}
          />
          <InputField
            titleColor={'#4A4A4A'}
            title={'Condition'}
            placeholder={'Condition'}
            isDropdown
            editable={false}
            onPress={() => {
              toggleConditionSheet();
            }}
            value={selectedConditionLabel}
          />
          <View style={{marginTop: '2%'}}></View>
          <BigInputField
            titleColor={'#4A4A4A'}
            title={'Description (Optional)'}
            placeholder={'Description'}
            onChangeText={text => {
              setIsDescription(text);
            }}
            value={isDescription}
          />
          <Text style={styles.locationText}>Location</Text>
          <View style={styles.addressContainer}>
            <Text style={styles.AddressText}>
              {EditAddress ? EditAddress : isCurrentAddress}
            </Text>
            <Pressable
              onPress={() => {
                navigation.navigate(routes.EditLocation);
              }}>
              <Text style={styles.editText}>Edit</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
      {isCategorySheetOpen && (
        <BottomSheetCondition
          maxHeight={hp(80)}
          isOpen={isCategorySheetOpen}
          onClose={toggleCategorySheet}
          renderContent={() => {
            return (
              <View>
                <Text style={styles.cotegoryTitleText}>Select Category</Text>
                <FlatList
                  showsVerticalScrollIndicator={false}
                  data={isAllCategoryList}
                  keyExtractor={item => item.id}
                  renderItem={renderCategoryItem}
                  contentContainerStyle={styles.categorycontentContainerStyle}
                />
              </View>
            );
          }}
        />
      )}
      {isConditionSheetOpen && (
        <BottomSheetCondition
          maxHeight={700}
          isOpen={isConditionSheetOpen}
          onClose={toggleConditionSheet}
          renderContent={() => {
            return (
              <View style={styles.conditionContainer}>
                <View style={styles.conditionHeader}>
                  <Text style={styles.conditionHeaderText}>Condition</Text>
                  <Pressable onPress={handleReset}>
                    <Text style={styles.resetText}>Reset</Text>
                  </Pressable>
                </View>
                <View style={styles.separator} />
                {conditions.map((condition, index) => {
                  return (
                    <View key={index} style={styles.row}>
                      <Text style={styles.conditionText}>
                        {condition.label}
                      </Text>
                      <Pressable
                        style={styles.radioButton}
                        onPress={() => {
                          setSelectedCondition(condition.value);
                          setSelectedConditionLabel(condition.label);
                          toggleConditionSheet();
                        }}>
                        <Image
                          source={
                            selectedCondition === condition.value
                              ? icons.radioFill
                              : icons.radioBlank
                          }
                          style={styles.radioIcon}
                        />
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            );
          }}
        />
      )}
      <RBSheet
        ref={bottomSheetRef}
        closeOnPressMask={true}
        customStyles={{
          container: {
            borderTopLeftRadius: wp(8),
            borderTopRightRadius: wp(8),
            height: hp(18),
          },
        }}>
        <TouchableOpacity
          onPress={() => {
            bottomSheetRef.current.close();
          }}
          style={styles.closeButton}>
          <Image source={icons.closeBtn} style={styles.closeIcon} />
        </TouchableOpacity>
        <View style={styles.rbSheetseparator} />
        <TouchableOpacity
          onPress={() => {
            TakePicture();
            bottomSheetRef.current.close();
          }}>
          <Text style={styles.optionText}>{'Take Pictures'}</Text>
        </TouchableOpacity>
        <View style={styles.rbSheetseparator} />
        <TouchableOpacity
          onPress={() => {
            PickPhotos();
            bottomSheetRef.current.close();
          }}>
          <Text style={styles.optionText}>{'Select Pictures'}</Text>
        </TouchableOpacity>
      </RBSheet>
      {isLoading && <Loader />}
      <Modal isVisible={isPublishModalVisible} style={styles.modalContainer}>
        <View style={styles.publishModalContainer}>
          <Text style={styles.SuccesfullText}>
            Marketplace created successfully.
          </Text>
          <Pressable
            onPress={() => {
              setIsPublishModalVisible(false);
              navigation.goBack();
            }}>
            <Text style={styles.okButtonText}>OK</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  editProfileText: {
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    fontSize: responsiveFontSize(1.88),
    marginLeft: 16,
  },
  publishText: {
    fontFamily: 'Inter-SemiBold',
    color: '#754595',
    fontSize: responsiveFontSize(1.88),
    marginLeft: 16,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userContainer: {
    marginTop: hp(1),
    marginBottom: hp(2),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2.4),
  },
  profileImage: {
    width: hp(5),
    height: hp(5),
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
  photoBox: {
    height: hp(12.25),
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#00000036',
  },
  iconContainer: {
    width: hp(4.8),
    height: hp(4.8),
    borderRadius: 25,
    backgroundColor: '#ffd700',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  addIcon: {
    height: hp(2.5),
    width: hp(2.5),
  },
  addPhotoText: {
    fontSize: responsiveFontSize(1.41),
    fontFamily: 'Inter-Medium',
    color: 'black',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: responsiveFontSize(1.41),
    fontFamily: 'Inter-Regular',
    color: '#393939',
  },
  photoCount: {
    fontSize: responsiveFontSize(1.41),
    fontFamily: 'Inter-Regular',
    color: '#393939',
  },
  locationText: {
    fontSize: responsiveFontSize(1.7),
    fontFamily: 'Inter-SemiBold',
    color: '#4A4A4A',
  },
  AddressText: {
    fontSize: responsiveFontSize(1.41),
    fontFamily: 'Inter-Medium',
    color: '#6B6B6B',
    width: '80%',
  },
  editText: {
    fontSize: responsiveFontSize(1.41),
    fontFamily: 'Inter-SemiBold',
    color: '#754595',
    marginLeft: 5,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cotegoryTitleText: {
    fontSize: responsiveFontSize(1.88),
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginBottom: hp(2.4),
  },
  categoryIcon: {
    height: 24,
    width: 24,
  },
  categoryBG: {
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: responsiveFontSize(1.64),
    fontFamily: 'Inter-Medium',
    color: '#2D2C2C',
    marginLeft: wp(4),
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2.4),
  },
  categorycontentContainerStyle: {
    paddingBottom: 40,
  },
  conditionContainer: {
    paddingHorizontal: 10,
  },
  conditionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conditionHeaderText: {
    fontSize: responsiveFontSize(1.88),
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
  resetText: {
    fontSize: responsiveFontSize(1.41),
    fontFamily: 'Inter-Regular',
    color: '#754595',
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#dcdcdc',
    marginVertical: 10,
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
  rbSheetcontainer: {
    borderTopLeftRadius: wp(8),
    borderTopRightRadius: wp(8),
    height: hp(20),
  },
  closeButton: {
    marginHorizontal: wp(5),
    alignItems: 'flex-end',
    marginTop: hp(1),
  },
  closeIcon: {
    height: hp(5),
    width: hp(5),
  },
  rbSheetseparator: {
    borderWidth: 1,
    borderColor: 'lightgray',
    marginTop: hp(1),
    marginBottom: hp(1),
  },
  optionText: {
    fontFamily: 'Inter-Medium',
    color: '#000000',
    fontSize: responsiveFontSize(2.35),
    marginHorizontal: wp(5),
  },
  gallery: {
    paddingHorizontal: wp(2),
  },
  imageContainer: {
    position: 'relative',
    margin: wp(1),
  },
  uploadImageContainer: {
    marginBottom: hp(1.5),
  },
  image: {
    height: hp(11),
    width: hp(11),
    borderRadius: wp(2),
  },
  removeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
  },
  removeIcon: {
    height: hp(3),
    width: hp(3),
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
  publishModalContainer: {
    width: '95%',
    backgroundColor: 'white',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  SuccesfullText: {
    fontFamily: 'Inter-Medium',
    color: '#000000',
    fontSize: responsiveFontSize(2.35),
  },
  okButtonText: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#754595',
    color: '#FFFFFF',
    marginTop: 20,
  },
  inputLabel: {
    fontSize: responsiveFontSize(1.6),
    fontFamily: FontFamily.InterMedium,
    color: Colors.black,
    marginTop: '4%',
  },
});

export default NewListingScreen;
