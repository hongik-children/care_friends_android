import React from 'react';
import { Text as RNText, TextProps } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';

interface CustomTextProps extends TextProps {
  style?: StyleProp<TextStyle>;
}

const CustomText: React.FC<CustomTextProps> = ({ style, ...rest }) => {
  return <RNText style={[{ fontFamily: 'Pretendard-Medium' }, style]} {...rest} />;
};

export default CustomText;
