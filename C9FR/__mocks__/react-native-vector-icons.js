import React from 'react';
import { Text } from 'react-native';

const MockIcon = (props) => {
  return React.createElement(Text, props, props.name || 'Icon');
};

MockIcon.getImageSource = () => Promise.resolve('');
MockIcon.loadFont = () => Promise.resolve();

export default MockIcon;