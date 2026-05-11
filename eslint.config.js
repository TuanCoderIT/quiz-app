// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  // THÊM ĐOẠN NÀY ĐỂ TẮT HOÀN TOÀN LUẬT BÁO ĐỎ OAN UỔNG:
  {
    rules: {
      'import/no-unresolved': 'off',
    },
  },
]);