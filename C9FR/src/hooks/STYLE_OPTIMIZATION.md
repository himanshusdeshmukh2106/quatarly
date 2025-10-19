# Style Optimization Guide

## Problem: Inline Styles

Inline styles create new objects on every render, causing unnecessary re-renders and performance issues.

### ❌ Bad (Inline Styles)

```typescript
const MyComponent = () => {
  const { theme } = useContext(ThemeContext);
  
  return (
    <View style={{ backgroundColor: theme.background, padding: 16 }}>
      <Text style={{ color: theme.text, fontSize: 16 }}>Hello</Text>
    </View>
  );
};
```

**Problems:**
- New style objects created on every render
- React Native can't optimize style comparisons
- Causes unnecessary re-renders of child components
- Poor performance with many components

## Solution: useStyles Hook

The `useStyles` hook memoizes styles based on theme, creating them only when the theme changes.

### ✅ Good (Memoized Styles)

```typescript
import { useStyles } from '@/hooks';

const MyComponent = () => {
  const styles = useComponentStyles();
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello</Text>
    </View>
  );
};

const useComponentStyles = () => {
  return useStyles((theme) => ({
    container: {
      backgroundColor: theme.background,
      padding: 16,
    },
    text: {
      color: theme.text,
      fontSize: 16,
    },
  }));
};
```

**Benefits:**
- Styles created once and memoized
- Only recreated when theme changes
- Better performance
- Cleaner code

## Usage Patterns

### Pattern 1: Theme-Dependent Styles

Use `useStyles` when your styles depend on the theme:

```typescript
import { useStyles } from '@/hooks';

const useCardStyles = () => {
  return useStyles((theme) => ({
    card: {
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
    },
    title: {
      color: theme.text,
      fontSize: 18,
      fontWeight: '600',
    },
    subtitle: {
      color: theme.textSecondary,
      fontSize: 14,
    },
  }));
};

const Card = ({ title, subtitle }) => {
  const styles = useCardStyles();
  
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};
```

### Pattern 2: Static Styles

Use `useStaticStyles` for styles that don't depend on theme:

```typescript
import { useStaticStyles } from '@/hooks';

const useLayoutStyles = () => {
  return useStaticStyles(() => ({
    container: {
      flex: 1,
      padding: 16,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    spacer: {
      height: 16,
    },
  }));
};
```

### Pattern 3: Combining Styles

Combine memoized styles with conditional styles:

```typescript
const MyComponent = ({ isActive }) => {
  const styles = useComponentStyles();
  
  return (
    <View style={[
      styles.container,
      isActive && styles.activeContainer
    ]}>
      <Text style={styles.text}>Content</Text>
    </View>
  );
};

const useComponentStyles = () => {
  return useStyles((theme) => ({
    container: {
      backgroundColor: theme.background,
      padding: 16,
    },
    activeContainer: {
      borderColor: theme.primary,
      borderWidth: 2,
    },
    text: {
      color: theme.text,
    },
  }));
};
```

### Pattern 4: Design System Integration

Use with design system tokens:

```typescript
import { useStyles } from '@/hooks';
import { Colors, Spacing, Typography, BorderRadius } from '@/styles/designSystem';

const useButtonStyles = () => {
  return useStyles((theme) => ({
    button: {
      backgroundColor: theme.isDark ? Colors.primary[600] : Colors.primary[500],
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderRadius: BorderRadius.lg,
    },
    buttonText: {
      color: Colors.neutral[50],
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.semibold,
    },
  }));
};
```

## Performance Comparison

### Before (Inline Styles)

```typescript
// ❌ Creates new objects on EVERY render
<View style={{ padding: 16, backgroundColor: theme.background }}>
  <Text style={{ color: theme.text }}>Hello</Text>
</View>
```

**Performance:**
- 1000 renders = 1000 new style objects created
- React Native can't optimize
- Causes child re-renders

### After (Memoized Styles)

```typescript
// ✅ Creates objects ONCE, reuses on subsequent renders
const styles = useStyles((theme) => ({
  container: { padding: 16, backgroundColor: theme.background },
  text: { color: theme.text },
}));

<View style={styles.container}>
  <Text style={styles.text}>Hello</Text>
</View>
```

**Performance:**
- 1000 renders = 1 style object (memoized)
- React Native can optimize
- Prevents unnecessary child re-renders

