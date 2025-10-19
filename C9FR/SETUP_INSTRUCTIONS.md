# Development Setup Instructions

## Prerequisites
- Node.js >= 18
- npm or yarn

> **Note**: See [LIBRARY_COMPATIBILITY.md](./LIBRARY_COMPATIBILITY.md) for detailed information about library versions and React 19 compatibility.

## Initial Setup

### 1. Install Dependencies
```bash
cd C9FR

# Clean install (recommended for updated dependencies)
rm -rf node_modules package-lock.json
npm install

# Or if you encounter peer dependency issues:
npm install --legacy-peer-deps
```

### 2. Setup Git Hooks (Husky 9.x)
```bash
# Initialize husky (Husky 9.x uses init instead of install)
npx husky init

# This creates .husky/ directory and adds prepare script to package.json
# Now create the pre-commit hook manually:
echo "npx lint-staged" > .husky/pre-commit

# On Windows PowerShell, use:
# Set-Content .husky/pre-commit "npx lint-staged"
```

### 3. Verify Setup
```bash
# Run linter
npm run lint

# Run formatter check
npm run format:check

# Run tests
npm run test
```

## Available Scripts

- `npm run lint` - Run ESLint to check for code issues
- `npm run lint:fix` - Run ESLint and automatically fix issues
- `npm run format` - Format all code with Prettier
- `npm run format:check` - Check if code is formatted correctly
- `npm run test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run analyze` - Analyze bundle size

## Code Standards

### File Size Limits
- Components: Max 300 lines
- Hooks: Max 200 lines
- Utilities: Max 150 lines
- Screens: Max 250 lines (use composition)

### Pre-commit Checks
When you commit code, the following will run automatically:
1. ESLint will check and fix code issues
2. Prettier will format your code
3. If there are errors, the commit will be blocked

### ESLint Rules
- React Hooks rules enforced
- TypeScript recommended rules
- Max 300 lines per file (warning)
- Max 50 lines per function (warning)
- No console.log (warning, console.warn and console.error allowed)
- Inline styles discouraged (warning)

## Troubleshooting

### Husky not working
If pre-commit hooks aren't running:
```bash
# Remove old husky setup
rm -rf .husky

# Reinitialize with Husky 9.x
npx husky init

# Create pre-commit hook
echo "npx lint-staged" > .husky/pre-commit

# On Windows PowerShell:
# Set-Content .husky/pre-commit "npx lint-staged"
```

### ESLint errors
If you see ESLint errors:
```bash
npm run lint:fix
```

### Prettier conflicts
If Prettier and ESLint conflict:
```bash
npm run format
npm run lint:fix
```
