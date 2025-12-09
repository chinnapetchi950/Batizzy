import React, {useState} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  Image,
  Pressable,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {icons} from '../helper/imageConstants';
import {hp, wp} from '../helper/constants';
import {responsiveScreenFontSize} from 'react-native-responsive-dimensions';

const BigInputField = ({
  placeholder,
  onChangeText, // Passed from parent
  value,
  keyboardType,
  editable,
  title,
  secureTextEntry,
  titleColor,
  isDropdown,
  onPress,
}) => {
  const [wordCount, setWordCount] = useState(
    value ? value.split(' ').length : 0,
  );

  const handleTextChange = text => {
    const words = text.trim().split(/\s+/);
    const count = words[0] === '' ? 0 : words.length;

    // Only allow changes if the word count is less than or equal to 100
    if (count <= 100) {
      setWordCount(count);
      onChangeText(text); // Call the parent's onChangeText handler
    }
  };

  return (
    <Pressable onPress={onPress}>
      <Text style={[styles.title, titleColor && {color: titleColor}]}>
        {title}
      </Text>
      <View style={styles.container}>
        <TextInput
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#2B2A2A"
          editable={editable}
          style={styles.input}
          onChangeText={handleTextChange} // Custom text change handler
          multiline
          textAlignVertical="top"
        />
        {isDropdown && (
          <Pressable style={styles.iconContainer}>
            <Image source={icons.downArrow} style={styles.downIcon} />
          </Pressable>
        )}
      </View>
      <Text style={styles.wordCount}>{wordCount}/100 words</Text>
    </Pressable>
  );
};

export default BigInputField;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: '#1D1D1D',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#00000036',
    borderRadius: 10,
  },
  iconContainer: {
    padding: 5,
    position: 'absolute',
    right: 10,
  },
  downIcon: {
    height: 7.4,
    width: 12,
    resizeMode: 'contain',
  },
  wordCount: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: '#6C6C6C',
  },
});
