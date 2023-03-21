<template>
  <transition name="fade" @before-leave="onClose" @after-leave="$emit('destroy')">
    <div class="message" :class="[handleStyle(type), isH5 && 'message-h5']" :style="customStyle" v-show="visible">
      <p v-if="!isH5">{{ message }}</p>
      <span v-if="isH5">{{ message }}</span>
    </div>
  </transition>
</template>
<script lang="ts">
import { useTimeoutFn } from '@vueuse/core';
import { computed, CSSProperties, defineComponent, onMounted, ref, watch } from 'vue';
export default defineComponent({
  name: 'TUIMessage',
  props: {
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
    isH5: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const visible = ref(false);

    let stopTimer: (() => void) | undefined = undefined;

    function startTimer() {
      if (props.duration > 0) {
        ({ stop: stopTimer } = useTimeoutFn(() => {
          if (visible.value) close();
        }, props.duration));
      }
    }

    function clearTimer() {
      stopTimer?.();
    }

    function close() {
      visible.value = false;
    }

    watch(
      () => props.repeatNum,
      () => {
        clearTimer();
        startTimer();
      }
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
      if (type && (type === 'error' || type === 'success' || type === 'warning')) return type;
      return 'normal';
    };

    return {
      visible,
      customStyle,
      handleStyle,
    };
  },
});
</script>
<style lang="scss" scoped>
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
  top: 300px !important;
  margin: 0 auto;
  width: fit-content;
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
