import React from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import DocumentPicker from 'react-native-document-picker';
import {fontSize, hp, wp} from '../helper/constants';
import {icons} from '../helper/imageConstants';
import {responsiveFontSize} from 'react-native-responsive-dimensions';

const FilePicker = ({
  onPressFilePicker,
  placeholder,
  textColor,
  paddingVertical,
}) => {
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      console.log(result.uri, result.type, result.name, result.size);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
      } else {
        throw err;
      }
    }
  };

  return (
    <View>
      <TouchableOpacity
        onPress={onPressFilePicker}
        style={{
          borderRadius: 30,
          paddingVertical: '4%',
          paddingHorizontal: '4%',
          color: 'white',
          fontSize: responsiveFontSize(1.6),
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          elevation: 6,
          shadowColor: 'black',
          shadowOffset: {width: -1, height: 4},
          shadowOpacity: 0.1,
          shadowRadius: 0,
          backgroundColor: '#FFFFFF',
        }}>
        <Text
          style={{
            color: textColor ? textColor : '#2B2A2A',
            fontSize: fontSize(12),
            fontFamily: 'Inter-Regular',
          }}>
          {placeholder}
        </Text>

        <View style={styles.iconContainer}>
          <Image
            source={icons.uploadIcon}
            resizeMode="contain"
            style={{width: hp(1.82), height: hp(1.82)}}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    // padding: 5,
    // position: 'absolute',
    // right: 10,
    // top: Platform.OS == 'android' ? 4.5 : 5,
  },
  instructions: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default FilePicker;
