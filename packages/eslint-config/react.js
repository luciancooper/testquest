import reactConfig from '@lcooper/eslint-config-typescript-react';
import tsConfig from './node.js';

/**
 * @param {string} tsconfigRootDir
 * @returns {import('eslint').Linter.Config}
 */
export default function (tsconfigRootDir) {
    return [
        ...tsConfig(tsconfigRootDir),
        reactConfig,
    ];
}