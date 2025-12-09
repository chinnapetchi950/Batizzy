import React, {useState} from 'react';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {
  Image,
  Platform,
  SafeAreaView,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation, useRoute} from '@react-navigation/native';
import {routes} from '../../navigation/Routes';
import {hp, StatusBarHeight, wp} from '../../helper/constants';
import {icons} from '../../helper/imageConstants';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import FontFamily from '../../helper/FontFamily';
import Colors from '../../helper/Colors';

const EditLocationScreen = () => {
  const navigation = useNavigation();
  const {t} = useTranslation(); // Fetch translations using t()

  const [currentLocation, setCurrentLocation] = useState(null);

  const handleLocationSelect = (data, details) => {
    setCurrentLocation({
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
    });
    navigation.navigate(routes.AddMarketplace, {
      EditAddress: data.description,
      latEdit: details.geometry.location.lat,
      langEdit: details.geometry.location.lng,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Image
          resizeMode="contain"
          source={icons.backIcon}
          style={styles.backIcon}
        />
      </TouchableOpacity>
      <View style={styles.autocompleteContainer}>
        <GooglePlacesAutocomplete
          placeholder={t('location.selectLocation')} // Translate placeholder text
          onPress={(data, details) => {
            handleLocationSelect(data, details);
          }}
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
              borderWidth: 0.5,
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 0 : StatusBarHeight,
    backgroundColor: 'white',
    justifyContent: 'space-between',
  },
  backIcon: {
    height: wp(5),
    width: wp(5),
    marginHorizontal: wp(5),
    marginTop: hp(2),
  },
  autocompleteContainer: {
    flex: 1,
    marginHorizontal: wp(5),
    zIndex: 999,
    marginTop: hp(2),
  },
});

const autocompleteStyles = {
  textInputContainer: {
    elevation: 6,
    shadowColor: 'black',
    shadowOffset: {width: -1, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 0,
    borderRadius: wp(2),
    fontSize: responsiveFontSize(1.88),
    color: 'gray',
    // backgroundColor: 'white',
    marginBottom: hp(1),
    zIndex: 999,
  },
  textInput: {
    flex: 1,
    color: '#5d5d5d',
    height: 50,
    fontSize: responsiveFontSize(1.88),
  },
  listView: {
    width: '100%',
    zIndex: 999,
  },
  row: {
    backgroundColor: 'lightgray',
  },
};

export default EditLocationScreen;
