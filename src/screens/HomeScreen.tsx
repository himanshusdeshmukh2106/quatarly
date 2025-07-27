import React, { useState, useContext } from 'react';
import { StyleSheet, useWindowDimensions, Text, View, TouchableOpacity } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { ThemeContext } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import GoalsScreen from './main/GoalsScreen';
import DebtScreen from './main/DebtScreen';
import ExpensesScreen from './main/ExpensesScreen';
import InvestmentsScreen from './main/InvestmentsScreen';
import OpportunitiesScreen from './main/OpportunitiesScreen';

const renderScene = SceneMap({
  goals: GoalsScreen,
  debt: DebtScreen,
  expenses: ExpensesScreen,
  investments: InvestmentsScreen,
  opportunities: OpportunitiesScreen,
});

type RootStackParamList = {
    Home: undefined;
    Profile: undefined;
};
  
type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Route {
    key: string;
    title: string;
    icon: string;
}

const HomeScreen = () => {
  const layout = useWindowDimensions();
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [index, setIndex] = useState(2); // Default to Expenses
  const [routes] = useState<Route[]>([
    { key: 'goals', title: 'Goals', icon: 'flag-checkered' },
    { key: 'debt', title: 'Debt', icon: 'credit-card-minus-outline' },
    { key: 'expenses', title: 'Expenses', icon: 'cart-outline' },
    { key: 'investments', title: 'Investments', icon: 'chart-line' },
    { key: 'opportunities', title: 'Opportunities', icon: 'lightbulb-on-outline' },
  ]);

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Icon name="account-circle-outline" size={32} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{routes[index].title}</Text>
        <TouchableOpacity>
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
    </>
  );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
        backgroundColor: '#005A9C',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTitle: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
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