import React, { useContext, memo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Opportunity } from '../types';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onPress: (opportunity: Opportunity) => void;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onPress,
}) => {
  const { theme } = useContext(ThemeContext);
  const [imageError, setImageError] = useState(false);

  const getCategoryIcon = (category: string): string => {
    const iconMap: Record<string, string> = {
      'debt_management': 'credit-card-off',
      'job_opportunities': 'briefcase',
      'investment': 'trending-up',
      'emergency_fund': 'shield-check',
      'insurance': 'shield-account',
      'skill_development': 'school',
      'side_income': 'cash-multiple',
      'loan_offers': 'bank',
      'travel_deals': 'airplane',
      'car_deals': 'car',
      'insurance_offers': 'shield-check',
      'general': 'lightbulb',
    };
    return iconMap[category] || 'lightbulb';
  };

  const getPriorityColor = (priority: string): string => {
    // Using financial color scheme for priorities
    const priorityColors = {
      'high': theme.error, // Coral red for high priority
      'medium': theme.warning, // Gold for medium priority
      'low': theme.success, // Green for low priority
    };
    return priorityColors[priority as keyof typeof priorityColors] || theme.textMuted;
  };

  const getCategoryColor = (category: string): string => {
    // Financial category-specific colors from theme
    const categoryColorMap: Record<string, string> = {
      'investment': theme.investment,
      'debt_management': theme.debt,
      'emergency_fund': theme.emergency,
      'insurance': theme.insurance,
      'insurance_offers': theme.insurance,
      'skill_development': theme.education,
      'travel_deals': theme.travel,
      'savings': theme.savings,
      'loan_offers': theme.primary,
      'car_deals': theme.secondary,
      'job_opportunities': theme.info,
      'general': theme.neutral,
    };
    return categoryColorMap[category] || theme.primary;
  };

  const formatCategoryName = (category: string): string => {
    const categoryNames: Record<string, string> = {
      'debt_management': 'Debt Management',
      'job_opportunities': 'Career & Jobs',
      'investment': 'Investment',
      'emergency_fund': 'Emergency Fund',
      'insurance': 'Insurance',
      'skill_development': 'Skill Development',
      'side_income': 'Side Income',
      'loan_offers': 'Loan Offers',
      'travel_deals': 'Travel Deals',
      'car_deals': 'Car Deals',
      'insurance_offers': 'Insurance Offers',
      'general': 'General',
    };
    return categoryNames[category] || category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatOfferDetails = () => {
    const details = [];
    
    if (opportunity.discountPercentage) {
      details.push(`${opportunity.discountPercentage}% OFF`);
    }
    
    if (opportunity.expiresAt) {
      const expiryDate = new Date(opportunity.expiresAt);
      const now = new Date();
      const diffTime = expiryDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        details.push(`${diffDays} days left`);
      }
    }
    
    if (opportunity.provider) {
      details.push(`via ${opportunity.provider}`);
    }
    
    return details.slice(0, 2).join(' • ');
  };

  return (
    <View style={styles.cardContainer}>
      {/* Main Opportunity Card */}
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
        onPress={() => onPress(opportunity)}
        activeOpacity={0.95}
      >
        {/* Header Image */}
        <Image 
          source={{ 
            uri: imageError || !opportunity.imageUrl
              ? 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=240&fit=crop&q=80' 
              : opportunity.imageUrl 
          }} 
          style={styles.headerImage} 
          resizeMode="cover"
          onError={(error) => {
            console.warn(`Failed to load image for opportunity: ${opportunity.title}`, error.nativeEvent.error);
            setImageError(true);
          }}
        />
        
        {/* Provider Badge */}
        {opportunity.provider && (
          <View style={[styles.providerBadge, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.providerText, { color: theme.text }]} numberOfLines={1}>
              {opportunity.provider}
            </Text>
          </View>
        )}

        {/* Priority Badge */}
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(opportunity.priority) }]}>
          <Text style={styles.priorityText}>
            {opportunity.priority.toUpperCase()}
          </Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.categoryRow}>
            <MaterialCommunityIcons 
              name={getCategoryIcon(opportunity.category)} 
              size={16} 
              color={getCategoryColor(opportunity.category)} 
              style={styles.categoryIcon}
            />
            <Text style={[styles.categoryText, { color: getCategoryColor(opportunity.category) }]}>
              {formatCategoryName(opportunity.category)}
            </Text>
          </View>
          
          <Text style={[styles.title, { color: theme.text }]}>
            {opportunity.title}
          </Text>
          
          <Text style={[styles.description, { color: theme.text }]} numberOfLines={3}>
            {opportunity.description}
          </Text>

          {/* Price Information */}
          {(opportunity.originalPrice || opportunity.discountedPrice) && (
            <View style={styles.priceContainer}>
              {opportunity.discountedPrice && opportunity.originalPrice && (
                <View style={styles.priceRow}>
                  <Text style={[styles.originalPrice, { color: theme.textMuted }]}>
                    {formatPrice(opportunity.originalPrice)}
                  </Text>
                  <Text style={[styles.discountedPrice, { color: theme.success }]}>
                    {formatPrice(opportunity.discountedPrice)}
                  </Text>
                  {opportunity.discountPercentage && (
                    <View style={[styles.discountBadge, { backgroundColor: theme.success }]}>
                      <Text style={[styles.discountText, { color: '#FFFFFF' }]}>
                        {opportunity.discountPercentage}% OFF
                      </Text>
                    </View>
                  )}
                </View>
              )}
              {opportunity.originalPrice && !opportunity.discountedPrice && (
                <Text style={[styles.singlePrice, { color: theme.text }]}>
                  {formatPrice(opportunity.originalPrice)}
                </Text>
              )}
            </View>
          )}

          {/* Offer Details */}
          {formatOfferDetails() && (
            <View style={styles.offerDetailsContainer}>
              <MaterialCommunityIcons name="tag" size={14} color={theme.accent} />
              <Text style={[styles.offerDetails, { color: theme.accent }]}>
                {formatOfferDetails()}
              </Text>
            </View>
          )}
          
          {/* Relevance Score */}
          <View style={styles.relevanceContainer}>
            <MaterialCommunityIcons name="target" size={14} color={theme.textMuted} />
            <Text style={[styles.relevanceText, { color: theme.textMuted }]}>
              {Math.round(opportunity.relevanceScore * 100)}% match
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* AI Insights Section - Always visible below each card */}
      <TouchableOpacity
        style={[
          styles.insightsCard,
          {
            backgroundColor: theme.accentMuted,
            borderColor: theme.accent + '33',
          },
        ]}
        onPress={() => onPress(opportunity)}
        activeOpacity={0.7}
      >
        <View style={styles.insightsContent}>
          <MaterialCommunityIcons 
            name="sparkles" 
            size={18} 
            color={theme.accent} 
            style={styles.insightsIcon} 
          />
          <View style={styles.insightsText}>
            <Text style={[styles.insightsTitle, { color: theme.accent }]}>
              AI Insights
            </Text>
            <Text style={[styles.insightsPreview, { color: theme.text }]} numberOfLines={3}>
              {opportunity.aiInsights}
            </Text>
          </View>
          <MaterialCommunityIcons 
            name="chevron-right" 
            size={20} 
            color={theme.accent} 
            style={styles.expandButton}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 20,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    marginBottom: 8,
  },
  headerImage: {
    width: '100%',
    height: 180,
  },
  providerBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    elevation: 2,
    borderWidth: 1,
    maxWidth: 120,
  },
  providerText: {
    fontSize: 10,
    fontWeight: '600',
  },
  priorityBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#ffffff',
  },
  content: {
    padding: 20,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  offerDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  offerDetails: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  relevanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  relevanceText: {
    fontSize: 12,
    marginLeft: 4,
  },
  insightsCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  insightsContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightsIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  insightsText: {
    flex: 1,
  },
  insightsTitle: {
    fontWeight: '700',
    marginBottom: 6,
    fontSize: 15,
  },
  insightsPreview: {
    fontSize: 14,
    lineHeight: 20,
  },
  expandButton: {
    marginLeft: 8,
  },
  priceContainer: {
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  singlePrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  discountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '700',
  },
});

export default memo(OpportunityCard);