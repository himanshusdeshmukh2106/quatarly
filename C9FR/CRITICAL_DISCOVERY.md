# 🚨 CRITICAL DISCOVERY - Why Fonts Aren't Working

## The Real Issue (From Research)

When you use a font file that already includes the weight (like `spacegrotesk_bold.ttf`), you **MUST NOT** specify `fontWeight: '700'` in your styles!

### ❌ WRONG (This cancels out the Bold font):
```typescript
{
  fontFamily: 'spacegrotesk_bold',
  fontWeight: '700',  // ❌ This conflicts!
}
```

### ✅ CORRECT:
```typescript
{
  fontFamily: 'spacegrotesk_bold',
  // NO fontWeight property!
}
```

## Why This Happens

From the research:
- When you use `spacegrotesk_bold.ttf`, the Bold weight is **already built into the font file**
- Adding `fontWeight: '700'` tells Android to look for a "Bold" version of the "Bold" font
- Android can't find it, so it falls back to system font
- iOS is more forgiving and ignores the conflict

## The Fix

1. Use lowercase with underscores: `spacegrotesk_bold` ✅
2. **DO NOT** add fontWeight when using the bold font file ✅
3. OR use just the base font name and let fontWeight select the variant

## Sources

- Stack Overflow: "Font Weight of '700' or 'bold' not working in Android for Custom fonts"
- Medium: "Adding Custom Fonts (A Complete Guide)"
- Multiple confirmed cases

## Next Steps

Either:
1. Remove `fontWeight: '700'` from all heading styles
2. OR download the Regular weight of Space Grotesk and use fontWeight to switch between them

I'll update the styles now to remove conflicting fontWeight properties.
