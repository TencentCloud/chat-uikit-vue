/* eslint-disable */
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

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

declare module "dayjs";
declare module "dayjs/plugin/localeData.js";
declare module "dayjs/plugin/isSameOrAfter.js";
declare module "dayjs/plugin/isSameOrBefore.js";

declare module "marked-highlight";
declare module "highlight.js";
declare module "dompurify";
declare module "marked";
