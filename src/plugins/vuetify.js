/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

const savedTheme = localStorage.getItem('theme') || 'system'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: savedTheme,
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#d97706',    // Um âmbar rico e quente
          secondary: '#6d28d9',  // Roxo/violeta profundo
          background: '#f9fafb',  // Fundo cinza muito claro
          surface: '#ffffff',
          'on-background': '#1f2937',
          'on-surface': '#1f2937',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#fcd34d',    // Amarelo/âmbar claro e vibrante
          secondary: '#a78bfa',  // Violeta mais suave e claro
          background: '#18181b',  // Fundo de zinco escuro, bem neutro
          surface: '#27272a',     // Superfície de zinco um pouco mais clara
        },
      },
    },
  },
})
