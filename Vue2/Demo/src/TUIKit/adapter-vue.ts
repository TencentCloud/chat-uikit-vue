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
  if (
    (Vue as any)?.default?.version &&
    (Vue as any)?.default?.version?.startsWith("2.7.")
  ) {
    // >= Vue 2.7.0
    vueVersion = 2.7;
  } else if (
    (Vue as any)?.default?.version &&
    (Vue as any)?.default?.version?.startsWith("2.")
  ) {
    // < Vue 2.7.0
    vueVersion = 2;
  } else {
    // >= Vue 3.0.0
    vueVersion = 3;
    createVNode = (Vue as any)?.createVNode;
    render = (Vue as any)?.render;
    // exportedAPIOrigin = Vue;
  }
} catch (error: any) {
  // >= Vue 3.0.0
  vueVersion = 3;
  createVNode = (Vue as any)?.createVNode;
  render = (Vue as any)?.render;
}
console.warn(`[adapter-vue]: vue version is ${vueVersion}`);
export { vueVersion, render, createVNode };
export * from "vue";
