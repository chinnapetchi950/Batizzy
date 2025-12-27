import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  Pressable,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {icons} from '../../../helper/imageConstants';
import {hp, wp} from '../../../helper/constants';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import {useNavigation} from '@react-navigation/native';
import {routes} from '../../../navigation/Routes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_URL, IMAGE_URL} from '../../../helper/ApiConstant';

const MarketplaceAccountScreen = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const [isuserData, setUserData] = useState('');

  useEffect(() => {
    GetUserData();
  }, []);

  const GetUserData = async () => {
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
        if (res.status === true) {
          setUserData(res.data);
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
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
            <Text style={styles.editProfileText}>
              {t('marketplaceAccountScreen.title')}
            </Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.profileContainer}>
          {isuserData.profile_image ? (
            <Image
              source={{uri: IMAGE_URL + isuserData.profile_image}}
              style={styles.profileImage}
            />
          ) : (
            <Image source={icons.dummyUser} style={styles.profileImage} />
          )}
          <View>
            <Text style={styles.profileName}>{isuserData?.name}</Text>
          </View>
        </View>

        <View style={styles.divider} />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('marketplaceAccountScreen.selling')}
          </Text>
          <Pressable
            style={styles.optionItem}
            onPress={() => {
              navigation.navigate(routes.YourListings);
            }}>
            <Image source={icons.ListingIcon} style={styles.sellItemIcon} />
            <Text style={styles.optionText}>
              {t('marketplaceAccountScreen.yourListings')}
            </Text>
          </Pressable>
          <Pressable
            style={styles.optionItem}
            onPress={() => {
              navigation.navigate(routes.FollowersList);
            }}>
            <Image source={icons.ListingIcon} style={styles.sellItemIcon} />
            <Text style={styles.optionText}>
              {t('marketplaceAccountScreen.marketplaceFollowers')}
            </Text>
          </Pressable>
        </View>
        <View style={styles.divider} />
        {/* Interests Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('marketplaceAccountScreen.interests')}
          </Text>
          <Pressable
            style={styles.optionItem}
            onPress={() => {
              navigation.navigate(routes.FollowingList);
            }}>
            <Image source={icons.ListingIcon} style={styles.sellItemIcon} />
            <Text style={styles.optionText}>
              {t('marketplaceAccountScreen.following')}
            </Text>
          </Pressable>
        </View>
        <View style={styles.divider} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  profileImage: {
    width: hp(4.85),
    height: hp(4.85),
    borderRadius: 30,
    marginRight: 16,
  },
  profileName: {
    fontSize: responsiveFontSize(2.35),
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
  profileSubtitle: {
    fontSize: responsiveFontSize(1.41),
    fontFamily: 'Inter-Medium',
    color: '#754595',
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  buyItemIcon: {
    height: hp(2.8),
    width: hp(2.8),
  },
  sellItemIcon: {
    height: hp(2.2),
    width: hp(2.2),
    resizeMode: 'contain',
  },
  card: {
    alignItems: 'flex-start',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderRadius: 10,
    width: '48%',
    borderWidth: 1,
    borderColor: '#6B6B6B',
  },
  cardText: {
    fontSize: responsiveFontSize(1.41),
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1D',
    marginTop: 2,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: responsiveFontSize(1.88),
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionText: {
    marginLeft: 16,
    fontSize: responsiveFontSize(1.64),
    fontFamily: 'Inter-Medium',
    color: '#1D1D1D',
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
  divider: {
    width: '100%',
    backgroundColor: 'lightgray',
    height: 4,
  },
});

export default MarketplaceAccountScreen;
