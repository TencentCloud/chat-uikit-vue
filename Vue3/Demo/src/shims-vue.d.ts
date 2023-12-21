declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

declare module "@vue/composition-api";

declare module '*.svg' {
  const content: any;
  export default content;
}