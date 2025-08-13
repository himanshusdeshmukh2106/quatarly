import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Switch } from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';

interface TogglesWithTextInputProps {
  toggles: string[];
  onAnswer: (answer: { selected: string[]; custom: string }) => void;
  textPlaceholder: string;
}

const TogglesWithTextInput: React.FC<TogglesWithTextInputProps> = ({ toggles, onAnswer, textPlaceholder }) => {
  const { theme } = useContext(ThemeContext);
  const [selected, setSelected] = useState<string[]>([]);
  const [customText, setCustomText] = useState('');

  useEffect(() => {
    onAnswer({ selected, custom: customText });
  }, [selected, customText, onAnswer]);

  const handleToggle = (item: string) => {
    setSelected(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  return (
    <View style={styles.container}>
      {toggles.map(item => (
        <View key={item} style={[styles.item, { borderBottomColor: theme.border }]}>
          <Text style={{ color: theme.text, fontSize: 16 }}>{item}</Text>
          <Switch
            value={selected.includes(item)}
            onValueChange={() => handleToggle(item)}
            thumbColor={theme.primary}
            trackColor={{ false: theme.border, true: theme.primary }}
          />
        </View>
      ))}
       <TextInput
        style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]}
        placeholder={textPlaceholder}
        placeholderTextColor={theme.text}
        value={customText}
        onChangeText={setCustomText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  input: {
      height: 50,
      borderRadius: 8,
      paddingHorizontal: 15,
      borderWidth: 1,
      fontSize: 16,
      marginTop: 20,
  }
});

export default TogglesWithTextInput; 