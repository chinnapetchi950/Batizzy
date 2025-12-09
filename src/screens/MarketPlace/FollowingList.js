import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  Pressable,
  ImageBackground,
  RefreshControl,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {showMessage} from 'react-native-flash-message';
import {icons} from '../../helper/imageConstants';
import {deviceHeight, hp, wp} from '../../helper/constants';
import CustomSearchBar from '../../common/CustomSearchBar';
import Colors from '../../helper/Colors';
import {BASE_URL, IMAGE_URL} from '../../helper/ApiConstant';
import Loader from '../../common/Loader';

const FollowingList = () => {
  const navigation = useNavigation();
  const {t} = useTranslation(); // Fetch translation using useTranslation()

  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFollowingList, setIsFollowingList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      const onScreenFocus = async () => {
        await getFollowingList();
      };
      onScreenFocus();
    }, [getFollowingList]),
  );

  const getFollowingList = useCallback(async () => {
    try {
      setIsLoading(true);
      const Token = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${BASE_URL}following`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${Token}`,
          Accept: 'application/json',
        },
      });
      const res = await response.json();
      setIsLoading(false);
      if (res.status === true) {
        setIsFollowingList(res.data);
      }
    } catch (error) {
      setIsLoading(false);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unfollowUser = async userID => {
    setIsLoading(true);
    var Token = await AsyncStorage.getItem('accessToken');
    await fetch(BASE_URL + 'unfollow/' + userID, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + Token,
        Accept: 'application/json',
      },
    })
      .then(res => res.json())
      .then(res => {
        setIsLoading(false);
        if (res.status === true) {
          getFollowingList();
          showMessage({
            message: res.message,
            floating: true,
            position: 'top',
            icon: 'success',
            type: 'success',
          });
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

  const renderItem = ({item}) => {
    return (
      <View style={styles.listItem}>
        {item?.profile_image ? (
          <Image
            source={{uri: IMAGE_URL + item?.profile_image}}
            style={styles.avatar}
          />
        ) : (
          <Image source={icons.dummyUser} style={styles.avatar} />
        )}

        <View style={styles.nameContainer}>
          <Text style={styles.name}>{item?.following?.name}</Text>
          <Text style={styles.listingtext}>
            {item?.following?.marketplaces_count
              ? item?.following?.marketplaces_count +
                ' ' +
                t('followingList.listing')
              : ''}
          </Text>
        </View>
        <Pressable
          style={styles.followingButton}
          onPress={() => {
            unfollowUser(item?.following?.id, item?.following_type);
          }}>
          {/* <Image source={icons.FollowIcon} style={styles.followingIocn} /> */}
          <Text style={styles.followingText}>Following</Text>
        </Pressable>
      </View>
    );
  };

  const filteredFollowings = isFollowingList.filter(item =>
    item?.following?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const emptyMesRender = () => {
    return (
      <View style={{flex: 1}}>
        <Text style={[styles.emptyMsg]}>{t('error.recordNotFound')}</Text>
      </View>
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    getFollowingList();
    setRefreshing(false);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerMain}>
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
          <Text style={styles.headerText}>{t('followingList.header')}</Text>
        </View>
      </View>
      <View style={styles.searchBarContainer}>
        {/* <CustomSearchBar
          onBackPress={{}}
          onSearch={text => setSearchQuery(text)}
          placeholder={t('followingList.searchPlaceholder')}
        /> */}
      </View>

      <FlatList
        scrollEnabled
        data={filteredFollowings}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={() => emptyMesRender()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      {isLoading && <Loader />}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    padding: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  avatar: {
    width: hp(4.6),
    height: hp(4.6),
    borderRadius: 20,
    marginRight: 16,
  },
  name: {
    flex: 1,
    color: '#000000',
    fontFamily: 'Inter-SemiBold',
    fontSize: responsiveFontSize(2.35),
  },
  listingtext: {
    flex: 1,
    color: '#393939',
    fontFamily: 'Inter-regular',
    fontSize: responsiveFontSize(1.41),
  },
  followingButton: {
    backgroundColor: '#754595',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  followingIocn: {
    width: 22,
    height: 18,
    marginRight: 10,
  },
  followingText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    fontSize: responsiveFontSize(1.41),
  },
  menuButton: {
    marginLeft: 10,
  },
  menuText: {
    fontSize: 24,
  },
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerMain: {
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
  },
  nameContainer: {
    flex: 1,
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
  emptyMsg: {
    color: Colors.fontDarkGray,
    fontSize: responsiveFontSize(2),
    paddingVertical: 10,
    textAlign: 'center',
    marginTop: deviceHeight / 4,
  },
});

export default FollowingList;
