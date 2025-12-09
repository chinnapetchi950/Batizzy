import React, {useEffect, useState} from 'react';
import {Dimensions, StatusBar} from 'react-native';
import {useTranslation} from 'react-i18next';
import {
  widthPercentageToDP,
  heightPercentageToDP,
} from 'react-native-responsive-screen';
import {RFValue} from 'react-native-responsive-fontsize';

export const wp = val => widthPercentageToDP(val);

export const hp = val => heightPercentageToDP(val);

export const fontSize = size => RFValue(size);

export const deviceWidth = Dimensions.get('window').width;
export const deviceHeight = Dimensions.get('window').height;

export const StatusBarHeight = () => {
  const [statusBarHeight, setStatusBarHeight] = useState(0);

  useEffect(() => {
    const updateStatusBarHeight = () => {
      setStatusBarHeight(StatusBar.currentHeight || 0);
    };

    updateStatusBarHeight();

    const onOrientationChange = () => {
      // Handle orientation change if needed
      updateStatusBarHeight();
    };

    // Subscribe to orientation change events
    Dimensions.addEventListener('change', onOrientationChange);

    // Clean up on unmount
    return () => {
      Dimensions.removeEventListener('change', onOrientationChange);
    };
  }, []);

  return statusBarHeight;
};

// import {
//   widthPercentageToDP,
//   heightPercentageToDP,
// } from 'react-native-responsive-screen';
// import {RFValue} from 'react-native-responsive-fontsize';
// import {getStatusBarHeight} from 'react-native-status-bar-height';

// export const wp = val => widthPercentageToDP(val);

// export const hp = val => heightPercentageToDP(val);

// export const fontSize = size => RFValue(size);

// export const statusBarHeight = getStatusBarHeight();

// /**
//  * Asyncstorage constants
//  */
// export const BookMarkedUsers = 'BookMarkedUsers';
