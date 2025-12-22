// .eslintrc.js
module.exports = {
  root: true, // 表示当前配置为项目根配置，不再向上查找
  env: {
    node: true, // 识别node环境的变量（如module、require）
    browser: true // 识别浏览器环境的变量（如window、document）
  },
  extends: [
    'plugin:vue/vue3-essential', // Vue 3的基础ESLint规则（与你的eslint-plugin-vue版本兼容）
    'eslint:recommended' // ESLint的推荐规则
  ],
  parserOptions: {
    ecmaVersion: 2020 // 支持ES2020语法特性
  },
  rules: {
    // 关闭行尾空格检查（解决之前的no-trailing-spaces报错）
    'no-trailing-spaces': 'off',
    // 配置Vue组件名规则：允许Navbar/NavBar作为例外（解决vue/multi-word-component-names报错）
    'vue/multi-word-component-names': ['error', { 
      ignores: ['Navbar', 'NavBar'] 
    }]
  },
  globals: {
    // 声明Vue 3的编译器宏为全局只读变量（解决defineProps/defineEmits的no-undef报错）
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly'
  }
};