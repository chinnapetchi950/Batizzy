import React, {useState} from 'react';
import 'react-native-get-random-values';
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
import {useNavigation} from '@react-navigation/native';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import {routes} from '../../../navigation/Routes';
import {hp, StatusBarHeight, wp} from '../../../helper/constants';
import {icons} from '../../../helper/imageConstants';

const ChangeLocation = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const [currentLocation, setCurrentLocation] = useState(null);

  const handleLocationSelect = (data, details) => {
    setCurrentLocation({
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
    });
    navigation.navigate(routes.MarketPlace, {
      ChangedAddress: data.description,
      Changedlat: details.geometry.location.lat,
      Changedlang: details.geometry.location.lng,
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
          // defaultValue={isSelectedAddress}
          placeholder={t('changeLocation.selectLocation')}
          onPress={(data, details) => {
            handleLocationSelect(data, details);
          }}
          query={{
            key: 'AIzaSyCceRTsiY-2UPVwytF6wytwaGmonWjvTHo',
            language: 'en',
          }}
          numberOfLines={1}
          fetchDetails
          listView={{backgroundColor: 'lightray'}}
          // styles={autocompleteStyles}
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

export default ChangeLocation;
