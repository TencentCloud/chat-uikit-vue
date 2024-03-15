<template>
  <div
    ref="selfDomRef"
    class="fetch-more-block"
  >
    <template v-if="props.isFetching">
      <slot name="fetching">
        <div>{{ TUITranslateService.t("TUIChat.正在加载") }}</div>
      </slot>
    </template>
    <template v-else>
      <slot name="fetchEnd">
        <div>{{ TUITranslateService.t("TUIChat.加载结束") }}</div>
      </slot>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, getCurrentInstance, withDefaults } from '../../../adapter-vue';
import { TUITranslateService } from '@tencentcloud/chat-uikit-engine';
import { isUniFrameWork } from '../../../utils/env';

interface IProps {
  isFetching: boolean;
  isTerminateObserve?: boolean;
}

interface IEmits {
  (e: 'onExposed'): void;
}

const emits = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  isFetching: false,
  isTerminateObserve: false,
});

let observer: unknown = null;
const selfDomRef = ref();
const thisInstance = getCurrentInstance()?.proxy || getCurrentInstance();

onMounted(() => {
  if (props.isTerminateObserve) {
    return;
  }
  if (!isUniFrameWork) {
    observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        emits('onExposed');
      }
    }, {
      threshold: 1.0,
    });
    if (selfDomRef.value) {
      (observer as IntersectionObserver).observe(selfDomRef.value);
    }
  } else {
    observer = uni.createIntersectionObserver(thisInstance).relativeToViewport();
    (observer as any).observe('.fetch-more-block', () => {
      emits('onExposed');
    });
  }
});

onUnmounted(() => {
  if (observer) {
    (observer as IntersectionObserver).disconnect();
    observer = null;
  }
});

watch(() => props.isTerminateObserve, (isTerminateObserve: boolean) => {
  if (!observer) {
    return;
  }
  if (isTerminateObserve) {
    (observer as IntersectionObserver).disconnect();
  } else if (selfDomRef.value) {
    (observer as IntersectionObserver).disconnect();
    if (!isUniFrameWork) {
      (observer as IntersectionObserver).observe(selfDomRef.value);
    } else {
      (observer as any).observe('.fetch-more-block', () => {
        emits('onExposed');
      });
    }
  }
});
</script>

<style scoped lang="scss">
.fetch-more-block {
  color: #999;
}
</style>
