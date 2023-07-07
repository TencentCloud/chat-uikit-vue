import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import { TUIComponents, TUIChatKit } from "./TUIKit";
import { TUITranslateService } from "@tencentcloud/chat-uikit-engine";
import {
  Button,
  Form,
  FormItem,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Input,
  Checkbox,
} from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import { locales } from "./locales";

const SDKAppID = 0; // Your SDKAppID
const secretKey = ""; // Your secretKey

TUIChatKit.components(TUIComponents, Vue);
TUIChatKit.init();

TUITranslateService.provideLanguages(locales);
TUITranslateService.useI18n();

Vue.config.productionTip = false;
Vue.use(Button);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Dropdown);
Vue.use(DropdownMenu);
Vue.use(DropdownItem);
Vue.use(Input);
Vue.use(Checkbox);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");

export { SDKAppID, secretKey };
