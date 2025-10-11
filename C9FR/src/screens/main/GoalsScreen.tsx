import React, { useContext, useState, useCallback } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Goal, CreateGoalRequest } from '../../types';
import { useGoals } from '../../hooks/useGoals';
import { showToast } from '../../utils/toast';

// Import components with proper default imports
import ProgressBar from '../../components/ProgressBar';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorBoundary from '../../components/ErrorBoundary';
import AddGoalModal from '../../components/AddGoalModal';
import AIInsightsDrawer from '../../components/AIInsightsDrawer';

const GoalsScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  
  // Use the useGoals hook for state management with safe defaults
  const hookResult = useGoals();
  const goals = Array.isArray(hookResult.goals) ? hookResult.goals : [];
  const loading = hookResult.loading;
  const error = hookResult.error;
  const createNewGoal = hookResult.createNewGoal;
  const loadGoals = hookResult.loadGoals;
  
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [creatingGoal, setCreatingGoal] = useState(false);
  const [selectedGoalForInsights, setSelectedGoalForInsights] = useState<Goal | null>(null);
  const [showInsightsDrawer, setShowInsightsDrawer] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);

  const calcPct = (cur: number, tgt: number) => Math.min((cur / tgt) * 100, 100);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadGoals(false);
    setRefreshing(false);
  }, [loadGoals]);

  const handleCreateGoal = useCallback(async (goalData: CreateGoalRequest) => {
    setCreatingGoal(true);
    try {
      await createNewGoal(goalData);
      showToast.success('Goal created successfully!');
      setShowAddGoalModal(false);
    } catch (error) {
      console.error('Failed to create goal:', error);
      throw error; // Re-throw to let AddGoalModal handle the error
    } finally {
      setCreatingGoal(false);
    }
  }, [createNewGoal]);

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
                    : goal.image_url || 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=600&q=80'
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
                <ProgressBar value={pct} height={8} fillColor={theme.success} />
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
                  backgroundColor: theme.accentMuted,
                  borderColor: theme.accent + '33',
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
                <MaterialCommunityIcons name="sparkles" size={18} color={theme.accent} style={{ marginRight: 8, marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', color: theme.accent, marginBottom: 2 }}>AI Insights</Text>
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