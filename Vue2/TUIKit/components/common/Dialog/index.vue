<template>
  <div class="dialog" :class="[!isPC ? 'dialog-h5' : '', center ? 'center' : '']" v-if="showDialog"
    @click.self="!isWeChat && toggleView">
    <main class="dialog-main" :class="[!backgroundDailog ? 'dialog-main-back' : '']">
      <header v-if="isHeaderShowDialog">
        <h1>{{ showTitle }}</h1>
        <i class="icon icon-close" @click="toggleView"></i>
      </header>
      <div class="dialog-main-content" :class="[isUniFrameWork && isH5 ? 'dialog-main-content-uniapp' : '']">
        <slot />
      </div>
      <footer v-if="isFooterShowDialog">
        <button class="btn btn-cancel" @click="toggleView">{{ TUITranslateService.t('component.取消') }}</button>
        <button class="btn btn-default" @click="submit">{{ TUITranslateService.t('component.确定') }}</button>
      </footer>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, watchEffect, toRefs, defineProps, defineEmits } from "../../../adapter-vue";
import {
  TUIGlobal,
  TUITranslateService,
} from "@tencentcloud/chat-uikit-engine";
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  isHeaderShow: {
    type: Boolean,
    default: true,
  },
  isFooterShow: {
    type: Boolean,
    default: true,
  },
  background: {
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
    default: '',
  },
  center: {
    type: Boolean,
    default: false,
  },
});

const showDialog = ref(false);
const isHeaderShowDialog = ref(true);
const isFooterShowDialog = ref(true);
const backgroundDailog = ref(true);
const showTitle = ref('');
const isPC = ref(TUIGlobal.getPlatform() === "pc")
const isWeChat = ref(TUIGlobal.getPlatform() === "wechat");
const isH5 = ref(TUIGlobal.getPlatform() === "h5");
const isUniFrameWork = ref(typeof uni !== 'undefined');


watchEffect(() => {
  showDialog.value = props.show;
  showTitle.value = props.title;
  isHeaderShowDialog.value = props.isHeaderShow;
  isFooterShowDialog.value = props.isFooterShow;
  backgroundDailog.value = props.background;
})

const emit = defineEmits(['update:show', 'submit'])

const toggleView = () => {
  showDialog.value = !showDialog.value;
  emit('update:show', showDialog.value);
};

const submit = () => {
  emit('submit');
  toggleView();
};
</script>
<style lang="scss" scoped src="./style/dialog.scss"></style>
