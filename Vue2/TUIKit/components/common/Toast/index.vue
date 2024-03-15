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
} from '../../../adapter-vue';
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
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.2);
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
  border: 1px solid #e4f2da;
  background: #f2f9ec;
  color: #7ebf50;
}

.error {
  border: 1px solid #fde2e2;
  background: #fef0f0;
  color: #f46c6e;
}

.normal {
  border: 1px solid #e9e9eb;
  background: #f4f4f5;
  color: #909398;
}

.warning {
  border: 1px solid #faf0e2;
  background: #fdf8f1;
  color: #e4b877;
}
</style>
