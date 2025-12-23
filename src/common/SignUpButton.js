import {fontSize, hp, wp} from '../helper/constants';
import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';

import Colors from '../helper/Colors';

const SignUpButton = ({title, onPress, mainContainerStyle, disabled}) => {
  return (
    <TouchableOpacity
      disabled={disabled}
      style={[styles.mainContainer, mainContainerStyle]}
      onPress={onPress}>
      <Text style={styles.textStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

export default SignUpButton;

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
    paddingVertical: '4%',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
  },
  textStyle: {
    fontSize: fontSize(13),
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
});
