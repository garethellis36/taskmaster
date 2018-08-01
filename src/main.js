import Vue from 'vue'
import App from './App.vue'
import {WebCam} from 'vue-web-cam'

Vue.component('web-cam', WebCam);

new Vue({
    el: '#app',
    render: h => h(App)
});
