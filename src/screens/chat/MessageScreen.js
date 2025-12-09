import {
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import React, {useEffect, useRef, useState} from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import Colors from '../../helper/Colors';
import {deviceHeight, deviceWidth, hp, wp} from '../../helper/constants';
import FontFamily from '../../helper/FontFamily';
import {icons} from '../../helper/imageConstants';
import {goBack, navigate} from '../../navigation/rootNavigator';
import Input from '../../common/Input';
import {useNavigation} from '@react-navigation/native';
import {BASE_URL} from '../../helper/ApiConstant';

const MessageScreen = props => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const ID = props.route.params.ID;
  const flatListRef = useRef(null);
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState();
  const [userID, setUserID] = useState();
  const [token, setToken] = useState();

  const [name, setName] = useState();

  useEffect(() => {
    getToken();
  }, []);

  const getToken = async () => {
    var Token = await AsyncStorage.getItem('accessToken');
    var userID = JSON.parse(await AsyncStorage.getItem('userData'));
    setUserID(userID?.id);
    setToken(Token);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      scrollToEnd();
    });

    return unsubscribe;
  }, [navigation]);

  const scrollToEnd = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({animated: true});
    }
  };

  const gotoBack = () => {
    goBack();
  };
  const fetchData = async () => {
    var Token = await AsyncStorage.getItem('accessToken');

    axios({
      method: 'get',
      url: BASE_URL + `messages/${ID}`,
      headers: {
        Authorization: 'Bearer' + Token,
        Accept: 'application/json',
      },
    })
      .then(function (response) {
        setName(response?.data?.data?.firstConvo?.user?.name);
        setConversations(response.data.data.messages);
      })
      .catch(error => {
        setIsLoading(false);
      });
  };
  const emptyMesRender = () => {
    return (
      <View style={{flex: 1}}>
        <Text style={[styles.emptyMsg]}>{t('error.noChats')}</Text>
      </View>
    );
  };
  const onChangeMessage = text => {
    setMessage(text);
  };

  const gotoSendMessage = async () => {
    var formData = new FormData();
    var Token = await AsyncStorage.getItem('accessToken');
    formData.append('message', message);
    formData.append('conversation_id', ID);
    setMessage('');
    axios({
      method: 'post',
      url: BASE_URL + `messages`,
      headers: {
        Authorization: 'Bearer' + Token,
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
      },
      data: formData,
    })
      .then(function (response) {
        setIsLoading(false);
        fetchData();
      })
      .catch(error => {
        setIsLoading(false);
      });
  };

  const renderMsgData = (item, index) => {
    return (
      <View key={index}>
        <View
          style={[
            userID != item.from_id
              ? styles.otherMessageContainer
              : styles.myMessageContainer,
          ]}>
          <View
            style={[
              userID != item.from_id
                ? styles.otherMessageView
                : styles.myMessageView,
            ]}>
            <Text
              style={[
                userID != item.from_id ? styles.otherText : styles.myText,
              ]}>
              {item.message}
            </Text>
            <Text
              style={[
                styles.timeDisplay,
                {
                  color: userID != item.from_id ? Colors.black : Colors.white,
                },
              ]}>
              {item.time_ago}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar animated={true} backgroundColor={Colors.white} />
        <View style={[styles.flexDirectionRowSB, {paddingHorizontal: '4%'}]}>
          <TouchableOpacity
            onPress={() => gotoBack()}
            style={[styles.iconContainer]}>
            <Image source={icons.backIcon} style={[styles.iconBackSize]} />
          </TouchableOpacity>
          <Text style={[styles.headerText]}>{name}</Text>
          <View style={[styles.iconSize]} />
        </View>
        <View style={[styles.mainPadding]}>
          <FlatList
            bounces={false}
            ref={flatListRef}
            contentContainerStyle={{paddingBottom: 20}}
            data={conversations}
            scrollEnabled
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item: msgList, index}) =>
              renderMsgData(msgList, index)
            }
            ListEmptyComponent={() => emptyMesRender()}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </SafeAreaView>
      <View style={[styles.bottomContainer]}>
        <Input
          value={message}
          placeholderText={t('chat.typeHere')}
          blurOnSubmit={true}
          autoCapitalize="none"
          onChangeText={text => onChangeMessage(text)}
          returnKeyType="done"
        />
        <View style={[styles.btnView]}>
          <TouchableOpacity
            style={[styles.iconBtnContaienr]}
            onPress={() => gotoSendMessage()}>
            <Image source={icons.send} style={[styles.sendSize]} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaProvider>
  );
};

export default MessageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  bottomContainer: {
    padding: '4%', // wp(3.8),
    backgroundColor: Colors.white,
  },
  mainPadding: {
    padding: '4%', // wp(3.8),
  },
  detailsTitle: {
    color: Colors.black,
    fontSize: responsiveFontSize(2),
    lineHeight: 25,
  },
  bottomBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderColor,
    paddingVertical: hp(1),
  },
  midText: {
    color: Colors.fontDarkGray,
    fontSize: responsiveFontSize(1.8),
    lineHeight: 25,
  },
  smallText: {
    color: Colors.fontLightGray,
    fontSize: responsiveFontSize(1.5),
    lineHeight: 25,
  },
  iconContainer: {
    padding: wp(2),
    borderWidth: 0.3,
    borderRadius: 50,
  },
  btnView: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginTop: -15,
    marginRight: 10,
  },
  iconBtnContaienr: {
    padding: '2%',
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  iconBackSize: {
    height: 16,
    width: 16,
    resizeMode: 'contain',
  },
  iconSize: {
    height: 20,
    width: 20,
  },
  flexDirectionRowSB: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: responsiveFontSize(2),
    color: Colors.black,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  sendSize: {
    height: 25,
    width: 25,
  },
  emptyMsg: {
    color: Colors.fontDarkGray,
    fontSize: responsiveFontSize(2),
    paddingVertical: hp(1),
    textAlign: 'center',
    marginTop: deviceHeight / 4,
  },
  myMessageView: {
    alignSelf: 'flex-end',
  },
  otherMessageView: {
    alignSelf: 'flex-start',
  },
  myText: {
    color: Colors.white,
    maxWidth: deviceWidth - 120,
  },
  otherText: {
    color: Colors.black,
    maxWidth: deviceWidth - 120,
  },
  myMessageContainer: {
    padding: hp(1),
    backgroundColor: Colors.primary,
    margin: hp(1),
    alignSelf: 'flex-end',
    borderRadius: 10,
  },
  otherMessageContainer: {
    padding: hp(1),
    backgroundColor: Colors.borderLight,
    margin: hp(1),
    alignSelf: 'flex-start',
    borderRadius: 10,
  },

  timeDisplay: {
    fontSize: responsiveFontSize(1.2),
    marginTop: hp(1),
  },
});
