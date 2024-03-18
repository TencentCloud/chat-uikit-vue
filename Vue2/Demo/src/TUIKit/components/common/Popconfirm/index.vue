<template>
  <div
    v-if="_isShow"
    class="pop"
    @click.stop.prevent="toggleView(clickType.OUTSIDE)"
  >
    <main
      class="pop-main"
      :class="[!isPC ? 'pop-main-h5' : '']"
      @click.stop.prevent="toggleView(clickType.INSIDE)"
    >
      <header
        v-if="isHeaderShow"
        class="pop-main-header"
      >
        <h1 class="pop-main-title">
          {{ title }}
        </h1>
      </header>
      <div
        class="pop-main-content"
        :class="[isUniFrameWork && isH5 ? 'pop-main-content-uniapp' : '']"
      >
        <slot />
      </div>
      <footer class="pop-main-footer">
        <button
          v-if="isConfirmButtonShow"
          class="btn btn-confirm"
          @click="popConfirm()"
        >
          {{ TUITranslateService.t(confirmButtonText) }}
        </button>
        <button
          v-if="isCancelButtonShow"
          class="btn btn-cancel"
          @click="popCancel()"
        >
          {{ TUITranslateService.t(cancelButtonText) }}
        </button>
      </footer>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { ref, toRefs, watchEffect } from '../../../adapter-vue';
import {
  TUIGlobal,
  TUITranslateService,
} from '@tencentcloud/chat-uikit-engine';
import { isUniFrameWork } from '../../../utils/env';
const props = withDefaults(
  defineProps<{
    isShow: boolean;
    title?: string;
    isHeaderShow?: boolean;
    isConfirmButtonShow?: boolean;
    isCancelButtonShow?: boolean;
    confirmButtonText?: string;
    cancelButtonText?: string;
  }>(),
  {
    isShow: false,
    isHeaderShow: false,
    isConfirmButtonShow: true,
    isCancelButtonShow: true,
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  },
);

const { isShow } = toRefs(props);
const clickType = {
  OUTSIDE: 'outside',
  INSIDE: 'inside',
};
const isPC = ref(TUIGlobal.getPlatform() === 'pc');
const isH5 = ref(TUIGlobal.getPlatform() === 'h5');
const _isShow = ref<boolean>(false);
const emit = defineEmits(['update:show', 'popConfirm']);

const toggleView = (type: string) => {
  if (type === clickType.OUTSIDE) {
    popCancel();
  }
};
watchEffect(() => {
  _isShow.value = isShow.value;
});
function popCancel() {
  _isShow.value = !_isShow.value;
  emit('update:show', _isShow.value);
}

function popConfirm() {
  emit('popConfirm');
  popCancel();
}
</script>
<style lang="scss" scoped>
$pop-bg-color: #fff;
$pop-header: #333;
$confirm-bg-color: #006EFF;
$confirm-text-color: #fff;
$concel-bg-color: #666;
$content-color: #333;

.pop {
  background: rgba(0, 0, 0, .3);
  position: fixed;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  z-index: 6;
  display: flex;
  justify-content: center;
  align-items: center;

  &-main {
    min-width: 368px;
    border-radius: 10px;
    padding: 20px 30px;
    max-width: 380px;
    background: $pop-bg-color;

    &-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 16px;
      line-height: 30px;
      font-weight: 500;
      color: $pop-header;
    }

    &-title {
      font-size: 16px;
      line-height: 30px;
      font-family: PingFangSC-Medium;
      font-weight: 500;
      color: $content-color;
    }

    &-content {
      font-size: 14px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 20px;
      font-weight: 400;
      color: $content-color;
    }

    &-footer {
      display: flex;
      justify-content: flex-end;
    }
  }
}

.pop-main-h5 {
  min-width: 220px;
  max-width: 260px;
}

.btn {
  padding: 8px 20px;
  margin: 0 6px;
  border-radius: 4px;
  border: none;
  font-size: 14px;
  text-align: center;
  line-height: 20px;

  &-cancel {
    // border: 1px solid #dddddd;
    color: $concel-bg-color;
  }

  &-confirm {
    background: $confirm-bg-color;
    border: 1px solid $confirm-bg-color;
    color: $confirm-text-color;
  }
}
</style>
