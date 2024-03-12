/** @type {import('prettier').Config} */
module.exports = {
    semi: false,
    singleQuote: true,
    trailingComma: 'all',
    plugins: ['@ianvs/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss'],
    importOrder: ['^@', '^[a-zA-Z0-9-]+', '^[./]'],
}