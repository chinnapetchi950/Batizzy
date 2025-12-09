import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  Image,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import Colors from '../../helper/Colors';
import FontFamily from '../../helper/FontFamily';
import {icons} from '../../helper/imageConstants';
import InboxScreen from '../chat/InboxScreen';
import UnreadScreen from '../chat/UnreadScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import axios from 'axios';
import {BASE_URL} from '../../helper/ApiConstant';
import {routes} from '../../navigation/Routes';
import Loader from '../../common/Loader';

const ChatScreen = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();

  const [selectedTab, setSelectedTab] = useState('Inbox');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState('');

  useFocusEffect(
    useCallback(() => {
      const onScreenFocus = async () => {
        await getUserData();
      };
      onScreenFocus();
    }, [getUserData]),
  );

  const getUserData = async () => {
    var Token = await AsyncStorage.getItem('accessToken');
    setIsLoading(true);
    axios({
      method: 'get',
      url: BASE_URL + `profile`,
      headers: {
        Authorization: 'Bearer' + Token,
        Accept: 'application/json',
      },
    })
      .then(function (response) {
        setIsLoading(false);
        setUserData(response.data.data);
      })
      .catch(error => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      var Token = await AsyncStorage.getItem('accessToken');
      axios({
        method: 'get',
        url: BASE_URL + 'conversations',
        headers: {
          Authorization: 'Bearer ' + Token,
          Accept: 'application/json',
        },
      })
        .then(function (response) {
          setUnreadCount(response.data.data.unread_count);
          setIsLoading(false);
        })
        .catch(error => {
          setIsLoading(false);
        });
    }
    fetchData();
  }, []);

  const renderTabContent = () => {
    // switch (selectedTab) {
    //   case t('chat.inboxTab'):
    //     return <InboxScreen />;
    //   case t('chat.unreadTab'):
    //     return <UnreadScreen />;
    //   default:
    //     return <InboxScreen />;
    // }
    switch (selectedTab) {
      case 'Inbox':
        return <InboxScreen />;
      case 'Unread':
        return <UnreadScreen />;
      default:
        return <InboxScreen />;
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar animated={true} backgroundColor={Colors.white} />
        <View style={[styles.mainPadding]}>
          <View style={[styles.headerContainer]}>
            <Text style={[styles.headerText]}>{t('chat.header')}</Text>
            <View style={styles.IconsContainer}>
              <Pressable
                onPress={() =>
                  navigation.navigate(routes.NotificationListScreen)
                }>
                <Image
                  source={icons.notificationIcon}
                  style={styles.iconSize}
                />
              </Pressable>
              {userData?.unread_notifications_count != 0 && (
                <Text style={styles.notificationCount}>
                  {userData?.unread_notifications_count}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'Inbox' && styles.activeTab]}
              onPress={() => setSelectedTab('Inbox')}>
              <Text style={styles.tabText}>{t('chat.inboxTab')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'Unread' && styles.activeTab]}
              onPress={() => setSelectedTab('Unread')}>
              <Text style={styles.tabText}>
                {t('chat.unread') + ' (' + unreadCount + ')'}
              </Text>
            </TouchableOpacity>
          </View>
          {renderTabContent()}
        </View>
      </SafeAreaView>
      {isLoading && <Loader />}
    </SafeAreaProvider>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  mainPadding: {
    padding: '4%',
  },
  headerText: {
    fontFamily: FontFamily.InterBlack,
    fontSize: responsiveFontSize(3),
    color: Colors.black,
  },
  iconSize: {
    height: 26,
    width: 26,
    marginHorizontal: 7,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.lightGray,
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: responsiveFontSize(2),
    color: Colors.black,
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    backgroundColor: 'red',
    height: 20,
    width: 20,
    borderRadius: 50,
    textAlign: 'center',
    color: 'white',
    fontFamily: 'Inter-Medium',
    fontSize: responsiveFontSize(1.41),
    position: 'absolute',
    top: -7,
    left: 20,
  },
  IconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
