import React, { useState, useContext } from 'react';
import { StyleSheet, useWindowDimensions, Text, View, TouchableOpacity, StatusBar } from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import { ThemeContext } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getHeaderFont } from '../config/fonts';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import GoalsScreen from './main/GoalsScreen';
import DebtScreen from './main/DebtScreen';
import ExpensesScreen from './main/ExpensesScreen';
import OptimizedAssetsScreen from './main/OptimizedAssetsScreen';
import OpportunitiesScreen from './main/OpportunitiesScreen';
import ProfileModal from '../components/ProfileModal';
import ErrorBoundary from '../components/ErrorBoundary';

const renderScene = SceneMap({
  goals: GoalsScreen,
  debt: DebtScreen,
  expenses: ExpensesScreen,
  investments: () => (
    <ErrorBoundary>
      <OptimizedAssetsScreen />
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
        paddingHorizontal: 20,
        paddingTop: (StatusBar.currentHeight || 0) + 20,
        paddingBottom: 20,
        backgroundColor: '#005A9C',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    profileButton: {
        padding: 8,
        borderRadius: 20,
        minWidth: 48,
        minHeight: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuButton: {
        padding: 8,
        borderRadius: 20,
        minWidth: 48,
        minHeight: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontFamily: getHeaderFont('bold'), // FK Grotesk Bold for header title
        color: 'white',
        fontSize: 22,
    },
    tabbar: {
        flexDirection: 'row',
        height: 60,
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    }
});

export default HomeScreen;