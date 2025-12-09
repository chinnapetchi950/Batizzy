import React from 'react';
import {
  responsiveFontSize,
  responsiveScreenFontSize,
} from 'react-native-responsive-dimensions';
import {icons} from '../helper/imageConstants';
import {View, StyleSheet, Text, Image, TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import Colors from '../helper/Colors';
import FontFamily from '../helper/FontFamily';

const InputField = ({
  placeholder,
  title,
  titleColor,
  isDropdown,
  onPress,
  value,
  iconColor,
  placeholderColor,
}) => {
  return (
    <View>
      <Text style={[styles.title, {color: titleColor}]}>{title}</Text>
      <TouchableOpacity onPress={onPress}>
        <View style={styles.container}>
          <View style={[styles.input, styles.flexRowSB]}>
            <Text
              style={[
                styles.placeholder,
                {
                  color: placeholderColor
                    ? placeholderColor
                    : Colors.lightPlaceholder,
                },
              ]}>
              {value ? value : placeholder}
            </Text>
            {isDropdown && (
              <View style={styles.iconContainer}>
                <Image
                  source={icons.downArrow}
                  style={styles.downIcon}
                  tintColor={iconColor}
                />
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};
export default InputField;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexRowSB: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: responsiveFontSize(1.6),
    color: Colors.black,
    marginTop: '4%',
    marginBottom: '2%',
  },
  placeholder: {
    color: '#6C6C6C',
    fontFamily: 'Inter',
  },
  input: {
    height: 50,
    flex: 1,
    borderWidth: 1,
  },
  iconContainer: {
    padding: 5,
  },
  downIcon: {
    height: 10,
    width: 10,
    resizeMode: 'contain',
  },
});
