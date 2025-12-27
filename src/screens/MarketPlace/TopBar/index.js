// import React from 'react';
// import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
// import {useTranslation} from 'react-i18next';
// import {responsiveFontSize} from 'react-native-responsive-dimensions';
// import {wp} from '../../../helper/constants';
// import FontFamily from '../../../helper/FontFamily';
// import Colors from '../../../helper/Colors';
// import Icons from '../../../common/Icons';

import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { hp, wp } from '../../../helper/constants';
import { responsiveFontSize } from 'react-native-responsive-dimensions';
import FontFamily from '../../../helper/FontFamily';
import Colors from '../../../helper/Colors';
// import Icons from '../../../common/Icons';
import {icons} from '../../../helper/imageConstants';


const TopBar = ({
  onPresSell,
  onPresCategory,
  onPressAdd,
  selectedTab,
}) => {
  const { t } = useTranslation();

  return (
    <View style={{ marginHorizontal: 40 }}>
      <View style={styles.container}>

        {/* Category */}
        <Pressable style={styles.leftSection} onPress={onPresCategory}>
          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: selectedTab === 'category' ? '#FFF' : '#000' },
            ]}
          >
            <Image
              source={icons.CategoryIcon}
              style={[
                styles.icon,
                { tintColor: selectedTab === 'category' ? '#000' : '#FFF' },
              ]}
            />
          </View>

          <Text
            style={[
              styles.categoryText,
              { color: selectedTab === 'category' ? '#FFF' : '#AAA' },
            ]}
          >
            {t('marketplace.category')}
          </Text>
        </Pressable>

        {/* Right Section */}
        <View style={styles.leftSection}>
          <Pressable onPress={onPresSell}>
            <Text
              style={[
                styles.sellText,
                { color: selectedTab === 'sell' ? '#FFF' : '#AAA' },
              ]}
            >
              {t('marketplace.sell')}
            </Text>
          </Pressable>

          {/* Plus Button */}
          <Pressable
            style={[
              styles.addButton,
              { backgroundColor: selectedTab === 'sell' ? '#FFF' : '#000' },
            ]}
            onPress={onPressAdd}
          >
            <Text
              style={[
                styles.plusText,
                { color: selectedTab === 'sell' ? '#000' : '#FFF' },
              ]}
            >
              +
            </Text>
          </Pressable>
        </View>

      </View>
    </View>
  );
};

export default TopBar;



const styles = StyleSheet.create({
  container: {
    marginTop: hp(3),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 30,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconWrapper: {
    height: hp(4),
    width: hp(4),
    borderRadius: hp(2),
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(2),
  },

  icon: {
    height: hp(2),
    width: hp(2),
    tintColor: '#000',
    resizeMode: 'contain',
  },

  categoryText: {
    fontSize: responsiveFontSize(1.7),
    fontFamily: 'Inter-SemiBold',
    color: '#FFF',
  },

  sellText: {
    fontSize: responsiveFontSize(1.7),
    fontFamily: 'Inter-Medium',
    color: '#FFF',
    marginRight:20
  },

  addButton: {
    height: hp(4.5),
    width: hp(4.5),
    borderRadius: hp(2.25),
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  plusText: {
    fontSize: responsiveFontSize(2.8),
    fontFamily: 'Inter-Bold',
    color: '#FFF',
  },
});

