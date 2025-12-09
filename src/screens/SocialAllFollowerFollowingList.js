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
import CustomSearchBar from '../common/CustomSearchBar';
import {icons} from '../helper/imageConstants';
import {deviceWidth, hp, wp} from '../helper/constants';
import SocialFollowingList from './SocialFollowingList';
import SocialFollowersList from './SocialFollowersList';
import SocialFollowRequestList from './SocialFollowRequestList';

const SocialAllFollowerFollowingList = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();

  const [isAllFollowers, setAllFollowers] = useState(true);
  const [isAllFollowing, setAllFollowing] = useState(false);
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
          <Text style={styles.headerText}>
            {t('socialAllFollowingList.followersList')}
          </Text>
        </View>
      </View>
      <View style={styles.searchBarContainer}>
        <CustomSearchBar
          onBackPress={{}}
          onSearch={handleSearch} // Handle search input
          placeholder={t('socialAllFollowingList.searchListings')}
          width={deviceWidth - 40}
        />
      </View>
      <View style={styles.divider} />
      <View style={styles.tabHeader}>
        <Pressable
          onPress={() => {
            setAllFollowers(true);
            setAllFollowing(false);
            setFollowRequest(false);
          }}>
          <Text style={isAllFollowers ? styles.activeTab : styles.inactiveTab}>
            {t('socialAllFollowingList.followers')}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setAllFollowers(false);
            setAllFollowing(true);
            setFollowRequest(false);
          }}>
          <Text style={isAllFollowing ? styles.activeTab : styles.inactiveTab}>
            {t('socialAllFollowingList.following')}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setAllFollowers(false);
            setAllFollowing(false);
            setFollowRequest(true);
          }}>
          <Text style={isFollowRequest ? styles.activeTab : styles.inactiveTab}>
            {t('socialAllFollowingList.followRequests')}
          </Text>
        </Pressable>
      </View>
      {isAllFollowers && <SocialFollowersList searchTerm={searchTerm} />}
      {isAllFollowing && <SocialFollowingList searchTerm={searchTerm} />}
      {isFollowRequest && <SocialFollowRequestList searchTerm={searchTerm} />}
    </View>
  );
};
export default SocialAllFollowerFollowingList;

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
    marginTop: 5,
    marginBottom: 15,
    marginHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
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
