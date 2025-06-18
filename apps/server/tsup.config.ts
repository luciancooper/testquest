/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig, type Options } from 'tsup';
import kill from 'tree-kill';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';

function transformPackage(pkg: Record<string, any>) {
    const pkgFields = ['name', 'version', 'private', 'type', 'dependencies'];
    return Object.entries(pkg)
        .filter(([key]) => pkgFields.includes(key))
        .reduce<Record<string, any>>((acc, [key, value]) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            acc[key] = value;
            return acc;
        }, {
            scripts: {
                start: 'node index.js',
                postinstall: 'node setup.js',
            },
        });
}

const onSuccessBuild = async () => {
    const srcPath = join(import.meta.dirname, './package.json'),
        destPath = join(import.meta.dirname, './dist/package.json'),
        pkg = JSON.parse(await fs.readFile(srcPath, 'utf8')) as Record<string, any>;
    await fs.writeFile(destPath, JSON.stringify(transformPackage(pkg), null, 2));
};

const SETUP_LOCK_FILE = join(import.meta.dirname, './dist/.setup.lock'),
    SETUP_FILE = join(import.meta.dirname, './dist/setup.js');

const onSuccessDev = async () => {
    // get setup file hash
    let setupHash: string;
    try {
        const content = await fs.readFile(SETUP_FILE);
        setupHash = createHash('sha256').update(content).digest('hex');
    } catch {
        console.error('❌ Failed to hash setup.js file');
        return;
    }
    // get lock file hash
    const lockHash = await (fs.readFile(SETUP_LOCK_FILE, 'utf8').catch(() => null));
    console.log('✨ setup-hash: %O lock-hash: %O', setupHash, lockHash);
    // run setup if hashes don't match
    if (setupHash !== lockHash) {
        console.log('✨ Running setup...');
        const code = await new Promise<number | null>((resolve) => {
            const child = spawn('dotenvx', ['run', '--', 'node', 'dist/setup.js'], { stdio: 'inherit', shell: true });
            child.on('exit', resolve);
        });
        if (code !== 0) {
            console.error(`❌ Setup failed with exit code ${code}`);
            return;
        }
        console.log('✨ Setup Complete');
        // update lockfile to mark setup complete
        await fs.writeFile(SETUP_LOCK_FILE, setupHash);
    }
    const child = spawn('dotenvx', ['run', '--', 'node', 'dist/index.js'], { stdio: 'inherit', shell: true });
    return () => new Promise<void>((resolve) => {
        console.log('🚨 Killing Server (pid: %O)', child.pid);
        child.on('exit', (code, signal) => {
            console.log('🚨 Server Killed (Exit Code: %O Signal: %O)', code, signal);
            resolve();
        });
        kill(child.pid!, 'SIGINT');
    });
};

export default defineConfig((options: Options) => ({
    entryPoints: ['src/index.ts', 'src/setup.ts'],
    tsconfig: './tsconfig.build.json',
    clean: true,
    format: ['esm'],
    onSuccess: options.watch ? onSuccessDev : onSuccessBuild,
    ...options,
}));