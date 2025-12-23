import {
  Image,
  ImageBackground,
  Platform,
  SafeAreaView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {StatusBarHeight, fontSize, hp, wp} from '../../helper/constants';
import {icons, images} from '../../helper/imageConstants';
import {commonActions, navigate} from '../../navigation/rootNavigator';
import {routes} from '../../navigation/Routes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useCallback, useEffect, useState} from 'react';
import Modal from 'react-native-modal';
import Colors from '../../helper/Colors';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import FontFamily from '../../helper/FontFamily';
import {IMAGE_URL} from '../../helper/ApiConstant';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();

  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
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
    const data = JSON.parse(await AsyncStorage.getItem('userData'));
    setUserData(data);
  };
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  const gotoConfirmLogout = async () => {
    setIsLogoutModalVisible(false);
    const deviceToken = await AsyncStorage.getItem('deviceToken');
    AsyncStorage.clear();
    await AsyncStorage.setItem('deviceToken', deviceToken);
    commonActions(routes.Login);
  };
  return (
  <SafeAreaView style={styles.container}>
    
    {/* ===== Header Profile Row ===== */}
    <View style={styles.profileRow}>
      <View style={styles.profileLeft}>
        <Image
          source={
            userData?.profile_image
              ? {uri: IMAGE_URL + userData?.profile_image}
              : images.profileDummy
          }
          style={styles.profileImage}
        />

        <View style={{marginLeft: 15}}>
          <Text style={styles.nameText}>
            {userData.firstname} {userData.lastname}
          </Text>
          <Text style={styles.emailText}>{userData.email}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => navigate(routes.EditProfileScreen)}
      >
        <Image
          source={icons.editIcon}
          style={{height: 18, width: 18, tintColor: Colors.primary}}
        />
      </TouchableOpacity>
    </View>

    {/* ===== Grid Section ===== */}
    <View style={styles.gridContainer}>
      
      <TouchableOpacity
        style={styles.gridCard}
        onPress={() => navigate(routes.AboutScreen)}
      >
        <Image source={icons.info} style={styles.gridIcon} />
        <Text style={styles.gridText}>{t('settings.aboutUs')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.gridCard}
        onPress={() => navigate(routes.MyWebView)}
      >
        <Image source={icons.crm} style={styles.gridIcon} />
        <Text style={styles.gridText}>{t('settings.crm_invoice')}</Text>
      </TouchableOpacity>

     

      <TouchableOpacity style={styles.gridCard}>
        <Image source={icons.contract} style={styles.gridIcon} />
        <Text style={styles.gridText}>Contract</Text>
      </TouchableOpacity>

      

      

      

      <TouchableOpacity
        style={styles.gridCard}
        onPress={() => navigate(routes.SettingScreen)}
      >
        <Image source={icons.setting} style={styles.gridIcon} />
        <Text style={styles.gridText}>{t('settings.settings')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.gridCard}
        onPress={() => navigate(routes.HelpScreen)}
      >
        <Image source={icons.help} style={styles.gridIcon} />
        <Text style={styles.gridText}>{t('settings.helpCenter')}</Text>
      </TouchableOpacity>

    </View>

    {/* Divider */}
    <View style={styles.sectionDivider} />

    {/* Notification Row */}
    <View style={styles.rowItem}>
      <View style={styles.rowLeft}>
        <Image source={icons.notificationIcon} style={styles.rowIcon} />
        <Text style={styles.rowLabel}>{t('settings.notification')}</Text>
      </View>

      <Switch
        trackColor={{false: '#ccc', true: Colors.gray}}
        thumbColor={isEnabled ? Colors.primary : '#f4f4f4'}
        onValueChange={toggleSwitch}
        value={isEnabled}
      />
    </View>

<TouchableOpacity
          onPress={() => setIsLogoutModalVisible(true)}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '6%',
           // marginHorizontal: '2%',
          }}>
          <View style={{flexDirection: 'row'}}>
            <Image
              resizeMode="contain"
              source={icons.logout}
              style={{
                height: 20,
                width: 20,
              }}
            />
            <View>
              <Text
                style={{
                  fontFamily: FontFamily.InterMedium,
                  color: Colors.black,
                  fontSize: responsiveFontSize(1.6),
                  marginHorizontal: 10,
                }}>
                {t('settings.logoutConfirmation.logout')}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              navigate(routes.HelpScreen);
            }}>
            <Image
              resizeMode="contain"
              source={icons.smallRight}
              style={{
                height: 14,
                width: 14,
              }}
            />
          </TouchableOpacity>
          </TouchableOpacity>
    {/* Logout */}
    {/* <TouchableOpacity onPress={() => setIsLogoutModalVisible(true)}>
      <Text style={styles.logoutText}>
        {t('settings.logoutConfirmation.logout')}
      </Text>
    </TouchableOpacity> */}

    {/* Logout Modal (unchanged) */}
    {/** Keep your modal code exactly same... **/}

  </SafeAreaView>
);

};
export default ProfileScreen;
const styles = {
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: "5%",
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
  },

  profileLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  profileImage: {
    height: 60,
    width: 60,
    borderRadius: 30,
  },

  nameText: {
    fontFamily: FontFamily.InterSemiBold,
    fontSize: responsiveFontSize(2.2),
    color: Colors.black,
  },

  emailText: {
    fontFamily: FontFamily.InterRegular,
    fontSize: responsiveFontSize(1.7),
    color: Colors.fontDarkGray,
    marginTop: 2,
  },

  editButton: {
    height: 42,
    width: 42,
    borderRadius: 21,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },

  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 25,
    justifyContent: "space-between",
  },

  gridCard: {
    width: "47%",
    backgroundColor: "#fff",
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    shadowColor: "#000",
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  gridIcon: {
    height: 22,
    width: 22,
    tintColor: Colors.primary,
  },

  gridText: {
    fontFamily: FontFamily.InterMedium,
    fontSize: responsiveFontSize(1.8),
    marginLeft: 10,
    color: Colors.black,
  },

  sectionDivider: {
    height: 1,
    backgroundColor: "#E6E6E6",
    marginVertical: 25,
  },

  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  rowIcon: {
    height: 20,
    width: 20,
    tintColor: Colors.primary,
  },

  rowLabel: {
    fontFamily: FontFamily.InterMedium,
    fontSize: responsiveFontSize(1.8),
    color: Colors.black,
    marginLeft: 12,
  },

  logoutText: {
    fontFamily: FontFamily.InterSemiBold,
    fontSize: fontSize(13),
    paddingVertical: 14,
    borderRadius: 30,
    textAlign: "center",
    borderWidth: 1,
    borderColor: Colors.primary,
    color: Colors.primary,
    margin: "4%",
    marginTop: "4%",
  },
};
