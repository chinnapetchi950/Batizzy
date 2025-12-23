import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {navigationRef} from './rootNavigator';
import {icons} from '../helper/imageConstants';
import {Image, StyleSheet, View} from 'react-native';
import Colors from '../helper/Colors';
import {routes} from './Routes';
// Auth screens
import Login from '../screens/Login';
import Splash from '../screens/Splash';
import CreateProfile1 from '../screens/CreateProfile1';
import CreateProfile2 from '../screens/CreateProfile2';
import CreateProfile3 from '../screens/CreateProfile3';
import CreateProfile4 from '../screens/CreateProfile4';
import WelcomeScreen from '../screens/WelcomeScreen';
import SuccesfullGifScreen from '../screens/SuccesfullGifScreen';
import RequestDetails from '../screens/RequestDetails';
import NewProposal from '../screens/NewProposal';
import SubmitProposalSuccess from '../screens/SubmitProposalSuccess';

// Tab screen
import DashBoard from '../screens/tabScreen/DashBoard';
import ProposalScreen from '../screens/tabScreen/ProposalScreen';
import ConclusionScreen from '../screens/tabScreen/ConclusionScreen';
import ChatScreen from '../screens/tabScreen/ChatScreen';
import ProfileScreen from '../screens/tabScreen/ProfileScreen';
import ProposalDetailsScreen from '../screens/proposal/ProposalDetailsScreen';
import ContractsDetailScreen from '../screens/contracts/ContractsDetailScreen';
import InboxScreen from '../screens/chat/InboxScreen';
import MessageScreen from '../screens/chat/MessageScreen';
import UnreadScreen from '../screens/chat/UnreadScreen';
import AboutScreen from '../screens/Profile/AboutScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import HelpScreen from '../screens/Profile/HelpScreen';
import SettingScreen from '../screens/Profile/SettingScreen';
import DeleteAccountScreen from '../screens/Profile/DeleteAccountScreen';
import ChangePasswordScreen from '../screens/Profile/ChangePasswordScreen';
import MarketPlaceListScreen from '../screens/MarketPlace/MarketPlaceListScreen';
import SocialAllFollowerFollowingList from '../screens/SocialAllFollowerFollowingList';
import NotificationListScreen from '../screens/NotificationListScreen';
import MyWebView from '../screens/WebViewScreen';
import SocialListScreen from '../screens/tabScreen/SocialListScreen';

// Propasal

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainNavigator = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={routes.Splash}
        screenOptions={{headerShown: false, gestureEnabled: false}}>
        <Stack.Screen name={routes.Splash} component={Splash} />
        <Stack.Screen name={routes.Login} component={Login} />
        <Stack.Screen name={routes.Tab} component={TabNavigator} />
        <Stack.Screen name={routes.CreateProfile1} component={CreateProfile1} />
        <Stack.Screen name={routes.CreateProfile2} component={CreateProfile2} />
        <Stack.Screen name={routes.CreateProfile3} component={CreateProfile3} />
        <Stack.Screen name={routes.CreateProfile4} component={CreateProfile4} />
        <Stack.Screen name={routes.WelcomeScreen} component={WelcomeScreen} />
        <Stack.Screen name={routes.RequestDetails} component={RequestDetails} />
        <Stack.Screen name={routes.NewProposal} component={NewProposal} />
        <Stack.Screen
          name={routes.SuccesfullGifScreen}
          component={SuccesfullGifScreen}
        />
        <Stack.Screen
          name={routes.SubmitProposalSuccess}
          component={SubmitProposalSuccess}
        />
        <Stack.Screen
          name={routes.ProposalDetailsScreen}
          component={ProposalDetailsScreen}
        />
        <Stack.Screen
          name={routes.ContractsDetailScreen}
          component={ContractsDetailScreen}
        />
        <Stack.Screen name={routes.InboxScreen} component={InboxScreen} />
        <Stack.Screen name={routes.UnreadScreen} component={UnreadScreen} />
        <Stack.Screen name={routes.MessageScreen} component={MessageScreen} />

        <Stack.Screen name={routes.AboutScreen} component={AboutScreen} />
        <Stack.Screen
          name={routes.EditProfileScreen}
          component={EditProfileScreen}
        />
        <Stack.Screen name={routes.HelpScreen} component={HelpScreen} />
        <Stack.Screen name={routes.SettingScreen} component={SettingScreen} />
        <Stack.Screen
          name={routes.DeleteAccountScreen}
          component={DeleteAccountScreen}
        />
        <Stack.Screen
          name={routes.ChangePasswordScreen}
          component={ChangePasswordScreen}
        />
        <Stack.Screen
          name={routes.NotificationListScreen}
          component={NotificationListScreen}
        />
         <Stack.Screen
          name={routes.MyWebView}
          component={MyWebView}
        />
         <Stack.Screen
          name={routes.SocialListScreen}
          component={SocialListScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarShowLabel: false, // Hides labels for a minimalist design
        tabBarActiveTintColor: '#6200EE', // Active icon color
        tabBarInactiveTintColor: '#808080', // Inactive icon color
        tabBarStyle: {
      position: 'absolute',
      backgroundColor: '#754595',   // Purple bar
      height: 62,
      marginHorizontal: 10,
      marginBottom: 5,
      borderRadius: 40,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      elevation: 10,
      borderTopWidth: 0,
    },
    tabBarItemStyle: {
      backgroundColor: 'transparent',
    },
        tabBarIcon: ({focused}) => {
          // Set the image source and style based on the route name
          let imageSource;
          if (route.name === routes.DashBoard) {
            imageSource = focused ? icons.searchActive : icons.search;
          } else if (route.name === routes.ProposalScreen) {
            imageSource = focused ? icons.goalActive : icons.goal;
          } else if (route.name === routes.ConclusionScreen) {
            imageSource = focused ? icons.conclusionActive : icons.conclusion;
          } else if (route.name === routes.ChatScreen) {
            imageSource = focused ? icons.chatActive : icons.chat;
          } else if (route.name === routes.MarketPlaceListScreen) {
            imageSource = focused ? icons.menuActive : icons.menu;
          } else if (route.name === routes.SocialListScreen) {
            imageSource = focused ? icons.menuActive : icons.menu;
          } else if (route.name === routes.ProfileScreen) {
            imageSource = focused ? icons.menuActive : icons.menu;
          }
          return (
            <View
              style={{
              backgroundColor: focused ? Colors.white : Colors.primary,
                borderRadius: 5,
                paddingHorizontal: 18,
                paddingVertical: 14,
                 width: 48,
              height: 48,
              borderRadius: 50,
              alignItems:'center'
                
              }}>
              <Image  tintColor={focused ?'#754595':'#FFFFFF'}source={imageSource} style={[styles.iconSize]} />
            </View>
          );
        },
      })}>
      <Tab.Screen name={routes.DashBoard} component={DashBoard} />
      <Tab.Screen name={routes.ProposalScreen} component={ProposalScreen} />
      <Tab.Screen name={routes.ConclusionScreen} component={ConclusionScreen} />
      <Tab.Screen name={routes.ChatScreen} component={ChatScreen} />
      <Tab.Screen name={routes.MarketPlaceListScreen} component={MarketPlaceListScreen} />
      <Tab.Screen name={routes.SocialListScreen} component={SocialListScreen} />
      <Tab.Screen name={routes.ProfileScreen} component={ProfileScreen} />

    </Tab.Navigator>
  );
};

export default MainNavigator;

const styles = StyleSheet.create({
  iconSize: {
    height: 18,
    width: 18,
  },
});
