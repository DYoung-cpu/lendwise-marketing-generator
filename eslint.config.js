export default [
  {
    files: ['*.js', '**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // Node.js globals
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        // Modern Node.js 18+ / Browser APIs
        fetch: 'readonly',
        // Browser globals (for Playwright/Puppeteer scripts)
        window: 'readonly',
        document: 'readonly',
        // Additional common globals
        FormData: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
      }
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      'no-console': 'off',
      'semi': ['error', 'always'],
      'quotes': ['warn', 'single', { 'avoidEscape': true }],
    }
  }
];
