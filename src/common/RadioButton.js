const {TouchableOpacity, Text, Image, StyleSheet} = require('react-native');
import {fontSize, hp, wp} from '../helper/constants';
import {icons} from '../helper/imageConstants';

const RadioButton = ({label, selected, onSelect, source}) => {
  return (
    <TouchableOpacity style={styles.radioButtonContainer} onPress={onSelect}>
      <Image
        resizeMode="contain"
        tintColor={'#004B9C'}
        source={selected ? icons.radioFill : icons.radioBlank}
        style={{height: wp(7), width: wp(7)}}
      />
      <Text style={styles.labelText}>{label}</Text>
    </TouchableOpacity>
  );
};
export default RadioButton;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonContainer: {
    flexDirection: 'row',
  },
  labelText: {
    fontSize: fontSize(13),
    fontFamily: 'Inter-Medium',
    color: '#444444',
    marginLeft: wp(2),
  },
});