## Migration Guide

### Step 1: Identify Inline Styles

Look for patterns like:
- `style={{ ... }}`
- `style={[..., { ... }]}`
- Styles created inside render

### Step 2: Extract to Style Factory

```typescript
// Before
const MyComponent = () => {
  const { theme } = useContext(ThemeContext);
  return <View style={{ backgroundColor: theme.background }} />;
};

// After
const useComponentStyles = () => {
  return useStyles((theme) => ({
    container: {
      backgroundColor: theme.background,
    },
  }));
};

const MyComponent = () => {
  const styles = useComponentStyles();
  return <View style={styles.container} />;
};
```

### Step 3: Test Performance

Use React DevTools Profiler to verify:
- Reduced render times
- Fewer re-renders
- Better frame rates

## Best Practices

### ✅ Do

1. **Use useStyles for theme-dependent styles**
   ```typescript
   const styles = useStyles((theme) => ({ ... }));
   ```

2. **Use useStaticStyles for static styles**
   ```typescript
   const styles = useStaticStyles(() => ({ ... }));
   ```

3. **Extract style hooks outside component**
   ```typescript
   const useComponentStyles = () => useStyles(...);
   const MyComponent = () => {
     const styles = useComponentStyles();
   };
   ```

4. **Combine with StyleSheet arrays**
   ```typescript
   <View style={[styles.base, isActive && styles.active]} />
   ```

### ❌ Don't

1. **Don't create styles inside render**
   ```typescript
   // ❌ Bad
   const MyComponent = () => {
     const styles = useStyles(...); // Creates new hook on every render
   };
   ```

2. **Don't use inline styles**
   ```typescript
   // ❌ Bad
   <View style={{ padding: 16 }} />
   ```

3. **Don't create style objects in render**
   ```typescript
   // ❌ Bad
   const dynamicStyle = { color: isActive ? 'red' : 'blue' };
   <Text style={dynamicStyle} />
   ```

4. **Don't mix inline and memoized styles**
   ```typescript
   // ❌ Bad
   <View style={[styles.container, { marginTop: 10 }]} />
   
   // ✅ Good
   <View style={[styles.container, styles.marginTop]} />
   ```

## Common Patterns

### Loading States

```typescript
const useLoadingStyles = () => {
  return useStyles((theme) => ({
    container: {
      opacity: 1,
    },
    loading: {
      opacity: 0.6,
    },
  }));
};

const MyComponent = ({ isLoading }) => {
  const styles = useLoadingStyles();
  return (
    <View style={[styles.container, isLoading && styles.loading]}>
      {/* content */}
    </View>
  );
};
```

### Responsive Styles

```typescript
import { Dimensions } from 'react-native';

const useResponsiveStyles = () => {
  const { width } = Dimensions.get('window');
  const isSmall = width < 375;
  
  return useStyles((theme) => ({
    container: {
      padding: isSmall ? 12 : 16,
    },
    text: {
      fontSize: isSmall ? 14 : 16,
    },
  }));
};
```

### Platform-Specific Styles

```typescript
import { Platform } from 'react-native';

const usePlatformStyles = () => {
  return useStyles((theme) => ({
    container: {
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 4,
        },
      }),
    },
  }));
};
```

## Troubleshooting

### Issue: Styles not updating when theme changes

**Solution:** Make sure you're using `useStyles` with theme parameter:

```typescript
// ❌ Wrong
const styles = useStaticStyles(() => ({
  container: { backgroundColor: theme.background }, // theme not in scope
}));

// ✅ Correct
const styles = useStyles((theme) => ({
  container: { backgroundColor: theme.background },
}));
```

### Issue: Performance still slow

**Solution:** Check if you're creating new style objects elsewhere:

```typescript
// ❌ Still creating new objects
<View style={[styles.container, { marginTop: spacing }]} />

// ✅ Use memoized styles
const styles = useStyles((theme) => ({
  container: { ... },
  containerWithMargin: { marginTop: spacing },
}));
```

## Summary

- ✅ Use `useStyles` for theme-dependent styles
- ✅ Use `useStaticStyles` for static styles
- ✅ Extract style hooks outside components
- ✅ Avoid inline styles
- ✅ Combine with StyleSheet arrays for conditional styles
- ✅ Test performance improvements with React DevTools
