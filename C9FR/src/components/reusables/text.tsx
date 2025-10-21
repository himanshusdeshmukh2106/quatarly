import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from 'react-native';
import { perplexityColors } from '../../theme/perplexityTheme';

type TextVariant = 'heading1' | 'heading2' | 'heading3' | 'body' | 'bodySmall' | 'caption';
type TextWeight = '400' | '500' | '600' | '700';
type TextColor = 'foreground' | 'text' | 'quiet' | 'quieter' | 'super' | 'success' | 'danger' | 'warning';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  weight?: TextWeight;
  color?: TextColor;
}

const Text = React.forwardRef<RNText, TextProps>(
  ({ variant = 'body', weight = '400', color = 'text', style, ...props }, ref) => {
    const textStyle: TextStyle = {
      ...getVariantStyle(variant),
      ...getWeightStyle(weight),
      ...getColorStyle(color),
    };

    return (
      <RNText
        ref={ref}
        style={[textStyle, style]}
        {...props}
      />
    );
  }
);

const getVariantStyle = (variant: TextVariant): TextStyle => {
  switch (variant) {
    case 'heading1':
      return { fontSize: 32, lineHeight: 40 };
    case 'heading2':
      return { fontSize: 24, lineHeight: 32 };
    case 'heading3':
      return { fontSize: 20, lineHeight: 28 };
    case 'body':
      return { fontSize: 16, lineHeight: 24 };
    case 'bodySmall':
      return { fontSize: 14, lineHeight: 20 };
    case 'caption':
      return { fontSize: 12, lineHeight: 16 };
    default:
      return { fontSize: 16, lineHeight: 24 };
  }
};

const getWeightStyle = (weight: TextWeight): TextStyle => {
  switch (weight) {
    case '400':
      return { fontWeight: '400' };
    case '500':
      return { fontWeight: '500' };
    case '600':
      return { fontWeight: '600' };
    case '700':
      return { fontWeight: '700' };
    default:
      return { fontWeight: '400' };
  }
};

const getColorStyle = (color: TextColor): TextStyle => {
  switch (color) {
    case 'foreground':
      return { color: perplexityColors.foreground };
    case 'text':
      return { color: perplexityColors.text };
    case 'quiet':
      return { color: perplexityColors.quiet };
    case 'quieter':
      return { color: perplexityColors.quieter };
    case 'super':
      return { color: perplexityColors.super };
    case 'success':
      return { color: perplexityColors.success };
    case 'danger':
      return { color: perplexityColors.danger };
    case 'warning':
      return { color: perplexityColors.warning };
    default:
      return { color: perplexityColors.text };
  }
};

Text.displayName = 'Text';

export { Text };
