import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const pkgFields = [
    'name',
    'version',
    'private',
    'type',
    'dependencies',
];

// eslint-disable-next-line import/no-dynamic-require
const pkg = require(join(import.meta.dirname, '../package.json'));

const newPkg = Object.entries(pkg).filter(([key]) => pkgFields.includes(key)).reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
}, {
    scripts: { start: 'node index.js' },
});

const targetPath = join(import.meta.dirname, '../dist/package.json');

writeFileSync(targetPath, JSON.stringify(newPkg, null, 2));