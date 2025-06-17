// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig, type Options } from 'tsup';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';

function transformPackage(pkg: Record<string, any>) {
    const pkgFields = ['name', 'version', 'private', 'type', 'dependencies'];
    return Object.entries(pkg)
        .filter(([key]) => pkgFields.includes(key))
        .reduce<Record<string, any>>((acc, [key, value]) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            acc[key] = value;
            return acc;
        }, { scripts: { start: 'node index.js' } });
}

export default defineConfig((options: Options) => ({
    entryPoints: ['src/index.ts'],
    tsconfig: './tsconfig.build.json',
    clean: true,
    format: ['esm'],
    // onsucess function only for build mode, will be overwritten by script in dev mode
    onSuccess: async () => {
        const srcPath = join(import.meta.dirname, './package.json'),
            destPath = join(import.meta.dirname, './dist/package.json'),
            pkg = JSON.parse(await fs.readFile(srcPath, 'utf8')) as Record<string, any>;
        await fs.writeFile(destPath, JSON.stringify(transformPackage(pkg), null, 2));
    },
    ...options,
}));