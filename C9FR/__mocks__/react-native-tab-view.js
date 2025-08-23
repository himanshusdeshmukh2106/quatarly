import React from 'react';
import { View, Text } from 'react-native';

export const TabView = ({ children, ...props }) => {
  return React.createElement(View, props, children);
};

export const SceneMap = (scenes) => {
  return ({ route }) => {
    const Scene = scenes[route.key];
    return Scene ? React.createElement(Scene) : React.createElement(View);
  };
};

export const TabBar = ({ ...props }) => {
  return React.createElement(View, props);
};

export default {
  TabView,
  SceneMap,
  TabBar,
};