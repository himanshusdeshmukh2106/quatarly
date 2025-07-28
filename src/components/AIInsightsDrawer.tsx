import React, { useRef, useContext } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  PanResponder,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Goal } from '../types';

interface AIInsightsDrawerProps {
  visible: boolean;
  goal: Goal | null;
  onClose: () => void;
}

const AIInsightsDrawer: React.FC<AIInsightsDrawerProps> = ({
  visible,
  goal,
  onClose,
}) => {
  const { theme } = useContext(ThemeContext);
  const panY = useRef(new Animated.Value(1000)).current;

  const closeSheet = () => {
    Animated.timing(panY, {
      toValue: 1000, // Animate off-screen
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
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
    // Run animation on next tick so Modal has mounted
    setTimeout(() => {
      Animated.timing(panY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 0);
  };

  React.useEffect(() => {
    if (visible) {
      openSheet();
    }
  }, [visible]);

  if (!goal) return null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);

  const progressPercentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  const remainingAmount = goal.targetAmount - goal.currentAmount;

  return (
    <Modal
      visible={visible}
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
          style={[
            styles.drawerContainer,
            {
              backgroundColor: theme.card,
              transform: [{ translateY: panY }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Handle bar */}
          <View style={[styles.handleBar, { backgroundColor: theme.border }]} />
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <MaterialCommunityIcons 
                name="sparkles" 
                size={24} 
                color={theme.primary} 
                style={styles.headerIcon} 
              />
              <Text style={[styles.headerTitle, { color: theme.text }]}>
                AI Insights for {goal.title}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={closeSheet} 
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Goal Summary Card */}
            <View style={[styles.summaryCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Current Progress</Text>
                <Text style={[styles.summaryValue, { color: theme.text }]}>
                  {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Completion</Text>
                <Text style={[styles.summaryValue, { color: theme.primary }]}>
                  {Math.round(progressPercentage)}%
                </Text>
              </View>
              {remainingAmount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Remaining</Text>
                  <Text style={[styles.summaryValue, { color: theme.text }]}>
                    {formatCurrency(remainingAmount)}
                  </Text>
                </View>
              )}
            </View>

            {/* AI Analysis */}
            <View style={styles.analysisSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>AI Analysis</Text>
              <Text style={[styles.analysisText, { color: theme.text }]}>
                {goal.aiAnalysis}
              </Text>
            </View>

            {/* Recommendations */}
            <View style={styles.recommendationsSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Smart Recommendations</Text>
              
              {progressPercentage < 25 && (
                <View style={[styles.recommendationCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
                  <MaterialCommunityIcons name="rocket-launch" size={20} color="#22c55e" />
                  <View style={styles.recommendationContent}>
                    <Text style={[styles.recommendationTitle, { color: theme.text }]}>Get Started</Text>
                    <Text style={[styles.recommendationText, { color: theme.textMuted }]}>
                      Set up automatic transfers to build momentum towards your goal.
                    </Text>
                  </View>
                </View>
              )}

              {progressPercentage >= 25 && progressPercentage < 75 && (
                <View style={[styles.recommendationCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
                  <MaterialCommunityIcons name="trending-up" size={20} color="#3b82f6" />
                  <View style={styles.recommendationContent}>
                    <Text style={[styles.recommendationTitle, { color: theme.text }]}>Keep Going</Text>
                    <Text style={[styles.recommendationText, { color: theme.textMuted }]}>
                      You're making great progress! Consider increasing your monthly contribution by 10%.
                    </Text>
                  </View>
                </View>
              )}

              {progressPercentage >= 75 && progressPercentage < 100 && (
                <View style={[styles.recommendationCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
                  <MaterialCommunityIcons name="flag-checkered" size={20} color="#f59e0b" />
                  <View style={styles.recommendationContent}>
                    <Text style={[styles.recommendationTitle, { color: theme.text }]}>Almost There!</Text>
                    <Text style={[styles.recommendationText, { color: theme.textMuted }]}>
                      You're so close! Consider a final push to reach your goal ahead of schedule.
                    </Text>
                  </View>
                </View>
              )}

              {progressPercentage >= 100 && (
                <View style={[styles.recommendationCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
                  <MaterialCommunityIcons name="trophy" size={20} color="#eab308" />
                  <View style={styles.recommendationContent}>
                    <Text style={[styles.recommendationTitle, { color: theme.text }]}>Goal Achieved!</Text>
                    <Text style={[styles.recommendationText, { color: theme.textMuted }]}>
                      Congratulations! Consider setting a new goal to continue your financial journey.
                    </Text>
                  </View>
                </View>
              )}

              {/* General tip */}
              <View style={[styles.recommendationCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <MaterialCommunityIcons name="lightbulb" size={20} color="#8b5cf6" />
                <View style={styles.recommendationContent}>
                  <Text style={[styles.recommendationTitle, { color: theme.text }]}>Pro Tip</Text>
                  <Text style={[styles.recommendationText, { color: theme.textMuted }]}>
                    Track your progress weekly and celebrate small milestones to stay motivated.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    height: '75%',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  summaryCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  analysisSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  analysisText: {
    fontSize: 16,
    lineHeight: 24,
  },
  recommendationsSection: {
    marginBottom: 20,
  },
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  recommendationContent: {
    flex: 1,
    marginLeft: 12,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default AIInsightsDrawer;