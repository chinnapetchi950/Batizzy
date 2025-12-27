import React, {useEffect} from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Image,
  Text,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {icons} from '../helper/imageConstants';

const BottomSheetCondition = ({isOpen, onClose, renderContent, maxHeight}) => {
  const [animation] = React.useState(new Animated.Value(0));

  useEffect(() => {
    Animated.spring(animation, {
      toValue: isOpen ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [animation, isOpen]);

  const bottomSheetStyle = {
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [300, 0],
        }),
      },
    ],
  };

  return (
    <>
      {isOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        />
      )}
      <Animated.View
        style={[styles.bottomSheet, bottomSheetStyle, {maxHeight}]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Image source={icons.CloseIcon} style={styles.closeIcon} />
          </TouchableOpacity>
        </View>
        {renderContent && renderContent()}
      </Animated.View>
    </>
  );
};

// const styles = StyleSheet.create({
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   bottomSheet: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: 'white',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     paddingHorizontal: 10,
//     paddingBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: -2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   header: {
//     flexDirection: 'row',
//   },
//   closeButton: {
//     position: 'absolute',
//     top: -45,
//     right: 0,
//     backgroundColor: 'white',
//     borderRadius: 15,
//   },
//   closeIcon: {
//     height: 14,
//     width: 14,
//     resizeMode: 'contain',
//   },
//   contentContainer: {
//     flexGrow: 1,
//   },
//   content: {
//     paddingBottom: 20,
//   },
// });
const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  header: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },

  closeButton: {
    padding: 5,
  },

  closeIcon: {
    height: 18,
    width: 18,
    resizeMode: 'contain',
  },

  contentContainer: {
    paddingBottom: 30, // 🔥 prevents button cutoff
    flexGrow: 1,
  },
});

export default BottomSheetCondition;
