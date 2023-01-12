/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'tim-profanity-filter-plugin' {
  import TIMProfanityFilterPlugin from 'tim-profanity-filter-plugin'
  export default TIMProfanityFilterPlugin
}

declare module 'tuicall-engine-webrtc' {
  import { TUICallEngine, TUICallEvent, TUICallType } from 'tuicall-engine-webrtc';
  export { TUICallEngine, TUICallEvent, TUICallType };
}

declare module '*.svg' {
  const content: any;
  export default content;
}

declare module 'aegis-web-sdk';

