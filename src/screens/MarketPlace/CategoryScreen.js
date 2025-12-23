import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import {deviceHeight, hp, wp} from '../../helper/constants';
import {icons} from '../../helper/imageConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {BASE_URL, IMAGE_URL} from '../../helper/ApiConstant';
import Colors from '../../helper/Colors';
import {useLanguage} from '../../context/LanguageContext';

const CategoryScreen = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const [isAllCategoryList, setIsAllCategoryList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
   const {selectedLanguage, changeLanguage} = useLanguage();

  useEffect(() => {
    getCategoryData();
  }, []);

  const getCategoryData = async () => {
    setIsLoading(true);
    var Token = await AsyncStorage.getItem('accessToken');
    await fetch(BASE_URL + 'categories', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + Token,
        Accept: 'application/json',
      },
    })
      .then(res => res.json())
      .then(res => {
        setIsLoading(false);
        if (res.status === true) {
          setIsAllCategoryList(res.data);
        }
      })
      .catch(error => {
        setIsLoading(false);
        console.error(error);
      });
  };

  const renderCategoryItem = ({item}) => {
    return (
      <Pressable style={styles.categoryContainer}>
        <Image
          source={{uri: IMAGE_URL + item?.image}}
          style={styles.categoryIcon}
        />
        <Text style={styles.categoryText}>
          {selectedLanguage == 'fr' || item?.name_fr?.length > 18
            ? `${item?.name_fr?.slice(0, 18)}...`
            : selectedLanguage == 'de' || item?.name_de?.length > 18
            ? `${item?.name_de?.slice(0, 18)}...`
            : `${item?.name?.slice(0, 30)}...`}
        </Text>
      </Pressable>
    );
  };

  const emptyMesRender = () => {
    return (
      <View style={{flex: 1}}>
        <Text style={[styles.emptyMsg]}>
          {t('categoryScreen.emptyMessage')}
        </Text>
      </View>
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    getCategoryData();
    setRefreshing(false);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.subHeader}>
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
        <View>
          <Text style={styles.headerText}>{t('categoryScreen.title')}</Text>
        </View>
      </View>
      <Text style={styles.cotegoryTitleText}>
        {t('categoryScreen.allCategories')}
      </Text>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={isAllCategoryList}
        keyExtractor={item => item.id}
        renderItem={renderCategoryItem}
        contentContainerStyle={styles.categorycontentContainerStyle}
        ListEmptyComponent={() => emptyMesRender()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

export default CategoryScreen;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  cotegoryTitleText: {
    fontSize: responsiveFontSize(1.88),
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginBottom: hp(2.4),
    marginTop: hp(2),
  },
  categoryIcon: {
    height: 40,
    width: 40,
    borderRadius: 40,
  },
  categoryBG: {
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: responsiveFontSize(1.64),
    fontFamily: 'Inter-Medium',
    color: '#2D2C2C',
    marginLeft: wp(4),
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2.4),
  },
  categorycontentContainerStyle: {
    paddingBottom: 40,
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
  sendMessageIcon: {
    height: hp(4.6),
    width: hp(4.6),
  },
  headerText: {
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    fontSize: responsiveFontSize(1.88),
    marginLeft: 16,
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyMsg: {
    color: Colors.fontDarkGray,
    fontSize: responsiveFontSize(2),
    paddingVertical: 10,
    textAlign: 'center',
    marginTop: deviceHeight / 4,
  },
});
