import createConfig from '@repo/eslint-config/node';

export default createConfig(import.meta.dirname, ['./tsconfig.eslint.json', './tsconfig.json']);