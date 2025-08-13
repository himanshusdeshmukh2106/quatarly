import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

interface Props {
  value: number; // 0‒100
  height?: number;
  backgroundColor?: string;
  fillColor?: string;
  style?: ViewStyle;
}

const ProgressBar: React.FC<Props> = ({ value, height = 6, backgroundColor, fillColor, style }) => {
  const { theme } = useContext(ThemeContext);
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View
      style={[
        {
          height,
          borderRadius: height / 2,
          backgroundColor: backgroundColor ?? theme.border,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <View
        style={{
          width: `${clamped}%`,
          height: '100%',
          backgroundColor: fillColor ?? theme.primary,
          borderRadius: height / 2,
        }}
      />
    </View>
  );
};

export default ProgressBar; 