import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Image,
  Pressable,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {icons} from '../helper/imageConstants';
import {deviceHeight, hp, wp} from '../helper/constants';
import {useNavigation} from '@react-navigation/native';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import Colors from '../helper/Colors';

const CustomSearchBar = ({
  onBackPress,
  onSearch,
  value,
  isBackBtn,
  isFilterBtn,
  onPressFilter,
  placeholder,
  isProfileImage,
  profileImageSource,
  onPressProfile,
  width,
  containerStyle,
  onChangeText,
  onPressSearch,
}) => {
  const navigation = useNavigation();
  return (
    <View style={[styles.container, {containerStyle}]}>
      {isBackBtn && (
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
      )}
      {isProfileImage && (
        <Pressable onPress={onPressProfile}>
          <Image
            resizeMode="contain"
            source={profileImageSource}
            style={styles.profileImage}
          />
        </Pressable>
      )}
      <View style={[styles.searchContainer, {width: width}]}>
        <TextInput
          value={value}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.fontDarkGray}
          onChangeText={onChangeText}
        />
        <TouchableOpacity onPress={onPressSearch}>
          <Image source={icons.searchIcon} style={styles.searchIcon} />
        </TouchableOpacity>
      </View>
      {isFilterBtn && (
        <TouchableOpacity onPress={onPressFilter} style={styles.filterButton}>
          <ImageBackground
            resizeMode="cover"
            source={icons.Bg}
            style={styles.filterButtonBackground}>
            <Image
              resizeMode="contain"
              source={icons.filterIcon}
              style={styles.backButtonIcon}
            />
          </ImageBackground>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
  },
  searchIcon: {
    height: hp(2),
    width: hp(2),
  },
  input: {
    fontSize: responsiveFontSize(1.41),
    fontFamily: 'Inter-Regular',
    height: 100,
  },
  backButton: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonBackground: {
    height: hp(4.8),
    width: hp(4.8),
  },
  filterButtonBackground: {
    height: hp(5.6),
    width: hp(5.6),
  },
  backButtonIcon: {
    height: 16,
    width: 16,
    alignSelf: 'center',
  },
  profileImage: {
    height: hp(5.3),
    width: hp(5.3),
    borderRadius: 100,
    resizeMode: 'cover',
  },
});

export default CustomSearchBar;
