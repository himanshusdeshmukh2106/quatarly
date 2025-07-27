import React, { useContext } from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ProgressBar from '../../components/ProgressBar';

interface Goal {
  id: string;
  title: string;
  currentAmount: number;
  targetAmount: number;
  image: any; // require img local
  logo: string; // bank logo url
  aiAnalysis: string;
}

const goals: Goal[] = [
  {
    id: '1',
    title: 'Emergency Fund',
    currentAmount: 30294.09,
    targetAmount: 50000,
    image: 'https://via.placeholder.com/600x240.png?text=Emergency',
    logo: 'https://logo.clearbit.com/chase.com',
    aiAnalysis:
      "You're 60% towards your emergency fund goal! Consider automating ₹5,000 monthly transfers to reach your target faster.",
  },
  {
    id: '2',
    title: 'Vacation',
    currentAmount: 6589.69,
    targetAmount: 12000,
    image: 'https://via.placeholder.com/600x240.png?text=Vacation',
    logo: 'https://logo.clearbit.com/citi.com',
    aiAnalysis:
      "You're halfway to your dream vacation! Try saving ₹2,000 extra each month and watch out for flight sales.",
  },
  {
    id: '3',
    title: 'Car',
    currentAmount: 4231.33,
    targetAmount: 25000,
    image: 'https://via.placeholder.com/600x240.png?text=Car',
    logo: 'https://logo.clearbit.com/bankofamerica.com',
    aiAnalysis:
      "Great momentum! Parking this money in a high-yield account could earn an extra ₹15,000 before you buy.",
  },
];

const GoalsScreen: React.FC = () => {
  const { theme, isDarkMode } = useContext(ThemeContext);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);

  const calcPct = (cur: number, tgt: number) => Math.min((cur / tgt) * 100, 100);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ padding: 16 }}>

      {goals.map((goal) => {
        const pct = calcPct(goal.currentAmount, goal.targetAmount);
        return (
          <View key={goal.id} style={{ marginBottom: 24 }}>
            {/* Goal Card */}
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {/* header image */}
              <Image source={{ uri: goal.image }} style={styles.headerImage} resizeMode="cover" />
              {/* overlay logo */}
              <View style={[styles.iconWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Image source={{ uri: goal.logo }} style={styles.bankLogo} resizeMode="contain" />
              </View>

              {/* details */}
              <View style={{ padding: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text }}>{goal.title}</Text>
                <Text style={{ fontSize: 22, fontWeight: 'bold', color: theme.text, marginVertical: 4 }}>
                  {formatCurrency(goal.currentAmount)}
                </Text>

                {/* progress */}
                <ProgressBar value={pct} height={8} fillColor="#E86C1A" />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                  <Text style={{ color: theme.textMuted, fontSize: 12 }}>{Math.round(pct)}% complete</Text>
                  <Text style={{ color: theme.textMuted, fontSize: 12 }}>Goal: {formatCurrency(goal.targetAmount)}</Text>
                </View>
              </View>
            </View>

            {/* AI analysis */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: isDarkMode ? theme.primary + '14' : theme.primary + '0D',
                  borderColor: theme.primary + '33',
                  marginTop: 8,
                },
              ]}
            >
              <View style={{ flexDirection: 'row', padding: 16 }}>
                <MaterialCommunityIcons name="sparkles" size={18} color={theme.primary} style={{ marginRight: 8, marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', color: theme.primary, marginBottom: 2 }}>AI Insights</Text>
                  <Text style={{ color: theme.text }}>{goal.aiAnalysis}</Text>
                </View>
              </View>
            </View>
          </View>
        );
      })}

      {/* add new goal card */}
      <View style={[styles.addCard, { borderColor: theme.border }]}>
        <MaterialCommunityIcons name="plus" size={28} color={theme.primary} />
        <Text style={{ fontWeight: '600', color: theme.text, marginTop: 4 }}>Add New Goal</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 2,
  },
  headerImage: {
    width: '100%',
    height: 140,
  },
  iconWrapper: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 24,
    padding: 6,
    elevation: 2,
    borderWidth: StyleSheet.hairlineWidth,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankLogo: {
    width: 22,
    height: 22,
  },
  addCard: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginBottom: 40,
  },
});

export default GoalsScreen; 