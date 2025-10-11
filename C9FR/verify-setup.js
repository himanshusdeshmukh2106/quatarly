#!/usr/bin/env node

/**
 * Verification script for development setup
 * Run with: node verify-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Development Setup...\n');

const checks = [
  {
    name: 'ESLint Config',
    path: '.eslintrc.js',
    required: true,
  },
  {
    name: 'Prettier Config',
    path: '.prettierrc.js',
    required: true,
  },
  {
    name: 'EditorConfig',
    path: '.editorconfig',
    required: true,
  },
  {
    name: 'Husky Directory',
    path: '.husky',
    required: true,
    isDirectory: true,
  },
  {
    name: 'Pre-commit Hook',
    path: '.husky/pre-commit',
    required: true,
  },
  {
    name: 'Package.json',
    path: 'package.json',
    required: true,
    validate: (content) => {
      const pkg = JSON.parse(content);
      const checks = {
        'prepare script': pkg.scripts?.prepare?.includes('husky'),
        'lint-staged config': !!pkg['lint-staged'],
        'TypeScript ESLint': !!pkg.devDependencies?.['@typescript-eslint/eslint-plugin'],
        'React Hooks ESLint': !!pkg.devDependencies?.['eslint-plugin-react-hooks'],
        'Husky 9.x': pkg.devDependencies?.husky?.startsWith('^9'),
      };
      return checks;
    },
  },
];

let allPassed = true;

checks.forEach((check) => {
  const fullPath = path.join(__dirname, check.path);
  const exists = fs.existsSync(fullPath);

  if (!exists) {
    console.log(`❌ ${check.name}: NOT FOUND`);
    if (check.required) allPassed = false;
    return;
  }

  if (check.isDirectory) {
    console.log(`✅ ${check.name}: Found`);
    return;
  }

  if (check.validate) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const results = check.validate(content);
    console.log(`✅ ${check.name}: Found`);
    Object.entries(results).forEach(([key, value]) => {
      console.log(`   ${value ? '✅' : '❌'} ${key}`);
      if (!value && check.required) allPassed = false;
    });
    return;
  }

  console.log(`✅ ${check.name}: Found`);
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('✅ All checks passed! Setup is complete.');
  console.log('\n📝 Next steps:');
  console.log('   1. Run: npm run lint');
  console.log('   2. Run: npm run format:check');
  console.log('   3. Try making a git commit to test pre-commit hooks');
} else {
  console.log('❌ Some checks failed. Please review the setup.');
  process.exit(1);
}
