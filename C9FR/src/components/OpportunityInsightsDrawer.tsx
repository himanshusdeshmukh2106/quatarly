import React, { useRef, useContext, memo, useCallback } from 'react';
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
import { Opportunity } from '../types';

interface OpportunityInsightsDrawerProps {
  visible: boolean;
  opportunity: Opportunity | null;
  onClose: () => void;
}

const OpportunityInsightsDrawer: React.FC<OpportunityInsightsDrawerProps> = ({
  visible,
  opportunity,
  onClose,
}) => {
  const { theme } = useContext(ThemeContext);
  const panY = useRef(new Animated.Value(1000)).current;

  const closeSheet = useCallback(() => {
    Animated.timing(panY, {
      toValue: 1000, // Animate off-screen
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  }, [panY, onClose]);

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

  if (!opportunity) return null;

  const getCategoryIcon = (category: string): string => {
    const iconMap: Record<string, string> = {
      'debt_management': 'credit-card-off',
      'job_opportunities': 'briefcase',
      'investment': 'trending-up',
      'emergency_fund': 'shield-check',
      'insurance': 'shield-account',
      'skill_development': 'school',
      'side_income': 'cash-multiple',
      'general': 'lightbulb',
    };
    return iconMap[category] || 'lightbulb';
  };

  const getCategoryColor = (category: string): string => {
    const colorMap: Record<string, string> = {
      'debt_management': '#ef4444',
      'job_opportunities': '#3b82f6',
      'investment': '#22c55e',
      'emergency_fund': '#f59e0b',
      'insurance': '#8b5cf6',
      'skill_development': '#06b6d4',
      'side_income': '#10b981',
      'general': '#6b7280',
    };
    return colorMap[category] || '#6b7280';
  };

  const getPriorityColor = (priority: string): string => {
    const priorityColors = {
      'high': '#ef4444',
      'medium': '#f59e0b',
      'low': '#22c55e',
    };
    return priorityColors[priority as keyof typeof priorityColors] || '#6b7280';
  };

  const formatCategoryName = (category: string): string => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

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
                name={getCategoryIcon(opportunity.category)} 
                size={24} 
                color={getCategoryColor(opportunity.category)} 
                style={styles.headerIcon} 
              />
              <View style={styles.headerText}>
                <Text style={[styles.categoryText, { color: theme.textMuted }]}>
                  {formatCategoryName(opportunity.category)}
                </Text>
                <Text style={[styles.headerTitle, { color: theme.text }]}>
                  {opportunity.title}
                </Text>
              </View>
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
            {/* Opportunity Summary Card */}
            <View style={[styles.summaryCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Priority</Text>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(opportunity.priority) + '20' }]}>
                  <Text style={[styles.priorityText, { color: getPriorityColor(opportunity.priority) }]}>
                    {opportunity.priority.toUpperCase()}
                  </Text>
                </View>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Relevance Score</Text>
                <Text style={[styles.summaryValue, { color: theme.primary }]}>
                  {Math.round(opportunity.relevanceScore * 100)}%
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Category</Text>
                <Text style={[styles.summaryValue, { color: theme.text }]}>
                  {formatCategoryName(opportunity.category)}
                </Text>
              </View>
            </View>

            {/* Offer Details Card */}
            {(opportunity.originalPrice || opportunity.discountedPrice || opportunity.provider || opportunity.expiresAt) && (
              <View style={[styles.offerCard, { backgroundColor: getCategoryColor(opportunity.category) + '10', borderColor: getCategoryColor(opportunity.category) + '30' }]}>
                <View style={styles.offerHeader}>
                  <MaterialCommunityIcons 
                    name="tag" 
                    size={20} 
                    color={getCategoryColor(opportunity.category)} 
                  />
                  <Text style={[styles.offerTitle, { color: getCategoryColor(opportunity.category) }]}>
                    Offer Details
                  </Text>
                </View>
                
                {opportunity.provider && (
                  <View style={styles.offerDetailRow}>
                    <Text style={[styles.offerDetailLabel, { color: theme.textMuted }]}>
                      Provider:
                    </Text>
                    <Text style={[styles.offerDetailValue, { color: theme.text }]}>
                      {opportunity.provider}
                    </Text>
                  </View>
                )}
                
                {opportunity.originalPrice && (
                  <View style={styles.offerDetailRow}>
                    <Text style={[styles.offerDetailLabel, { color: theme.textMuted }]}>
                      {opportunity.discountedPrice ? 'Original Price:' : 'Price:'}
                    </Text>
                    <Text style={[styles.offerDetailValue, { color: opportunity.discountedPrice ? theme.textMuted : theme.text, textDecorationLine: opportunity.discountedPrice ? 'line-through' : 'none' }]}>
                      ₹{opportunity.originalPrice.toLocaleString('en-IN')}
                    </Text>
                  </View>
                )}
                
                {opportunity.discountedPrice && (
                  <View style={styles.offerDetailRow}>
                    <Text style={[styles.offerDetailLabel, { color: theme.textMuted }]}>
                      Discounted Price:
                    </Text>
                    <Text style={[styles.offerDetailValue, { color: '#4CAF50', fontWeight: '600' }]}>
                      ₹{opportunity.discountedPrice.toLocaleString('en-IN')}
                    </Text>
                  </View>
                )}
                
                {opportunity.discountPercentage && (
                  <View style={styles.offerDetailRow}>
                    <Text style={[styles.offerDetailLabel, { color: theme.textMuted }]}>
                      Discount:
                    </Text>
                    <Text style={[styles.offerDetailValue, { color: '#4CAF50', fontWeight: '600' }]}>
                      {opportunity.discountPercentage}% OFF
                    </Text>
                  </View>
                )}
                
                {opportunity.expiresAt && (
                  <View style={styles.offerDetailRow}>
                    <Text style={[styles.offerDetailLabel, { color: theme.textMuted }]}>
                      Expires:
                    </Text>
                    <Text style={[styles.offerDetailValue, { color: theme.text }]}>
                      {new Date(opportunity.expiresAt).toLocaleDateString('en-IN')}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Description */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Description</Text>
              <Text style={[styles.descriptionText, { color: theme.text }]}>
                {opportunity.description}
              </Text>
            </View>

            {/* AI Analysis */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>AI Analysis</Text>
              <Text style={[styles.analysisText, { color: theme.text }]}>
                {opportunity.aiInsights}
              </Text>
            </View>

            {/* Action Steps */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Action Steps</Text>
              {opportunity.actionSteps.map((step, index) => (
                <View key={index} style={styles.actionStep}>
                  <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={[styles.stepText, { color: theme.text }]}>
                    {step}
                  </Text>
                </View>
              ))}
            </View>

            {/* Why This Matters */}
            <View style={[styles.section, styles.lastSection]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Why This Matters</Text>
              <View style={[styles.whyCard, { backgroundColor: getCategoryColor(opportunity.category) + '10', borderColor: getCategoryColor(opportunity.category) + '30' }]}>
                <MaterialCommunityIcons 
                  name="information" 
                  size={20} 
                  color={getCategoryColor(opportunity.category)} 
                />
                <View style={styles.whyContent}>
                  <Text style={[styles.whyText, { color: theme.text }]}>
                    This opportunity is specifically tailored to your financial profile and current situation. 
                    Taking action on this could significantly improve your financial health and help you achieve your goals faster.
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
    height: '80%',
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
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 24,
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
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 24,
  },
  lastSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  analysisText: {
    fontSize: 16,
    lineHeight: 24,
  },
  actionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  whyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  whyContent: {
    flex: 1,
    marginLeft: 12,
  },
  whyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  offerCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  offerDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  offerDetailLabel: {
    fontSize: 14,
    flex: 1,
  },
  offerDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
});

export default memo(OpportunityInsightsDrawer);