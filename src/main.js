// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// Styles
import 'unfonts.css'

import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

const options ={
  position: "bottom-center",
  timeout: 2000,
  closeOnClick: true,
  pauseOnFocusLoss: false,
  pauseOnHover: false,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: true,
  hideProgressBar: true,
  closeButton: "button",
  icon: true,
  rtl: false
};

const app = createApp(App)

registerPlugins(app)
app.use(Toast, options);

app.mount('#app')
