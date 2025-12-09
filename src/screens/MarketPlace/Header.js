import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import {hp, wp} from '../../helper/constants';
import {icons} from '../../helper/imageConstants';
import {useNavigation} from '@react-navigation/native';
import {routes} from '../../navigation/Routes';
import TopBar from './TopBar';

const Header = ({
  title,
  ViewAccountText,
  onPressViewAccount,
  onPressSearchIcon,
  notiCount,
}) => {
  const navigation = useNavigation();
  return (
    <>
      <View style={styles.wrapper}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={onPressViewAccount}>
            <Text style={styles.viewAccountText}>{ViewAccountText}</Text>
          </Pressable>
        </View>
        <View style={styles.IconsContainer}>
          <Pressable onPress={onPressSearchIcon}>
            <Image source={icons.searchIcon} style={styles.searchIcon} />
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate(routes.NotificationListScreen)}>
            <Image
              source={icons.notificationIcon}
              style={styles.notificationIcon}
            />
          </Pressable>
          {notiCount != 0 && (
            <Text style={styles.notificationCount}>{notiCount}</Text>
          )}
        </View>
      </View>
      <TopBar
        onPresSell={() => {
          navigation.navigate(routes.AddMarketplace);
        }}
        onPresCategory={() => {
          navigation.navigate(routes.Category);
        }}
        onPressAdd={() => navigation.navigate(routes.AddMarketplace)}
      />
    </>
  );
};
export default Header;

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  title: {
    color: 'black',
    fontSize: responsiveFontSize(2.4),
    fontFamily: 'Inter-SemiBold',
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
    left: 32,
  },
  chatIcon: {
    height: hp(3),
    width: hp(3),
  },
});
