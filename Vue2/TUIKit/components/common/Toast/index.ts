import { createVNode, render, VNode, vueVersion } from "../../../adapter-vue";
import TOAST_TYPE from "./type";
import { TUIGlobal } from "@tencentcloud/chat-uikit-engine";
import MessageConstructor from "./index.vue";

interface IToast {
  message: string;
  type: string;
  offset?: number;
  duration?: number;
  onClose?(): void;
}

interface IToastReturnType {
  close?(): void;
}

const instances: any[] = [];
let seed = 1;

const vueVersionInt = Math.trunc(vueVersion);
const appendTo: HTMLElement | null = document.body;

const Toast = function (options: IToast): IToastReturnType {
  let verticalOffset = options.offset || 20;
  instances.forEach(({ vm }: any) => {
    verticalOffset += (vm?.el?.offsetHeight || vm?.$el?.offsetHeight || 0) + 20;
  });
  verticalOffset += 20;
  const id = `message_${(seed += 1)}`;
  const userOnClose = options.onClose;
  const props: any = {
    zIndex: 20 + seed,
    offset: verticalOffset,
    id,
    ...options,
    onClose: () => {
      Toast.close(id, userOnClose);
    },
  };
  let vm: { component: any; props: any; data: any };
  let container: HTMLDivElement;
  switch (vueVersionInt) {
    case 2:
      const Vue = TUIGlobal?.Vue;
      if (!Vue) {
        return {};
      }
      let Constructor = Vue.extend(MessageConstructor);
      let instance = new Constructor({ propsData: props });
      instance.$mount();
      appendTo.appendChild(instance.$el);
      instance.$el.style.zIndex = props.zIndex;
      instance.verticalOffset = props.verticalOffset;
      instance.visible = true;
      instances.push({ vm: instance });
      return {
        close: () => {
          instance.visible = false;
        },
      };
    case 3:
      vm = createVNode(MessageConstructor, props);
      container = document.createElement("div");
      vm?.props &&
        (vm.props!.onDestroy = () => {
          render(null, container);
        });
      vm?.data &&
        (vm.data!.onDestroy = () => {
          render(null, container);
        });
      render(vm, container);
      instances.push({ vm });
      appendTo.appendChild(container.firstElementChild!);
      return {
        close: () => {
          vm?.component!?.proxy && (vm.component!.proxy.visible = false);
        },
      };
  }
  return {};
};

export function close(id: string, userOnClose?: (vm: VNode) => void): void {
  const idx = instances?.findIndex(
    ({ vm }: any) => id === vm?.component!?.props?.id || id === vm?._props?.id
  );
  if (idx === -1) return;
  const { vm } = instances[idx];
  if (!vm) return;
  userOnClose?.(vm);
  const removedHeight = vm?.el!?.offsetHeight || vm?.$el?.offsetHeight;
  instances.splice(idx, 1);
  // adjust other instances vertical offset
  const len = instances.length;
  if (len < 1) return;
  for (let i = idx; i < len; i++) {
    const pos =
      Number.parseInt(
        instances[i]?.vm?.el!?.style?.top || instances[i]?.vm?.$el!?.style?.top,
        10
      ) -
      removedHeight -
      16;
    instances[i]?.vm?.component!?.props?.offset &&
      (instances[i].vm.component!.props.offset = pos);
    instances[i]?.vm?._props?.offset && (instances[i].vm._props.offset = pos);
  }
}

Toast.close = close;

export { Toast, TOAST_TYPE };
