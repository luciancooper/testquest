import reactConfig from '@lcooper/eslint-config-typescript-react';
import tsConfig from './node.js';

/**
 * @param {string} tsconfigRootDir
 * @param {string|string[]} project
 * @returns {import('eslint').Linter.Config}
 */
export default function (tsconfigRootDir, project) {
    return [
        ...tsConfig(tsconfigRootDir, project),
        reactConfig,
    ];
}