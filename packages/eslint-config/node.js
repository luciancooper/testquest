import config from '@lcooper/eslint-config-typescript';

/**
 * @param {string} tsconfigRootDir
 * @param {string|string[]} project
 * @returns {import('eslint').Linter.Config}
 */
export default function (tsconfigRootDir, project) {
    return [
        { ignores: ['dist'] },
        ...config,
        {
            languageOptions: {
                parserOptions: {
                    project,
                    tsconfigRootDir,
                },
            },
            settings: {
                'import/resolver': {
                    typescript: {
                        project,
                    },
                },
            },
        },
    ];
}