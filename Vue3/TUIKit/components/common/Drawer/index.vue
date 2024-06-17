<template>
  <Overlay
    ref="overlayDomInstanceRef"
    :visible="props.visible"
    :useMask="props.useMask"
    :maskColor="props.overlayColor"
    :isFullScreen="props.isFullScreen"
    @onOverlayClick="onOverlayClick"
  >
    <div
      v-if="isDrawerShow"
      ref="drawerDomRef"
      :class="{
        'drawer': true,
        'origin-bottom': props.popDirection === 'bottom',
        'origin-right': props.popDirection === 'right',
        'slide-bottom': visible && props.popDirection === 'bottom',
        'slide-right': visible && props.popDirection === 'right',
      }"
      :style="{
        minHeight: styles.minHeight,
        maxHeight: styles.maxHeight,
        borderRadius: styles.borderRadius,
        boxShadow: styles.boxShadow,
        width: styles.width,
      }"
    >
      <div class="drawer-container">
        <slot />
      </div>
    </div>
  </Overlay>
</template>

<script setup lang="ts">
import { ref, watch } from '../../../adapter-vue';
import Overlay from '../../common/Overlay/index.vue';

interface IProps {
  visible: boolean;
  popDirection: 'top' | 'right' | 'bottom' | 'left';
  useMask?: boolean;
  isFullScreen?: boolean | undefined;
  overlayColor?: string | undefined;
  drawerStyle?: {
    bottom?: Record<string, any> | undefined;
    right?: Record<string, any> | undefined;
    left?: Record<string, any> | undefined;
    top?: Record<string, any> | undefined;
  };
}

interface IEmits {
  (e: 'onOverlayClick', event: Event): void;
}

const emits = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  visible: true,
  useMask: true,
  isFullScreen: true,
  popDirection: 'bottom',
  drawerStyle: () => ({}),
});

const drawerDomRef = ref<HTMLElement>();
const overlayDomInstanceRef = ref<InstanceType<typeof Overlay>>();
const isDrawerShow = ref<boolean>(false);

const styles = ref(props.drawerStyle[props.popDirection] || {});

watch(() => props.visible, (visible: boolean) => {
  if (visible) {
    isDrawerShow.value = true;
  } else {
    setTimeout(() => {
      isDrawerShow.value = false;
    }, 150);
  }
}, {
  immediate: true,
});

function onOverlayClick(e: Event) {
  emits('onOverlayClick', e);
}

defineExpose({
  drawerDomRef,
  overlayDomRef: overlayDomInstanceRef.value?.overlayDomRef,
});
</script>

<style scoped lang="scss">
:not(not) {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-width: 0;
}

.drawer {
  position: absolute;
  z-index: 1;
  background-color: #fff;
  overflow: hidden;
  transition: transform 0.15s ease-out;

  .drawer-container {
    background-color: #fff;
    height: 100%;
    width: 100%;
  }
}

.origin-bottom {
  bottom: 0;
  left: 0;
  right: 0;
  transform: translateY(100%);
  animation: slide-from-bottom 0.15s ease-out;
}

.origin-right {
  top: 0;
  bottom: 0;
  right: 0;
  transform: translateX(100%);
  animation: slide-from-right 0.15s ease-out;
}

.slide-bottom {
  transform: translateY(0);
}

.slide-right {
  transform: translateX(0);
}

@keyframes slide-from-bottom {
  0% {
    transform: translateY(100%);
  }

  100% {
    transform: translateY(0);
  }
}

@keyframes slide-from-right {
  0% {
    transform: translateX(100%);
  }

  100% {
    transform: translateX(0);
  }
}
</style>
