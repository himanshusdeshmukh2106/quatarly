import React, { useContext, useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ProgressBar from '../../components/ProgressBar';
import AddGoalModal from '../../components/AddGoalModal';
import AIInsightsDrawer from '../../components/AIInsightsDrawer';
import { Goal, CreateGoalRequest } from '../../types';
import { fetchGoals, createGoal } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorBoundary from '../../components/ErrorBoundary';
import { showToast } from '../../utils/toast';

const GoalsScreen: React.FC = () => {
  const { theme, isDarkMode } = useContext(ThemeContext);
  
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [creatingGoal, setCreatingGoal] = useState(false);
  const [selectedGoalForInsights, setSelectedGoalForInsights] = useState<Goal | null>(null);
  const [showInsightsDrawer, setShowInsightsDrawer] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);

  const calcPct = (cur: number, tgt: number) => Math.min((cur / tgt) * 100, 100);

  const loadGoals = async () => {
    try {
      const goalsData = await fetchGoals();
      setGoals(goalsData);
    } catch (error) {
      console.error('Failed to load goals:', error);
      showToast.error('Failed to load goals. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadGoals();
  };

  const handleCreateGoal = async (goalData: CreateGoalRequest) => {
    setCreatingGoal(true);
    try {
      const newGoal = await createGoal(goalData);
      setGoals(prevGoals => [newGoal, ...prevGoals]);
      showToast.success('Goal created successfully!');
    } catch (error) {
      console.error('Failed to create goal:', error);
      throw error; // Re-throw to let AddGoalModal handle the error
    } finally {
      setCreatingGoal(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading goals..." />;
  }

  return (
    <ErrorBoundary>
      <ScrollView 
        style={{ flex: 1, backgroundColor: theme.background }} 
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >

      {goals.map((goal) => {
        const pct = calcPct(goal.currentAmount, goal.targetAmount);
        return (
          <View key={goal.id} style={{ marginBottom: 24 }}>
            {/* Goal Card */}
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {/* header image */}
              <Image 
                source={{ 
                  uri: imageErrors.has(goal.id) 
                    ? 'https://via.placeholder.com/600x240/4F46E5/FFFFFF?text=Goal' 
                    : goal.image 
                }} 
                style={styles.headerImage} 
                resizeMode="cover"
                onError={() => {
                  console.warn(`Failed to load image for goal: ${goal.title}`);
                  setImageErrors(prev => new Set([...prev, goal.id]));
                }}
              />
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
            <TouchableOpacity
              style={[
                styles.card,
                {
                  backgroundColor: isDarkMode ? theme.primary + '14' : theme.primary + '0D',
                  borderColor: theme.primary + '33',
                  marginTop: 8,
                },
              ]}
              onPress={() => {
                setSelectedGoalForInsights(goal);
                setShowInsightsDrawer(true);
              }}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: 'row', padding: 16 }}>
                <MaterialCommunityIcons name="sparkles" size={18} color={theme.primary} style={{ marginRight: 8, marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', color: theme.primary, marginBottom: 2 }}>AI Insights</Text>
                  <Text style={{ color: theme.text }}>{goal.aiAnalysis}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        );
      })}

      {/* add new goal card */}
      <TouchableOpacity 
        style={[styles.addCard, { borderColor: theme.border }]}
        onPress={() => setShowAddGoalModal(true)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="plus" size={28} color={theme.primary} />
        <Text style={{ fontWeight: '600', color: theme.text, marginTop: 4 }}>Add New Goal</Text>
      </TouchableOpacity>
    </ScrollView>

    {/* Add Goal Modal */}
    <AddGoalModal
      visible={showAddGoalModal}
      onClose={() => setShowAddGoalModal(false)}
      onSubmit={handleCreateGoal}
      loading={creatingGoal}
    />

    {/* AI Insights Drawer */}
    <AIInsightsDrawer
      visible={showInsightsDrawer}
      goal={selectedGoalForInsights}
      onClose={() => setShowInsightsDrawer(false)}
    />
    </ErrorBoundary>
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