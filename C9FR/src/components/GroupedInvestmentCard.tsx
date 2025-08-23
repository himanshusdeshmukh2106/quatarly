import React, { memo } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import OptimizedInvestmentCard, { InvestmentData } from './InvestmentCard';

interface GroupedInvestmentCardProps {
  investments: [InvestmentData, InvestmentData?]; // Array of 1 or 2 investments
  onPress?: (investment: InvestmentData) => void;
  onLongPress?: (investment: InvestmentData) => void;
}

const GroupedInvestmentCard: React.FC<GroupedInvestmentCardProps> = memo(({
  investments,
  onPress,
  onLongPress,
}) => {
  // If we only have one investment, render it normally
  if (investments.length === 1 || !investments[1]) {
    return (
      <OptimizedInvestmentCard
        investment={investments[0]}
        index={0}
        onPress={onPress}
        onLongPress={onLongPress}
        groupPosition="single"
      />
    );
  }

  // Render two cards grouped together seamlessly
  return (
    <>
      <OptimizedInvestmentCard
        investment={investments[0]}
        index={0}
        onPress={onPress}
        onLongPress={onLongPress}
        groupPosition="top"
      />
      <OptimizedInvestmentCard
        investment={investments[1]}
        index={1}
        onPress={onPress}
        onLongPress={onLongPress}
        groupPosition="bottom"
      />
    </>
  );
});

const styles = StyleSheet.create({
  // Styles moved to InvestmentCard component for better control
});

GroupedInvestmentCard.displayName = 'GroupedInvestmentCard';

export default GroupedInvestmentCard;