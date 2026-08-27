const { defineConfig } = require('eslint/config')

module.exports = defineConfig([
  ...require('@infinitetoken/eslint-config/vue'),
  {
    files: ['src/pages/**/*.vue'],
    rules: { 'vue/multi-word-component-names': 'off' }
  }
])
