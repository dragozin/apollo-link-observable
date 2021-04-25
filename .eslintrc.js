module.exports = {
    extends: ['airbnb-typescript'],
    rules: {
        indent: ['error', 4],
        '@typescript-eslint/indent': ['error', 4],
        'import/prefer-default-export': 'off',
        'no-console': 'error',
        'implicit-arrow-linebreak': 'off',
        'operator-linebreak': 'off',
    },
    parserOptions: {
        project: './tsconfig.eslint.json',
    },
};
