# React Native Reusables Component Library

## Overview
A complete UI component library built with **pure React Native StyleSheet** (NO nativewind, NO tailwind classes).
All components use the Perplexity theme system from `src/theme/perplexityTheme.ts`.

## Location
`src/components/reusables/`

## Available Components

### 1. Text Component
**File:** `reusables/text.tsx`

**Props:**
- `variant`: `'heading1' | 'heading2' | 'heading3' | 'body' | 'bodySmall' | 'caption'`
- `weight`: `'400' | '500' | '600' | '700'`
- `color`: `'foreground' | 'text' | 'quiet' | 'quieter' | 'super'`
- All standard React Native `TextProps`

**Usage:**
```tsx
import { Text } from '../../components/reusables';

<Text variant="heading2" color="foreground" weight="700">
  Your Investments
</Text>
```

### 2. Button Component
**File:** `reusables/button.tsx`

**Props:**
- `variant`: `'default' | 'outline' | 'ghost' | 'destructive'`
- `size`: `'sm' | 'md' | 'lg'`
- `icon`: React Node
- `iconPosition`: `'left' | 'right'`
- All standard `TouchableOpacityProps`

**Usage:**
```tsx
import { Button } from '../../components/reusables';

<Button
  variant="outline"
  size="sm"
  onPress={() => console.log('Add investment')}
  icon={<Icon name="add" size={18} color={perplexityColors.super} />}
  iconPosition="left"
>
  <Text>Add Investment</Text>
</Button>
```

### 3. Card Component
**File:** `reusables/card.tsx`

**Props:**
- `variant`: `'default' | 'glass' | 'subtle'`
- `padding`: Any key from `perplexitySpacing` (e.g., `'sm' | 'md' | 'lg'`)
- `style`: Custom ViewStyle

**Usage:**
```tsx
import { Card } from '../../components/reusables';

<Card variant="glass" padding="lg">
  <Text>Card content</Text>
</Card>
```

### 4. Badge Component
**File:** `reusables/badge.tsx`

**Props:**
- `variant`: `'success' | 'danger' | 'warning' | 'neutral' | 'super'`
- `size`: `'sm' | 'md' | 'lg'`
- `style`: Custom ViewStyle
- `textStyle`: Custom TextStyle

**Usage:**
```tsx
import { Badge } from '../../components/reusables';

<Badge variant="success" size="sm">
  ↑ +8.86%
</Badge>
```

### 5. Input Component
**File:** `reusables/input.tsx`

**Props:**
- `icon`: React Node
- `iconPosition`: `'left' | 'right'`
- `containerStyle`: Custom ViewStyle
- All standard `TextInputProps`

**Usage:**
```tsx
import { Input } from '../../components/reusables';

<Input
  placeholder="Enter Symbol"
  value={searchQuery}
  onChangeText={setSearchQuery}
  icon={<Icon name="search" size={20} color={perplexityColors.quiet} />}
  iconPosition="left"
/>
```

## Import Pattern

### Single Component
```tsx
import { Text } from '../../components/reusables';
```

### Multiple Components
```tsx
import { Text, Button, Card, Badge, Input } from '../../components/reusables';
```

## Styling System

### Theme Colors (from perplexityTheme.ts)
- `perplexityColors.foreground` - Primary text (#FFFFFF)
- `perplexityColors.text` - Secondary text (#E8E8E8)
- `perplexityColors.quiet` - Muted text (#B4B4B4)
- `perplexityColors.quieter` - More muted (#8A8A8A)
- `perplexityColors.super` - Primary accent teal (#20D9D2)
- `perplexityColors.success` - Success green (#22C55E)
- `perplexityColors.danger` - Error red (#EF4444)
- `perplexityColors.warning` - Warning orange (#F59E0B)
- `perplexityColors.base` - Main background (#0A0A0A)
- `perplexityColors.subtler` - Card background (#1A1A1A)

### Spacing
```tsx
perplexitySpacing = {
  '2xs': 2,
  'xs': 4,
  'sm': 8,
  'md': 12,
  'lg': 16,
  'xl': 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
}
```

### Border Radius
```tsx
perplexityRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
}
```

## Architecture

- ✅ **Pure StyleSheet**: No nativewind, no tailwind classes
- ✅ **Type-safe**: Full TypeScript support
- ✅ **Theme-integrated**: Uses perplexityTheme colors, spacing, and radius
- ✅ **Composable**: Components work together seamlessly
- ✅ **Accessible**: Standard React Native props supported
- ✅ **Performant**: No runtime style processing

## Files Structure

```
src/components/reusables/
├── text.tsx          # Text component with variants
├── button.tsx        # Button component with variants
├── card.tsx          # Card component with glass/subtle variants
├── badge.tsx         # Badge component for status indicators
├── input.tsx         # Input component with icon support
└── index.ts          # Barrel export for all components
```

## Migration Notes

### Before (with nativewind - REMOVED)
```tsx
import { Text, Button } from '@rnr/ui'; // ❌ NO LONGER USED
```

### After (with reusables)
```tsx
import { Text, Button } from '../../components/reusables'; // ✅ CORRECT
```

## Dependencies Removed
- ❌ `nativewind` - Removed
- ❌ `class-variance-authority` - Removed
- ❌ `clsx` - Removed

## Dependencies Kept
- ✅ `react-native` - Core framework
- ✅ `react-native-vector-icons` - Icons
- ✅ `tailwindcss` - Config only (not used for styling)
