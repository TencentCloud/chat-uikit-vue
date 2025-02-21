<template>
  <transition
    name="fade"
    @after-leave="$emit('destroy')"
  >
    <div
      v-show="visible"
      class="message"
      :class="[handleStyle(type), isH5 && 'message-h5']"
      :style="customStyle"
    >
      <p v-if="!isH5">
        {{ message }}
      </p>
      <span v-if="isH5">{{ message }}</span>
    </div>
  </transition>
</template>
<script lang="ts" setup>
import {
  computed,
  CSSProperties,
  onMounted,
  ref,
  watch,
} from 'vue';
import { isH5 } from '../../../utils/env';
import TOAST_TYPE from './type';

const props = defineProps({
  message: {
    type: String,
    default: '',
  },
  duration: {
    type: Number,
    default: 3000,
  },
  repeatNum: {
    type: Number,
    default: 1,
  },
  id: {
    type: String,
    default: '',
  },
  onClose: {
    type: Function,
    required: false,
  },
  offset: {
    type: Number,
    default: 20,
  },
  zIndex: {
    type: Number,
    default: 0,
  },
  type: {
    type: String,
    default: '',
  },
});
const visible = ref(false);
let timer: any;

const startTimer = () => {
  if (props.duration > 0) {
    timer = setTimeout(() => {
      if (visible.value) {
        close();
      }
    }, props.duration);
  }
};

const clearTimer = () => {
  clearTimeout(timer);
};

const close = () => {
  visible.value = false;
  if (typeof props.onClose === 'function') {
    props.onClose();
  }
};

watch(
  () => props.repeatNum,
  () => {
    clearTimer();
    startTimer();
  },
);

const customStyle = computed<CSSProperties>(() => ({
  top: `${props.offset}px`,
  zIndex: props.zIndex,
}));

onMounted(() => {
  startTimer();
  visible.value = true;
});

const handleStyle = (type?: string) => {
  if (
    type
      && (type === TOAST_TYPE.ERROR
      || type === TOAST_TYPE.SUCCESS
      || type === TOAST_TYPE.WARNING)
  )
    return type;
  return TOAST_TYPE.NORMAL;
};
</script>
<style lang="scss" scoped>
@import "../../../assets/styles/common";

.message {
  position: fixed;
  left: 0;
  right: 0;
  margin: 0 auto;
  max-width: 450px;
  width: fit-content;
  justify-content: center;
  align-items: center;

  p {
    box-shadow: 0 2px 12px 0 var(--uikit-color-black-8);
    border-radius: 3px;
    padding: 10px 15px;
    width: fit-content;
    word-break: break-all;
  }
}

.message-h5 {
  position: absolute;
  top: 20px !important;
  margin: 0 auto;
  max-width: 80%;
  width: fit-content;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  padding: 10px 15px;

  span {
    font-family: PingFangSC-Regular;
    font-weight: 400;
    font-size: 14px;
    letter-spacing: 0;
    text-align: center;
    word-break: break-all;
  }
}

.success {
  background: var(--toast-color-success);
  color: var(--text-color-success);
}

.error {
  background: var(--toast-color-error);
  color: var(--text-color-error);
}

.normal {
  background: var(--toast-color-default);
  color: var(--text-color-primary);
}

.warning {
  background: var(--toast-color-warning);
  color: var(--text-color-warning);
}
</style>
