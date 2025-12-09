import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {deviceHeight, hp, wp} from '../../helper/constants';
import Colors from '../../helper/Colors';
import FontFamily from '../../helper/FontFamily';
import {navigate} from '../../navigation/rootNavigator';
import {routes} from '../../navigation/Routes';
import {BASE_URL, IMAGE_URL} from '../../helper/ApiConstant';
import {useFocusEffect} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';

const InboxScreen = () => {
  const {t} = useTranslation();

  const [isLoading, setIsLoading] = useState(false);
  const [chatList, setChatList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const onScreenFocus = async () => {
        await fetchData();
      };
      onScreenFocus();
    }, []),
  );

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
        setChatList(response.data.data);
        setIsLoading(false);
      })
      .catch(error => {
        setIsLoading(false);
      });
  }

  const gotoMessageScreen = ID => {
    navigate(routes.MessageScreen, {ID: ID});
  };

  const renderListData = (item, index) => {
    return (
      <View style={[styles.listContainer]}>
        <TouchableOpacity
          onPress={() => gotoMessageScreen(item.id)}
          style={[styles.profileContainer]}>
          <View style={[styles.imgContainer]}>
            <Image
              source={{
                uri: item?.user?.profile_image
                  ? IMAGE_URL + item?.user?.profile_image
                  : 'https://img.icons8.com/ios-filled/100/user-male-circle.png',
              }}
              style={[styles.imageSize]}
            />
            <View style={[styles.msgContainer]}>
              <Text style={[styles.username]}>{item?.user?.name}</Text>
              <Text style={[styles.message]}>{item?.lastmessage?.message}</Text>
            </View>
          </View>

          <View>
            <Text style={[styles.megTime]}>
              {item?.lastmessage?.created_at_ago}
            </Text>
            {item?.unread_messages_count != 0 && (
              <View style={[styles.notiCount]}>
                <Text style={[styles.textCount]}>
                  {item?.unread_messages_count}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const emptyMesRender = () => {
    return (
      <View style={{flex: 1}}>
        <Text style={[styles.emptyMsg]}>{t('error.noChats')}</Text>
      </View>
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
    setRefreshing(false);
  };

  return (
    <View>
      <FlatList
        contentContainerStyle={{paddingBottom: '50%'}}
        data={chatList.conversations}
        scrollEnabled
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item: chatList, index}) =>
          renderListData(chatList, index)
        }
        ListEmptyComponent={() => emptyMesRender()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

export default InboxScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  mainPadding: {
    padding: '4%', // wp(3.8),
  },
  headerText: {
    fontFamily: FontFamily.InterBold,
    fontSize: responsiveFontSize(3),
    color: Colors.black,
  },
  iconSize: {
    height: 26,
    width: 26,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterSize: {
    height: 16,
    width: 16,
  },
  iconContainer: {
    padding: '4%',
    borderWidth: 0.3,
    borderRadius: 50,
  },
  proposalReqContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: Colors.primary,
    borderBottomWidth: 1,
    alignSelf: 'flex-start',
  },
  proposalText: {
    color: Colors.primary,
  },
  textColor: {
    color: Colors.fontGray,
    fontSize: responsiveFontSize(1.6),
    lineHeight: 25,
  },
  bottomBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderColor,
    paddingVertical: hp(1),
  },
  serchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(2),
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: hp(2),
  },
  statusText: {
    color: Colors.fontDarkGray,
    fontSize: responsiveFontSize(1.8),
  },
  statusValue: {
    color: Colors.yellow,
    fontSize: responsiveFontSize(1.8),
  },
  imageSize: {
    height: 50,
    width: 50,
    borderRadius: 50,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  imgContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notiCount: {
    borderRadius: 50,
    backgroundColor: Colors.primary,
    alignSelf: 'flex-end',
  },
  textCount: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    color: Colors.white,
    fontSize: responsiveFontSize(1.4),
  },
  megTime: {
    color: Colors.black,
    fontSize: responsiveFontSize(1.4),
    paddingBottom: hp(1),
  },
  username: {
    color: Colors.black,
    fontSize: responsiveFontSize(2),
  },
  message: {
    color: Colors.fontDarkGray,
    fontSize: responsiveFontSize(1.2),
    paddingTop: hp(1),
  },
  msgContainer: {
    paddingLeft: wp(2),
  },
  emptyMsg: {
    color: Colors.fontDarkGray,
    fontSize: responsiveFontSize(2),
    paddingVertical: hp(1),
    textAlign: 'center',
    marginTop: deviceHeight / 4,
  },
  listContainer: {
    paddingTop: hp(2),
  },
});
