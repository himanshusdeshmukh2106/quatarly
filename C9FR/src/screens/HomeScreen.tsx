import React, { useState, useContext } from 'react';
import { StyleSheet, useWindowDimensions, Text, View, TouchableOpacity, StatusBar } from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import { ThemeContext } from '../context/ThemeContext';
import { Typography } from '../styles/designSystem';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import GoalsScreen from './main/GoalsScreen';
import DebtScreen from './main/DebtScreen';
import ExpensesScreen from './main/ExpensesScreen';
import AssetsScreenFinal from './main/AssetsScreenFinal';
import OpportunitiesScreen from './main/OpportunitiesScreen';
import ProfileModal from '../components/ProfileModal';
import ErrorBoundary from '../components/ErrorBoundary';

const renderScene = SceneMap({
  goals: GoalsScreen,
  debt: DebtScreen,
  expenses: ExpensesScreen,
  investments: () => (
    <ErrorBoundary>
      <AssetsScreenFinal />
    </ErrorBoundary>
  ),
  opportunities: OpportunitiesScreen,
});

// type RootStackParamList = {
//     Home: undefined;
//     Profile: undefined;
// };
  
// type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Route {
    key: string;
    title: string;
    icon: string;
}

const HomeScreen = () => {
  const layout = useWindowDimensions();
  const { theme } = useContext(ThemeContext);
  // const navigation = useNavigation<HomeScreenNavigationProp>();
  const [index, setIndex] = useState(2); // Default to Expenses
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [routes] = useState<Route[]>([
    { key: 'goals', title: 'Goals', icon: 'flag-checkered' },
    { key: 'debt', title: 'Debt', icon: 'credit-card-minus-outline' },
    { key: 'expenses', title: 'Expenses', icon: 'cart-outline' },
    { key: 'investments', title: 'Assets', icon: 'chart-line' },
    { key: 'opportunities', title: 'Opportunities', icon: 'lightbulb-on-outline' },
  ]);

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => {
            setProfileModalVisible(true);
          }}
          accessibilityLabel="Open profile"
          accessibilityHint="Tap to open your profile"
          activeOpacity={0.7}
        >
            <Icon name="account-circle-outline" size={32} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{routes[index].title}</Text>
        <TouchableOpacity style={styles.menuButton}>
            <Icon name="apps" size={32} color="white" />
        </TouchableOpacity>
    </View>
  );

  return (
    <>
      {renderHeader()}
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        tabBarPosition="bottom"
        renderTabBar={props => (
            <View style={[styles.tabbar, { backgroundColor: theme.card }]}>
              {props.navigationState.routes.map((route, i) => {
                const color = index === i ? theme.primary : theme.textMuted;
                return (
                  <TouchableOpacity
                    key={route.key}
                    style={styles.tabItem}
                    onPress={() => setIndex(i)}>
                    <Icon name={route.icon} size={26} color={color} />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
      />
      
      <ProfileModal 
        visible={profileModalVisible} 
        onClose={() => {
          console.log('Closing profile modal');
          setProfileModalVisible(false);
        }} 
      />
    </>
  );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: (StatusBar.currentHeight || 0) + 24,
        paddingBottom: 24,
        backgroundColor: '#0ea5e9', // Premium blue from design system
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    profileButton: {
        padding: 12,
        borderRadius: 24,
        minWidth: 48,
        minHeight: 48,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(10px)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    menuButton: {
        padding: 12,
        borderRadius: 24,
        minWidth: 48,
        minHeight: 48,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(10px)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    headerTitle: {
        fontFamily: Typography.fontFamily.heading,
        color: 'white',
        fontSize: 24,
        // fontWeight removed - bold is in the font file itself
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    tabbar: {
        flexDirection: 'row',
        height: 72,
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderTopWidth: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 8,
        paddingBottom: 8,
        paddingTop: 8,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    }
});

export default HomeScreen;