export default {
  "*.{ts,tsx}": ["eslint --fix", "vitest run --changed"],
  "*.{json,css,md}": ["prettier --write"],
};
