import "./main.css";

import { createApp } from "vue";
import { setConfig, frappeRequest } from "frappe-ui";

import App from "./App.vue";

setConfig("resourceFetcher", frappeRequest);

createApp(App).mount("#app");
