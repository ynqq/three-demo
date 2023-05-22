import "./assets/main.css";
import router from "./router";
import "ant-design-vue/dist/antd.min.css";
import "uno.css";
import { createApp } from "vue";
import App from "./App.vue";

const app = createApp(App);
app.use(router);
app.mount("#app");
