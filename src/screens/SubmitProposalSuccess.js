import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import {icons} from '../helper/imageConstants';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import {routes} from '../navigation/Routes';
import {useNavigation} from '@react-navigation/native';

const SubmitProposalSuccess = props => {
  const {t} = useTranslation();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Checkmark Icon */}
      <View style={styles.iconContainer}>
        <Image
          source={icons.successProposalIcon} // Replace with your own checkmark icon
          style={styles.icon}
        />
      </View>

      {/* Success Text */}
      <Text style={styles.successText}>
        {t('requestdetails.proposalSubmittedSuccess')} {/* Translated text */}
      </Text>

      {/* Description */}
      <Text style={styles.descriptionText}>
        {t('requestdetails.quotationCreated')} {/* Translated text */}
      </Text>

      {/* Back Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate(routes.DashBoard)} // Replace with your own back navigation
      >
        <Text style={styles.buttonText}>{t('requestdetails.backButton')}</Text>
        {/* Translated text */}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  icon: {
    width: 100,
    height: 100,
  },
  successText: {
    fontSize: responsiveFontSize(1.88),
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginVertical: 10,
    color: '#000000',
  },
  descriptionText: {
    fontSize: responsiveFontSize(1.88),
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    color: '#444444',
    marginBottom: 20,
    lineHeight: 30,
  },
  button: {
    borderRadius: 5,
  },
  buttonText: {
    fontSize: responsiveFontSize(1.88),
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
});

export default SubmitProposalSuccess;
