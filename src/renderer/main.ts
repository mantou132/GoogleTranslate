import Vue from 'vue';
import VueHotkey from 'v-hotkey';
import App from './App';

Vue.use(VueHotkey);

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
}).$mount('#app');
