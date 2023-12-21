import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import { TUIComponents, TUIChatKit } from "./TUIKit";
import { TUITranslateService, TUIStore, StoreName } from "@tencentcloud/chat-uikit-engine";
import TUINotification from "./TUIKit/components/TUINotification/index";
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

/**
 * Init TUINotification configuration.
 */
TUINotification.setNotificationConfiguration({
  showPreviews: true,
  allowNotifications: true,
  notificationTitle: "Tencent Cloud Chat",
  notificationIcon: "https://web.sdk.qcloud.com/im/demo/latest/faviconnew.png",
});

/**
 * Listen for new messages and use notification components.
 * This capability is only available in the web environmen.
 */
TUIStore.watch(StoreName.CHAT, {
  newMessageList: (newMessageList: unknown) => {
    if (Array.isArray(newMessageList)) {
      newMessageList.forEach(message => TUINotification.notify(message));
    }
  }
});

export { SDKAppID, secretKey };
