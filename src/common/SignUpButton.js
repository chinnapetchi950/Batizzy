import {fontSize, hp, wp} from '../helper/constants';
import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';

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
  },
  textStyle: {
    fontSize: fontSize(13),
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
});
