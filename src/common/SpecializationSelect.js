import {Image, Text, TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {icons} from '../helper/imageConstants';
import {fontSize, hp, wp} from '../helper/constants';

const SpecializationSelect = ({onSelect, selected, source, title}) => {
  return (
    <View style={{marginHorizontal: wp(1), marginTop: hp(1)}}>
      <TouchableOpacity
        onPress={onSelect}
        style={{
          elevation: 6,
          shadowColor: 'black',
          shadowOffset: {width: -1, height: 4},
          shadowOpacity: 0.1,
          shadowRadius: 0,
          backgroundColor: '#FFFFFF',
          borderRadius: 10,
        }}>
        <View
          style={{
            backgroundColor: selected ? '#004B9C' : 'white',
            borderRadius: 10,
            paddingHorizontal: wp(2),
            paddingVertical: hp(1),
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            style={{
              fontFamily: 'Inter-Medium',
              color: selected ? '#FFFFFF' : '#444444',
              fontSize: fontSize(13),
              textAlign: 'center',
            }}>
            {title}
          </Text>
        </View>
        <View style={{position: 'absolute', top: -8, right: -8}}>
          <Image
            source={selected && icons.closeItem}
            style={{
              height: hp(2.5),
              width: hp(2.5),
            }}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};
export default SpecializationSelect;
