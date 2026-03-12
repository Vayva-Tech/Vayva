/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: '#46EC13',
                background: '#142210',
                glass: 'rgba(20,34,16,0.70)',
                'text-secondary': 'rgba(255,255,255,0.65)',
                danger: '#DC2626',
            },
            fontFamily: {
                sans: ['Manrope'],
            }
        },
    },
    plugins: [],
}
