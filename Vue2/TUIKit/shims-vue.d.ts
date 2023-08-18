/* eslint-disable */
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "@tencentcloud/chat-uikit-engine";
declare module "@tencentcloud/tui-core";
declare module "@tencentcloud/call-uikit-vue";
declare module "@tencentcloud/call-uikit-vue2";

declare module "*.svg";
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.gif";
declare module "*.bmp";
declare module "*.tiff";

declare module "*.json" {
  const content: any;
  export default content;
}
