import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';

interface CategoryCardsProps {
  categories: { name: string, icon: string }[];
  onAnswer: (answer: { selected: string[]; custom: string }) => void;
}

const CategoryCards: React.FC<CategoryCardsProps> = ({ categories, onAnswer }) => {
  const { theme } = useContext(ThemeContext);
  const [selected, setSelected] = useState<string[]>([]);
  const [customText, setCustomText] = useState('');

  useEffect(() => {
    onAnswer({ selected, custom: customText });
  }, [selected, customText, onAnswer]);

  const toggleSelection = (categoryName: string) => {
    setSelected(prev =>
      prev.includes(categoryName)
        ? prev.filter(item => item !== categoryName)
        : [...prev, categoryName]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.cardContainer}>
        {categories.map(category => {
          const isSelected = selected.includes(category.name);
          return (
            <TouchableOpacity
              key={category.name}
              style={[
                styles.card,
                { backgroundColor: isSelected ? theme.primary : theme.card,
                  borderColor: theme.border
                },
              ]}
              onPress={() => toggleSelection(category.name)}
            >
              <Text style={styles.icon}>{category.icon}</Text>
              <Text style={{ color: isSelected ? '#FFF' : theme.text }}>{category.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <TextInput
        style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]}
        placeholder="Add specific teams, leagues, etc."
        placeholderTextColor={theme.text}
        value={customText}
        onChangeText={setCustomText}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
      width: '100%',
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  card: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 8,
    margin: 5,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 100,
  },
  icon: {
      fontSize: 24,
      marginBottom: 10,
  },
  input: {
      height: 50,
      borderRadius: 8,
      paddingHorizontal: 15,
      borderWidth: 1,
      fontSize: 16,
      marginHorizontal: 20,
  }
});

export default CategoryCards; 