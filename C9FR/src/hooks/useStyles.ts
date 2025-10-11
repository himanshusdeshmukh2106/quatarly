/**
 * useStyles Hook
 * 
 * Memoizes StyleSheet creation based on theme to prevent
 * recreating style objects on every render
 */

import { useMemo, useContext } from 'react';
import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

/**
 * Named styles type
 */
type NamedStyles<T> = {
  [P in keyof T]: ViewStyle | TextStyle | ImageStyle;
};

/**
 * Hook for creating memoized styles based on theme
 * 
 * @param styleFactory - Function that creates styles based on theme
 * @returns Memoized styles
 * 
 * @example
 * const useComponentStyles = () => {
 *   return useStyles((theme) => ({
 *     container: {
 *       backgroundColor: theme.background,
 *       padding: 16,
 *     },
 *     text: {
 *       color: theme.text,
 *       fontSize: 16,
 *     },
 *   }));
 * };
 * 
 * // In component
 * const styles = useComponentStyles();
 * <View style={styles.container}>
 *   <Text style={styles.text}>Hello</Text>
 * </View>
 */
export const useStyles = <T extends NamedStyles<T>>(
  styleFactory: (theme: any) => T
): T => {
  const { theme } = useContext(ThemeContext);

  return useMemo(() => {
    const styles = styleFactory(theme);
    return StyleSheet.create(styles) as T;
  }, [theme, styleFactory]);
};

/**
 * Hook for creating memoized styles without theme dependency
 * 
 * @param styleFactory - Function that creates styles
 * @returns Memoized styles
 * 
 * @example
 * const useComponentStyles = () => {
 *   return useStaticStyles(() => ({
 *     container: {
 *       padding: 16,
 *       borderRadius: 8,
 *     },
 *   }));
 * };
 */
export const useStaticStyles = <T extends NamedStyles<T>>(
  styleFactory: () => T
): T => {
  return useMemo(() => {
    const styles = styleFactory();
    return StyleSheet.create(styles) as T;
  }, [styleFactory]);
};
