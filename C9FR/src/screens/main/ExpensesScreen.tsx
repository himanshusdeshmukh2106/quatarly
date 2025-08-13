import React, { useContext, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  PanResponder,
} from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';
// removed LineChart and PagerView imports since net worth chart is gone
import DonutChart from '../../components/DonutChart';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchBudgetNotes } from '../../services/api';

// --- Expense & Budget data (can be swapped for API) ---
const expenseCategories = [
  { name: 'Food & Dining', value: 850, budget: 1105, color: '#ef4444' },
  { name: 'Transportation', value: 420, budget: 546, color: '#f97316' },
  { name: 'Shopping', value: 680, budget: 884, color: '#eab308' },
  { name: 'Entertainment', value: 320, budget: 416, color: '#22c55e' },
  { name: 'Bills & Utilities', value: 1200, budget: 1560, color: '#3b82f6' },
  { name: 'Healthcare', value: 280, budget: 364, color: '#8b5cf6' },
];

const totalExpenses = expenseCategories.reduce((s, c) => s + c.value, 0);

const expenseList = [
  { name: 'Grocery Store', amount: 125.5, category: 'Food & Dining', date: 'Today' },
  { name: 'Gas Station', amount: 45.2, category: 'Transportation', date: 'Yesterday' },
  { name: 'Netflix Subscription', amount: 15.99, category: 'Entertainment', date: '2 days ago' },
  { name: 'Electric Bill', amount: 89.3, category: 'Bills & Utilities', date: '3 days ago' },
  { name: 'Coffee Shop', amount: 12.75, category: 'Food & Dining', date: '3 days ago' },
  { name: 'Online Shopping', amount: 67.99, category: 'Shopping', date: '4 days ago' },
  { name: 'Doctor Visit', amount: 150.0, category: 'Healthcare', date: '5 days ago' },
  { name: 'Restaurant', amount: 42.8, category: 'Food & Dining', date: '6 days ago' },
];

const ExpensesScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);

  const [budgetNotes, setBudgetNotes] = useState<Record<string, string>>({});
  const [commentsVisible, setCommentsVisible] = useState(false);

  const panY = useRef(new Animated.Value(1000)).current;

  const closeSheet = () => {
    Animated.timing(panY, {
      toValue: 1000, // Animate off-screen
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCommentsVisible(false);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      // Decide quickly if we want to claim the gesture (down-swipe only)
      onMoveShouldSetPanResponder: (_, g) => g.dy > 5 && g.vy > 0,
      // Ensure we receive the event even if a child (ScrollView) is involved
      onMoveShouldSetPanResponderCapture: (_, g) => g.dy > 5 && g.vy > 0,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) panY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 150 || g.vy > 1.2) {
          closeSheet();
        } else {
          Animated.spring(panY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    }),
  ).current;

  const openSheet = () => {
    // Reset position off-screen first
    panY.setValue(1000);
    setCommentsVisible(true);
    // Run animation on next tick so Modal has mounted
    setTimeout(() => {
      Animated.timing(panY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 0);
  }

  useEffect(() => {
    // TODO: supply auth token if needed
    fetchBudgetNotes()
      .then(setBudgetNotes)
      .catch((e) => console.log('Failed to fetch budget notes', e));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Pie Chart */}
        <View style={{ alignItems: 'center', marginVertical: 10 }}>
          <View style={{width: 220, height: 220, alignItems: 'center', justifyContent: 'center'}}>
            <DonutChart
              data={expenseCategories.map(c => ({
                value: c.value,
                color: c.color,
                label: `${((c.value / totalExpenses) * 100).toFixed(0)}%`,
              }))}
            />
          </View>
        </View>

        {/* Budget Overview */}
        <View style={{ marginTop: 10 }}>
          <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 8 }]}>Budget Overview</Text>

          {expenseCategories.map((cat) => {
            const usedPct = (cat.value / cat.budget) * 100;
            return (
              <View key={cat.name} style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {(() => {
                      const iconMap: Record<string, string> = {
                        'Food & Dining': 'silverware-fork-knife',
                        Transportation: 'car',
                        Shopping: 'shopping',
                        Entertainment: 'television',
                        'Bills & Utilities': 'file-document',
                        Healthcare: 'medical-bag',
                      };
                      const iconName = iconMap[cat.name] || 'cash';
                      return <MaterialCommunityIcons name={iconName} size={16} color={cat.color} style={{ marginRight: 6 }} />;
                    })()}
                    <Text style={{ color: theme.text }}>{cat.name}</Text>
                  </View>
                  <Text style={{ color: theme.text }}>₹{cat.value} / ₹{cat.budget}</Text>
                </View>
                <View style={{ height: 6, borderRadius: 3, backgroundColor: theme.border, marginTop: 4 }}>
                  <View style={{ width: `${Math.min(usedPct, 100)}%`, height: '100%', borderRadius: 3, backgroundColor: cat.color }} />
                </View>
                {/* Removed percentage used text */}

                {/* per-category note removed; consolidated note below list */}
              </View>
            );
          })}

          {/* Consolidated AI note box (clickable) */}
          <TouchableOpacity onPress={openSheet} activeOpacity={0.8}>
            <View style={{ backgroundColor: '#dbeafe', padding: 24, borderRadius: 16, marginTop: 16 }}>
              <Text style={{ color: '#1e40af', fontSize: 18, lineHeight: 26, fontWeight: '600' }}>
                {Object.values(budgetNotes).length > 0
                  ? Object.values(budgetNotes).join('\n')
                  : 'Placeholder: You’re getting close to exceeding your budget. Chill out!'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Comments Drawer */}
          <Modal
            visible={commentsVisible}
            animationType="fade"
            transparent
            onRequestClose={closeSheet}
          >
            <View style={{ flex: 1, justifyContent: 'flex-end' }} pointerEvents="box-none">
              {/* Backdrop – tap outside to close */}
              <TouchableWithoutFeedback onPress={closeSheet}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' }} />
              </TouchableWithoutFeedback>
              <Animated.View
                style={{
                  backgroundColor: theme.card,
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  paddingHorizontal: 16,
                  paddingTop: 8,
                  paddingBottom: 24,
                  height: '65%',
                  transform: [{ translateY: panY }],
                }}
                {...panResponder.panHandlers}
              >
                <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: theme.border, alignSelf: 'center', marginBottom: 8 }} />
                {/* Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ color: theme.text, fontSize: 20, fontWeight: 'bold' }}>Comments</Text>
                  <TouchableOpacity onPress={closeSheet} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={{ color: theme.text, fontSize: 24 }}>×</Text>
                  </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                  {['Top', 'Timed', 'Newest'].map((tab) => (
                    <View key={tab} style={{ paddingVertical: 6, paddingHorizontal: 14, backgroundColor: theme.card, borderRadius: 16, borderWidth: 1, borderColor: theme.border, marginRight: 8 }}>
                      <Text style={{ color: theme.text }}>{tab}</Text>
                    </View>
                  ))}
                </View>

                {/* Guidelines */}
                <Text style={{ color: theme.textMuted, fontSize: 12, marginBottom: 12 }}>Remember to keep comments respectful and to follow our Community Guidelines</Text>

                {/* Comments list placeholder */}
                <ScrollView>
                  <Text style={{ color: theme.text, fontSize: 16 }}>
                    {/* Placeholder comment text */}
                    {Object.values(budgetNotes).length > 0
                      ? Object.values(budgetNotes).join('\n')
                      : 'Placeholder: You’re getting close to exceeding your budget. Chill out!'}
                  </Text>
                </ScrollView>
              </Animated.View>
            </View>
          </Modal>
        </View>

        {/* Recent expense list */}
        <View style={{ marginTop:20 }}>
          <Text style={[styles.sectionTitle, { color:theme.text, marginBottom:8 }]}>Recent Expenses</Text>
          {expenseList.map((ex)=> (
            <View key={ex.name+ex.date} style={{ flexDirection:'row', justifyContent:'space-between', paddingVertical:10, borderBottomWidth:1, borderColor:theme.border }}>
              <View style={{ flex:1 }}>
                <Text style={{ color:theme.text, fontSize:16 }}>{ex.name}</Text>
                <Text style={{ color:theme.textMuted, fontSize:14 }}>{ex.category} • {ex.date}</Text>
              </View>
              <Text style={{ color:theme.text, fontSize:16 }}>-₹{ex.amount.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  netWorthNumber: {
    position: 'absolute',
    top: 0,
    left: 10,
    fontSize: 20,
    fontWeight: 'bold',
    zIndex: 1,
  },
  chartLabelContainer: {
    position: 'absolute',
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartLabel: {
    position: 'absolute',
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
    paddingHorizontal: 10,
  },
  toggleButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  buttonText: {
    fontSize: 16,
  },
});

export default ExpensesScreen; 