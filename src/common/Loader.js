import {View, Modal, Text, ActivityIndicator, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import React from 'react';

const Loader = ({loaderTeaxt}) => {
  return (
    <Modal animationType="fade" transparent={true} visible={true}>
      <View style={[styles.loaderHorizontal]}>
        <View style={[styles.loaderView]}>
          <ActivityIndicator size="small" color={'#754595'} />
          <Text style={[styles.loaderText]}>{'Loading ...'}</Text>
        </View>
      </View>
    </Modal>
  );
};

export default Loader;

const styles = StyleSheet.create({
  loaderIcon: {width: 30, height: 30},
  loaderHorizontal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0000009F',
  },
  loaderView: {
    borderRadius: 10,
    shadowColor: '#000',
  },
  loaderText: {
    fontFamily: 'Inter',
    color: '#000',
    marginTop: 10,
    fontSize: 12,
  },
});
