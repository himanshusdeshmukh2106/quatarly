import React, { useContext, useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Opportunity } from '../../types';
import { fetchOpportunities, refreshOpportunities } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorBoundary from '../../components/ErrorBoundary';
import OpportunityCard from '../../components/OpportunityCard';
import OpportunityInsightsDrawer from '../../components/OpportunityInsightsDrawer';
import { showToast } from '../../utils/toast';

const OpportunitiesScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [showInsightsDrawer, setShowInsightsDrawer] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOpportunities = async () => {
    try {
      setError(null);
      const opportunitiesData = await fetchOpportunities();
      setOpportunities(opportunitiesData);
    } catch (error) {
      console.error('Failed to load opportunities:', error);
      setError('Failed to load opportunities. Please check your connection and try again.');
      showToast.error('Failed to load opportunities. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      setError(null);
      
      // Synchronously refresh opportunities
      const refreshedOpportunities = await refreshOpportunities();
      
      if (refreshedOpportunities && refreshedOpportunities.length > 0) {
        setOpportunities(refreshedOpportunities);
      } else {
        setOpportunities([]);
      }
      
    } catch (error) {
      console.error('Failed to refresh opportunities:', error);
      setError('Failed to refresh opportunities. Please try again.');
      showToast.error('Failed to refresh opportunities. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleInsightsPress = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowInsightsDrawer(true);
  };

  const handleInsightsClose = () => {
    setShowInsightsDrawer(false);
    setSelectedOpportunity(null);
  };

  // const groupOpportunitiesByCategory = () => {
  //   const grouped: Record<string, Opportunity[]> = {};
  //   
  //   opportunities.forEach(opportunity => {
  //     if (!grouped[opportunity.category]) {
  //       grouped[opportunity.category] = [];
  //     }
  //     grouped[opportunity.category].push(opportunity);
  //   });

  //   // Sort opportunities within each category by priority and relevance
  //   Object.keys(grouped).forEach(category => {
  //     grouped[category].sort((a, b) => {
  //       // Priority order: high = 3, medium = 2, low = 1
  //       const priorityOrder = { high: 3, medium: 2, low: 1 };
  //       const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 1;
  //       const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 1;
  //       
  //       if (aPriority !== bPriority) {
  //         return bPriority - aPriority; // Higher priority first
  //       }
  //       
  //       // If same priority, sort by relevance score
  //       return b.relevanceScore - a.relevanceScore;
  //     });
  //   });

  //   return grouped;
  // };

  // const getCategoryDisplayName = (category: string): string => {
  //   const categoryNames: Record<string, string> = {
  //     'debt_management': 'Debt Management',
  //     'job_opportunities': 'Career & Jobs',
  //     'investment': 'Investment',
  //     'emergency_fund': 'Emergency Fund',
  //     'insurance': 'Insurance',
  //     'skill_development': 'Skill Development',
  //     'side_income': 'Side Income',
  //     'general': 'General',
  //   };
  //   return categoryNames[category] || category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  // };

  // const getCategoryIcon = (category: string): string => {
  //   const iconMap: Record<string, string> = {
  //     'debt_management': 'credit-card-off',
  //     'job_opportunities': 'briefcase',
  //     'investment': 'trending-up',
  //     'emergency_fund': 'shield-check',
  //     'insurance': 'shield-account',
  //     'skill_development': 'school',
  //     'side_income': 'cash-multiple',
  //     'general': 'lightbulb',
  //   };
  //   return iconMap[category] || 'lightbulb';
  // };



  useEffect(() => {
    loadOpportunities();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Discovering opportunities..." />;
  }

  return (
    <ErrorBoundary>
      <ScrollView 
        style={{ flex: 1, backgroundColor: theme.background }} 
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="lightbulb" size={28} color={theme.accent} />
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Your Opportunities
          </Text>
        </View>
        <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
          Personalized financial opportunities based on your profile
        </Text>

        {/* Error State */}
        {error && (
          <View style={[styles.errorContainer, { backgroundColor: theme.error + '10', borderColor: theme.error + '30' }]}>
            <MaterialCommunityIcons name="alert-circle" size={20} color={theme.error} />
            <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
          </View>
        )}

        {/* Empty State */}
        {!error && opportunities.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="compass-off" size={64} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No Opportunities Found
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
              Complete your profile questionnaire to get personalized financial opportunities.
            </Text>
          </View>
        )}

        {/* Opportunities List */}
        {opportunities.length > 0 && (
          <View>
            {opportunities
              .sort((a, b) => {
                // Sort by priority first (high = 3, medium = 2, low = 1)
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 1;
                const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 1;
                
                if (aPriority !== bPriority) {
                  return bPriority - aPriority; // Higher priority first
                }
                
                // If same priority, sort by relevance score
                return b.relevanceScore - a.relevanceScore;
              })
              .map(opportunity => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  onPress={handleInsightsPress}
                />
              ))
            }
          </View>
        )}

        {/* Pull to refresh hint */}
        {opportunities.length > 0 && (
          <View style={styles.refreshHint}>
            <MaterialCommunityIcons name="refresh" size={16} color={theme.textMuted} />
            <Text style={[styles.refreshHintText, { color: theme.textMuted }]}>
              Pull down to refresh opportunities
            </Text>
          </View>
        )}
      </ScrollView>

      {/* AI Insights Drawer */}
      <OpportunityInsightsDrawer
        visible={showInsightsDrawer}
        opportunity={selectedOpportunity}
        onClose={handleInsightsClose}
      />
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    marginBottom: 32,
    lineHeight: 22,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  refreshHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  refreshHintText: {
    fontSize: 12,
    marginLeft: 4,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  categoryIcon: {
    marginRight: 8,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  categoryCount: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default OpportunitiesScreen; 