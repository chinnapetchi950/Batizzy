import React, {useEffect, useRef} from 'react';
const {View, Text, StyleSheet} = require('react-native');
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import {hp} from '../helper/constants';
import SignUpButton from '../common/SignUpButton';
import {navigate} from '../navigation/rootNavigator';
import {routes} from '../navigation/Routes';
import {useTranslation} from 'react-i18next';

const WelcomeScreen = () => {
  const {t} = useTranslation();

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{t('welcomeScreen.title')}</Text>
      <Text style={styles.subLabel}>{t('welcomeScreen.subLabel')}</Text>
      <Text style={styles.lastLabel}>{t('welcomeScreen.lastLabel')}</Text>
      <View style={styles.signUpButtonContainer}>
        <SignUpButton
          title={t('welcomeScreen.buttonText').toUpperCase()}
          onPress={() => {
            navigate(routes.Login);
          }}
        />
      </View>
    </View>
  );
};

export default WelcomeScreen;
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'Inter-Bold',
    fontSize: responsiveFontSize(2.35),
    color: '#000000',
  },
  subLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: responsiveFontSize(1.64),
    color: '#444444',
    marginTop: 18,
    marginHorizontal: 60,
  },
  lastLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: responsiveFontSize(1.64),
    color: '#4E4E4E',
    lineHeight: 30,
    marginHorizontal: 77,
    textAlign: 'center',
    marginTop: 8,
  },
  signUpButtonContainer: {
    width: '100%',
    paddingHorizontal: 15,
    paddingBottom: hp(2),
    backgroundColor: 'white',
    marginTop: 50,
  },
});
