module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    "eslint:recommended",
    "@vue/typescript/recommended",
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "@typescript-eslint/no-var-requires": 0,
    "prefer-const": 0,
    "vue/multi-word-component-names": 0,
    "no-undef": 0,
    "@typescript-eslint/ban-types": 0,
    "@typescript-eslint/no-inferrable-types": 0,
    "@typescript-eslint/no-empty-function": 0,
    "no-constant-condition": 0,
    "no-case-declarations": 0,
    "@typescript-eslint/no-extra-non-null-assertion": 0,
  },
};
