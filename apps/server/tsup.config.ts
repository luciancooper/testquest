// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig, type Options } from 'tsup';

export default defineConfig((options: Options) => ({
    entryPoints: ['src/index.ts'],
    tsconfig: './tsconfig.build.json',
    clean: true,
    format: ['esm'],
    ...options,
}));