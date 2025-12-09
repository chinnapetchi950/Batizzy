import React, {useState} from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import {useNavigation} from '@react-navigation/native';
import {icons} from '../../helper/imageConstants';
import {hp, wp} from '../../helper/constants';
import CustomSearchBar from '../../common/CustomSearchBar';
import AllFollowersList from './AllFollowersList';
import FollowRequestList from './FollowRequestList';

const FollowersList = () => {
  const navigation = useNavigation();
  const {t} = useTranslation(); // Fetch translation using useTranslation()

  const [isAllFollowers, setAllFollowers] = useState(true);
  const [isFollowRequest, setFollowRequest] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // Manage search term here

  // Handle search input
  const handleSearch = term => {
    setSearchTerm(term); // Update search term on input change
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <View style={styles.threeDotContainer}>
          <Pressable
            onPress={() => {
              navigation.goBack();
            }}
            style={styles.pressable}>
            <ImageBackground
              resizeMode="cover"
              source={icons.Bg}
              style={styles.imageBackground}>
              <Image
                resizeMode="contain"
                source={icons.backIcon}
                style={styles.backIcon}
              />
            </ImageBackground>
          </Pressable>
          <Text style={styles.headerText}>{t('followersList.header')}</Text>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.tabHeader}>
        <Pressable
          onPress={() => {
            setAllFollowers(true);
            setFollowRequest(false);
          }}>
          <Text style={isAllFollowers ? styles.activeTab : styles.inactiveTab}>
            {t('followersList.allFollowers')}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setAllFollowers(false);
            setFollowRequest(true);
          }}>
          <Text style={isFollowRequest ? styles.activeTab : styles.inactiveTab}>
            {t('followersList.followRequests')}
          </Text>
        </Pressable>
      </View>
      {isAllFollowers && <AllFollowersList searchTerm={searchTerm} />}
      {isFollowRequest && <FollowRequestList searchTerm={searchTerm} />}
    </View>
  );
};

export default FollowersList;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  tabHeader: {
    flexDirection: 'row',
    padding: 16,
  },
  threeDotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBackground: {
    height: hp(4.8),
    width: hp(4.8),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
  },
  backIcon: {
    height: hp(1.37),
    width: wp(4),
    alignSelf: 'center',
  },
  editIcon: {
    height: hp(2.4),
    width: hp(2.4),
  },
  searchIcon: {
    height: hp(2),
    width: hp(2),
  },
  headerText: {
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    fontSize: responsiveFontSize(1.88),
    marginLeft: 16,
  },
  divider: {
    width: '100%',
    backgroundColor: 'lightgray',
    height: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchBarContainer: {
    margin: 20,
  },
  activeTab: {
    fontFamily: 'Inter-Bold',
    fontSize: responsiveFontSize(1.88),
    color: '#754595',
    marginRight: 16,
  },
  inactiveTab: {
    color: '#6B6B6B',
    fontFamily: 'Inter-Medium',
    fontSize: responsiveFontSize(1.88),
    marginRight: 16,
  },
});
