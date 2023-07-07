import * as Vue from "vue";
let vueVersion: number;
let createVNode = (
  arg1: any,
  arg2: any
): { component: any; props: any; data: any } => {
  return {} as { component: any; props: any; data: any };
};
let render = (arg1: any, arg2: any) => {
  return;
};
try {
  if (/^2\./.test(Vue?.version)) {
    // Vue 2.x
    vueVersion = 2;
  } else {
    // Vue 3.x
    vueVersion = 3;
    createVNode = (Vue as any)?.createVNode;
    render = (Vue as any)?.render;
  }
} catch (error: any) {
  // Vue 3.x
  vueVersion = 3;
  createVNode = (Vue as any)?.createVNode;
  render = (Vue as any)?.render;
}
export { vueVersion };
export * from "vue";
export { createVNode, render };
