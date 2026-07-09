/** tailwind.config.js
 *  Mirrors the config previously inlined in head.jsp > tailwind.config = {...}
 *  Scans all JSP templates and static HTML/JS so no used class is purged.
 */
module.exports = {
    darkMode: 'class',
    content: [
        '../../../**/*.jsp',
        '../*.html',
        '../js/**/*.js',
    ],
    theme: {
        extend: {
            colors: {
                'primary':               '#001264',
                'on-primary':            '#ffffff',
                'primary-container':     '#1a2b6b',
                'surface':               '#ffffff',
                'on-surface':            '#1a1a2e',
                'surface-variant':       '#f1f3f4',
                'on-surface-variant':    '#4a5080',
                'surface-container-lowest': '#ffffff',
                'surface-container-low': '#f8f9fa',
                'surface-container':     '#f1f3f4',
                'surface-container-high':'#e8eaed',
                'surface-dim':           '#e0e2e7',
                'outline':               '#76777c',
                'outline-variant':       '#c6c6cc',
                'on-primary-fixed':      '#001264',
                'on-secondary-fixed':    '#1a2b6b',
                'on-tertiary-fixed':     '#1a1a2e',
                'success':               '#1e8c4e',
                'danger':                '#b91c1c',
            },
            fontFamily: {
                'headline': ['Manrope', 'sans-serif'],
                'body':     ['Inter', 'sans-serif'],
                'label':    ['Inter', 'sans-serif'],
                'mono':     ['Noto Sans Mono', 'monospace'],
                'manrope':  ['Manrope', 'sans-serif'],
            },
            borderRadius: {
                DEFAULT: '0.25rem',
                'lg':    '0.5rem',
                'xl':    '0.75rem',
                'full':  '9999px',
            },
        },
    },
    plugins: [],
};
