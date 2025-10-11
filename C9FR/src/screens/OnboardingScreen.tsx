import React, { useState, useContext, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, Button, Alert, ActivityIndicator,
  Pressable, TextInput, ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { questionnaireQuestions } from '../data/questionnaireQuestions';
import { submitQuestionnaire } from '../services/api';
import { startExpenseTracking } from '../services/expenseTracking';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { Answer, QuestionnaireQuestion } from '../types';

type CustomExpense = {
  id: number;
  name: string;
  amount: string;
};

const OnboardingScreen = () => {
  const { theme } = useContext(ThemeContext);
  const { completeOnboarding, authToken } = useContext(AuthContext);

  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const hasStartedTrackingRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [otherSpendingText, setOtherSpendingText] = useState('');

  // State for question 8 (Expenses)
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [expenseAmounts, setExpenseAmounts] = useState<Record<string, string>>({});
  const [customExpenses, setCustomExpenses] = useState<CustomExpense[]>([]);
  const [_smsListening, _setSmsListening] = useState(false);

  const groupedQuestions = useMemo(() => {
    return questionnaireQuestions.reduce((acc, q) => {
      if (!acc[q.group]) {
        acc[q.group] = [];
      }
      acc[q.group].push(q);
      return acc;
    }, {} as Record<string, QuestionnaireQuestion[]>);
  }, []);

  const groupKeys = useMemo(() => Object.keys(groupedQuestions), [groupedQuestions]);
  const currentGroupKey = groupKeys[currentGroupIndex];
  const currentQuestions = groupedQuestions[currentGroupKey];

  const handleAnswerChange = (questionId: number, value: string | string[], type: string) => {
    // Special handling for the custom expenses question
    if (questionId === 8) {
      const choice = value as string;
      const newSelected = selectedExpenses.includes(choice)
        ? selectedExpenses.filter(c => c !== choice)
        : [...selectedExpenses, choice];
      
      // If unselecting, clear the amount
      if (selectedExpenses.includes(choice)) {
        const newAmounts = { ...expenseAmounts };
        delete newAmounts[choice];
        setExpenseAmounts(newAmounts);
      }
      setSelectedExpenses(newSelected);
      return;
    }

    const newAnswer: Answer = answers[questionId] || {
      question_id: questionId,
      selected_choices: [],
      custom_input: null,
    };

    if (type === 'TX' || type === 'NU') {
      newAnswer.custom_input = value as string;
    } else if (type === 'SC') {
      newAnswer.selected_choices = [value as string];
    } else if (type === 'MC') {
      const existingChoices = newAnswer.selected_choices || [];
      const choice = value as string;
      if (existingChoices.includes(choice)) {
        newAnswer.selected_choices = existingChoices.filter(c => c !== choice);
        if (questionId === 8) {
          if (choice === 'Other') setOtherSpendingText('');
          if (choice === 'Rent/EMI') newAnswer.custom_input = null;
        }
      } else {
        newAnswer.selected_choices = [...existingChoices, choice];
      }
    }
    setAnswers(prev => ({ ...prev, [questionId]: newAnswer }));
  };

  const handleCustomInputChange = (questionId: number, text: string) => {
    const existingAnswer = answers[questionId] || { question_id: questionId, selected_choices: [], custom_input: null };
    const newAnswer = { ...existingAnswer, custom_input: text };
    setAnswers(prev => ({ ...prev, [questionId]: newAnswer }));
  };

  const handleNext = async () => {
    // If user is moving away from the Expenses group, request automatic tracking
    if (currentGroupKey === 'Expenses' && !hasStartedTrackingRef.current) {
      const enabled = await startExpenseTracking();
      hasStartedTrackingRef.current = enabled;
    }

    if (currentGroupIndex < groupKeys.length - 1) {
      setCurrentGroupIndex(currentGroupIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentGroupIndex > 0) {
      setCurrentGroupIndex(currentGroupIndex - 1);
    }
  };
  
  const validateRequiredFields = (): { isValid: boolean; missingFields: string[] } => {
    const missingFields: string[] = [];

    // Check critical questions that should be answered
    const criticalQuestions = [1, 2, 6]; // Name, Age, Monthly Income

    criticalQuestions.forEach(qId => {
      const answer = answers[qId];
      if (!answer || (!answer.custom_input && answer.selected_choices.length === 0)) {
        const question = questionnaireQuestions.find(q => q.id === qId);
        if (question) {
          missingFields.push(question.text);
        }
      }
    });

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!authToken) {
        Alert.alert("Authentication Error", "You are not logged in.");
        setLoading(false);
        return;
      }

      // Validate required fields
      const validation = validateRequiredFields();
      if (!validation.isValid) {
        Alert.alert(
          "Missing Information",
          `Please answer the following questions:\n\n${validation.missingFields.map(f => `• ${f}`).join('\n')}`,
          [{ text: "OK" }]
        );
        setLoading(false);
        return;
      }

      const finalAnswers: Record<number, Answer> = JSON.parse(JSON.stringify(answers));

      // Consolidate expenses for question 8
      const allExpenses: Record<string, string> = {};
      Object.entries(expenseAmounts).forEach(([key, value]) => {
        if (value.trim()) {
          allExpenses[key] = value.trim();
        }
      });
      customExpenses.forEach(exp => {
        if (exp.name.trim() && exp.amount.trim()) {
          allExpenses[exp.name.trim()] = exp.amount.trim();
        }
      });

      // Only add expense data if there are expenses
      if (Object.keys(allExpenses).length > 0) {
        finalAnswers[8] = {
          question_id: 8,
          selected_choices: [],
          custom_input: JSON.stringify(allExpenses),
        };
      }

      // Filter out empty responses
      const payload = {
        responses: Object.values(finalAnswers).filter(a => {
          const hasCustomInput = a.custom_input && a.custom_input.trim() !== '';
          const hasChoices = a.selected_choices && a.selected_choices.length > 0;
          return hasCustomInput || hasChoices;
        }),
      };

      console.log('Submitting questionnaire with', payload.responses.length, 'responses');

      // Ensure expense tracking is started if it wasn't triggered earlier
      if (!hasStartedTrackingRef.current) {
        await startExpenseTracking();
      }

      await submitQuestionnaire(payload, authToken);
      await completeOnboarding();

      // Show success message
      Alert.alert(
        "Success!",
        "Your profile has been created. Welcome to Quatarly!",
        [{ text: "Let's Go!", onPress: () => {} }]
      );

      // The RootNavigator will handle the redirection automatically
    } catch (error: any) {
      console.error('Onboarding submission error:', error);
      const errorMessage = error.response?.data?.detail ||
                          error.response?.data?.error ||
                          "Could not submit your answers. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomExpense = () => {
    setCustomExpenses(prev => [...prev, { id: Date.now(), name: '', amount: '' }]);
  };

  const handleCustomExpenseChange = (id: number, field: 'name' | 'amount', value: string) => {
    setCustomExpenses(prev => prev.map(exp => exp.id === id ? { ...exp, [field]: value } : exp));
  };

  const handleRemoveCustomExpense = (id: number) => {
    setCustomExpenses(prev => prev.filter(exp => exp.id !== id));
  };

  const renderQuestion = (question: QuestionnaireQuestion) => {
    const { id, text, type, choices, prompt } = question;
    const answer = answers[id];

    if (id === 8) {
      return (
        <View key={id} style={styles.questionContainer}>
          <Text style={[styles.questionText, { color: theme.text }]}>{text}</Text>
          {choices?.map(choice => {
            const isSelected = selectedExpenses.includes(choice);
            return (
              <View key={choice}>
                <Pressable
                  onPress={() => handleAnswerChange(id, choice, 'MC')}
                  style={({ pressed }) => [
                    styles.option,
                    { backgroundColor: isSelected ? theme.primary : theme.card },
                    pressed && styles.optionPressed
                  ]}
                >
                  <Text style={{ color: isSelected ? 'white' : theme.text }}>{choice}</Text>
                </Pressable>
                {isSelected && (
                  <TextInput
                    style={[styles.input, { marginTop: -5, marginBottom: 10 }]}
                    placeholder={`${prompt} for ${choice}`}
                    placeholderTextColor={theme.textMuted}
                    keyboardType="numeric"
                    value={expenseAmounts[choice] || ''}
                    onChangeText={value => setExpenseAmounts(prev => ({...prev, [choice]: value}))}
                  />
                )}
              </View>
            )
          })}
          
          {customExpenses.map((exp) => (
            <View key={exp.id} style={styles.customExpenseRow}>
              <TextInput
                style={[styles.input, styles.customExpenseInput, { flex: 2 }]}
                placeholder="Expense Name (e.g., Netflix)"
                value={exp.name}
                onChangeText={value => handleCustomExpenseChange(exp.id, 'name', value)}
              />
              <TextInput
                style={[styles.input, styles.customExpenseInput, { flex: 1 }]}
                placeholder="Amount"
                keyboardType="numeric"
                value={exp.amount}
                onChangeText={value => handleCustomExpenseChange(exp.id, 'amount', value)}
              />
              <Pressable onPress={() => handleRemoveCustomExpense(exp.id)}>
                <Icon name="close-circle" size={24} color={theme.textMuted} />
              </Pressable>
            </View>
          ))}
          
          <Button title="Add Expense" onPress={handleAddCustomExpense} color={theme.primary} />
        </View>
      );
    }

    switch (type) {
      case 'TX':
      case 'NU':
        return (
          <View key={id} style={styles.questionContainer}>
            <Text style={[styles.questionText, { color: theme.text }]}>{text}</Text>
            {prompt && <Text style={[styles.prompt, { color: theme.textMuted }]}>{prompt}</Text>}
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.text, backgroundColor: theme.background }]}
              onChangeText={(val) => handleAnswerChange(id, val, type)}
              value={answer?.custom_input || ''}
              keyboardType={type === 'NU' ? 'numeric' : 'default'}
            />
          </View>
        );
      case 'SC':
      case 'MC':
        return (
          <View key={id} style={styles.questionContainer}>
            <Text style={[styles.questionText, { color: theme.text }]}>{text}</Text>
            {choices?.map((choice: string) => {
              const isSelected = answer?.selected_choices?.includes(choice);
              return (
                <Pressable
                  key={choice}
                  style={({ pressed }) => [
                    styles.option,
                    { backgroundColor: isSelected ? theme.primary : theme.card },
                    pressed && styles.optionPressed,
                  ]}
                  onPress={() => handleAnswerChange(id, choice, type)}>
                  <Text style={{ color: isSelected ? 'white' : theme.text }}>{choice}</Text>
                </Pressable>
              );
            })}
            
            { id === 8 && answer?.selected_choices?.includes('Rent/EMI') && (
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.text, backgroundColor: theme.background, marginTop: 10 }]}
                placeholder={prompt}
                placeholderTextColor={theme.textMuted}
                onChangeText={(val) => handleCustomInputChange(id, val)}
                value={answer?.custom_input || ''}
                keyboardType="numeric"
              />
            )}
            
            { id === 8 && answer?.selected_choices?.includes('Other') && (
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.text, backgroundColor: theme.background, marginTop: 10 }]}
                placeholder="Please specify other expense"
                placeholderTextColor={theme.textMuted}
                onChangeText={setOtherSpendingText}
                value={otherSpendingText}
              />
            )}
          </View>
        );
      default:
        return null;
    }
  };
  
  const progress = (currentGroupIndex + 1) / groupKeys.length;

  return (
    <View style={{flex: 1, backgroundColor: theme.background}}>
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={{ paddingBottom: 150 }} // Ensure space for buttons
      >
        <View style={styles.header}>
            <View style={styles.headerBar}>
                <Pressable onPress={handleBack} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={currentGroupIndex > 0 ? theme.text : 'transparent'} />
                </Pressable>
                <View style={styles.progressBarWrapper}>
                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: `${progress * 100}%`, backgroundColor: theme.primary }]} />
                    </View>
                </View>
            </View>
        </View>

        <View key={currentGroupKey} style={styles.groupContainer}>
          <Text style={[styles.groupTitle, { color: theme.primary }]}>{currentGroupKey}</Text>
          {currentQuestions.map(renderQuestion)}
        </View>
      </ScrollView>

      <View style={[styles.navigationContainer, {backgroundColor: theme.background}]}>
        <View style={styles.buttonWrapper}>
          {loading ? (
            <ActivityIndicator size="large" color={theme.primary} />
          ) : (
            currentGroupIndex < groupKeys.length - 1 ? (
              <Button title="Next" onPress={handleNext} color={theme.primary} />
            ) : (
              <Button title="Submit" onPress={handleSubmit} color={theme.primary} />
            )
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    paddingRight: 15,
  },
  progressBarWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  progressBarContainer: {
    width: '70%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  groupContainer: {
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 5,
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 18,
    marginBottom: 10,
  },
  prompt: {
    fontSize: 14,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  option: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  optionPressed: {
    opacity: 0.7,
  },
  navigationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  buttonWrapper: {
    width: '40%',
    marginHorizontal: 5,
  },
  customExpenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  customExpenseInput: {
    marginRight: 10,
  },
});

export default OnboardingScreen; 