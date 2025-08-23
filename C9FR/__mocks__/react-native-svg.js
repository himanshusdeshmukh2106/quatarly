import React from 'react';

// Mock Svg component
const Svg = ({ children, ...props }) => {
  return React.createElement('RNSVGSvgView', props, children);
};

// Mock Line component
const Line = (props) => {
  return React.createElement('RNSVGLine', props);
};

// Mock Path component
const Path = (props) => {
  return React.createElement('RNSVGPath', props);
};

// Mock G component
const G = ({ children, ...props }) => {
  return React.createElement('RNSVGGroup', props, children);
};

// Mock Text component
const Text = (props) => {
  return React.createElement('RNSVGText', props);
};

export default Svg;
export { Line, Path, G, Text };