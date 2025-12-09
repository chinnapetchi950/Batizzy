// utilities.js
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export const useStatusBarHeight = () => {
  const insets = useSafeAreaInsets();
  const statusBarHeight = insets.top;

  return statusBarHeight;
};
