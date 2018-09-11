import Vue from 'vue';
import App from './App';
import registerShortcut from './globalShortcut';
import './globalCSS';

registerShortcut();
Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
}).$mount('#app');
