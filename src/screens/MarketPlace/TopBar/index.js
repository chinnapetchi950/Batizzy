import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {responsiveFontSize} from 'react-native-responsive-dimensions';
import {wp} from '../../../helper/constants';
import FontFamily from '../../../helper/FontFamily';
import Colors from '../../../helper/Colors';
import Icons from '../../../common/Icons';

const TopBar = ({onPresSell, onPresCategory, onPressAdd}) => {
  const {t} = useTranslation();

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[styles.categoryTabContainer, {backgroundColor: '#75459559'}]}
        onPress={onPresSell}>
        <Icons
          iconSetName={'MaterialIcons'}
          iconName={'sell'}
          iconColor={'#754595'}
          iconSize={18}
        />
        <Text style={[styles.selltabtext, {color: '#754595'}]}>
          {t('marketplace.sell')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.categoryTabContainer, {backgroundColor: '#FECC1659'}]}
        onPress={onPresCategory}>
        <Icons
          iconSetName={'MaterialIcons'}
          iconName={'category'}
          iconColor={'#FECC16'}
          iconSize={18}
        />
        <Text style={[styles.selltabtext, {color: '#FECC16'}]}>
          {t('marketplace.category')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
export default TopBar;

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    flexGrow: 1,
    justifyContent: 'space-between',
    marginTop: 10,
  },
  selltabIcon: {},
  categorytabIcon: {},
  addTabIcon: {},
  selltabtext: {
    fontSize: responsiveFontSize(1.6),
    color: Colors.primary,
    fontFamily: FontFamily.InterMedium,
    marginLeft: 6,
  },
  categoryTabContainer: {
    backgroundColor: '#FECC1659',
    borderRadius: 20,
    flex: 0.48,
    paddingVertical: 5,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },

  categorytabtext: {
    fontSize: responsiveFontSize(1.64),
    fontFamily: 'Inter-SemiBold',
    marginLeft: wp(1.6),
    color: '#FECC16',
  },
  seperator: {
    marginHorizontal: 17,
  },
});
