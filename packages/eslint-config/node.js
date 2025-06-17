import config from '@lcooper/eslint-config-typescript';

/**
 * @param {string} tsconfigRootDir
 * @returns {import('eslint').Linter.Config}
 */
export default function (tsconfigRootDir) {
    return [
        { ignores: ['dist'] },
        ...config,
        {
            languageOptions: {
                parserOptions: {
                    project: './tsconfig.json',
                    tsconfigRootDir,
                },
            },
            settings: {
                'import/resolver': {
                    typescript: {
                        project: './tsconfig.json',
                    },
                },
            },
        },
    ];
}