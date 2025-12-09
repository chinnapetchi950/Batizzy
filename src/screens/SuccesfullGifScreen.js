import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {images} from '../helper/imageConstants';
import {routes} from '../navigation/Routes';
import FastImage from 'react-native-fast-image';
import {useNavigation} from '@react-navigation/native';

const SuccesfullGifScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    setTimeout(() => {
      navigation.navigate(routes.WelcomeScreen);
    }, 4000);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <FastImage
        source={images.successGIF}
        style={styles.gif}
        resizeMode={FastImage.resizeMode.contain}
      />
    </View>
  );
};

export default SuccesfullGifScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#754595',
  },
  gif: {
    width: 200,
    height: 200,
  },
});
