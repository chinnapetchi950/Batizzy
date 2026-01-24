import React from 'react';
import {View, TextInput, Text, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import Colors from '../helper/Colors';
const Input = ({
  isShowPassword,
  isVisible,
  placeholderText,
  secureTextEntry,
  forwardRef,
  onSubmitEditing,
  blurOnSubmit,
  onChangeText,
  value,
  validateMesssage,
  isValidationShow,
  keyboardType,
  maxLength,
  autoCapitalize,
  inputStyle,
  returnKeyType,
  multiline,
  numberOfLines,
  textAlignVertical,
  editable,
  placeholderStyle,
  label,
  ...props
}) => {
  return (
    <View {...props}>
      <TextInput
        keyboardAppearance="light"

        style={[
          ComponentStyle.inputText,
          inputStyle,
          {
            borderColor: isValidationShow ? Colors.red : Colors.borderBlack15,
          },
        ]}
        value={value}
        returnKeyType={returnKeyType}
        ref={forwardRef}
        onSubmitEditing={onSubmitEditing}
        editable={editable}
        placeholder={placeholderText}
        placeholderTextColor={Colors.lightPlaceholder}
        placeholderStyle={placeholderStyle}
        blurOnSubmit={blurOnSubmit}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical={textAlignVertical}
        secureTextEntry={secureTextEntry}
        {...props}
      />
      <View>
        {isValidationShow ? (
          <Text style={[ComponentStyle.errorText]}>{validateMesssage}</Text>
        ) : null}
      </View>
    </View>
  );
};
export default Input;

const ComponentStyle = StyleSheet.create({
  inputText: {
    height: 50,
    marginTop: '5%',
    paddingLeft: 20,
    backgroundColor: Colors.white,
    color: Colors.black,
  },
  errorText: {
    fontSize: 12,
    color: '#FF0000',
    padding: 5,
  },
});
