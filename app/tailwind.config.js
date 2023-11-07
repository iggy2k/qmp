module.exports = {
    content: ['./src/index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                titillium: ['Titillium Web', 'sans-serif'],
            },
        },
    },
    plugins: ['prettier-plugin-tailwindcss'],
}
