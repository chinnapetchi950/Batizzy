import {View, Text} from 'react-native';
import {useTranslation} from 'react-i18next';
import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const Icons = ({iconSetName, iconName, iconColor, iconSize, iconMainstyle}) => {
  return (
    <View style={[iconMainstyle]}>
      {iconSetName === 'MaterialIcons' ? (
        <MaterialIcons name={iconName} size={iconSize} color={iconColor} />
      ) : iconSetName === 'MaterialCommunityIcons' ? (
        <MaterialCommunityIcons
          name={iconName}
          size={iconSize}
          color={iconColor}
        />
      ) : iconSetName === 'Feather' ? (
        <Feather name={iconName} size={iconSize} color={iconColor} />
      ) : iconSetName === 'Ionicons' ? (
        <Ionicons name={iconName} size={iconSize} color={iconColor} />
      ) : iconSetName === 'FontAwesome6' ? (
        <FontAwesome6 light name={iconName} size={iconSize} color={iconColor} />
      ) : iconSetName === 'FontAwesome' ? (
        <FontAwesome name={iconName} size={iconSize} color={iconColor} />
      ) : null}
    </View>
  );
};

export default Icons;
