import React, {useCallback, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import Header from './Header';
import List from './List';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {routes} from '../../navigation/Routes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_URL} from '../../helper/ApiConstant';
import axios from 'axios';
import Loader from '../../common/Loader';

const MarketPlaceListScreen = () => {
  const {t} = useTranslation();

  const navigation = useNavigation();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [userData, setUserData] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <>
      <View style={styles.wrapper}>
        <Header
          title={t('marketplace.title')}
          ViewAccountText={t('marketplace.viewAccountText')}
          onPressViewAccount={() => {
            navigation.navigate(routes.MarketplaceAccount);
          }}
          onPressSearchIcon={() => {
            setIsSearchVisible(true);
          }}
          notiCount={userData?.unread_notifications_count}
        />
      </View>
      <View style={styles.divider} />
      <View style={styles.secondaryWrapper}>
        <List
          isSearchVisible={isSearchVisible}
          setIsSearchVisible={setIsSearchVisible}
        />
        {isLoading && <Loader />}
      </View>
    </>
  );
};
export default MarketPlaceListScreen;

const styles = StyleSheet.create({
  wrapper: {
    padding: 15,
    backgroundColor: 'white',
  },
  divider: {
    width: '100%',
    backgroundColor: 'lightgray',
    height: 4,
  },
  secondaryWrapper: {
    backgroundColor: 'white',
    flex: 1,
    padding: 15,
  },
});
