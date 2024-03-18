<template>
  <div
    v-if="showDialog"
    class="dialog"
    :class="[!isPC ? 'dialog-h5' : '', center ? 'center' : '']"
    @click.stop.prevent="toggleView(clickType.OUTSIDE)"
  >
    <main
      class="dialog-main"
      :class="[!backgroundDialog ? 'dialog-main-back' : '']"
      @click.stop.prevent="toggleView(clickType.INSIDE)"
    >
      <header
        v-if="isHeaderShowDialog"
        class="dialog-main-header"
      >
        <h1 class="dialog-main-title">
          {{ showTitle }}
        </h1>
        <i
          class="icon icon-close"
          @click="close"
        />
      </header>
      <div
        class="dialog-main-content"
        :class="[isUniFrameWork && isH5 ? 'dialog-main-content-uniapp' : '']"
      >
        <slot />
      </div>
      <footer
        v-if="isFooterShowDialog"
        class="dialog-main-footer"
      >
        <button
          class="btn btn-cancel"
          @click="close"
        >
          {{ TUITranslateService.t('component.取消') }}
        </button>
        <button
          class="btn btn-default"
          @click="submit"
        >
          {{ TUITranslateService.t('component.确定') }}
        </button>
      </footer>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from '../../../adapter-vue';
import { TUITranslateService } from '@tencentcloud/chat-uikit-engine';
import { isPC, isH5, isUniFrameWork } from '../../../utils/env';
const clickType = {
  OUTSIDE: 'outside',
  INSIDE: 'inside',
};
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
const backgroundDialog = ref(true);
const showTitle = ref('');

watchEffect(() => {
  showDialog.value = props.show;
  showTitle.value = props.title;
  isHeaderShowDialog.value = props.isHeaderShow;
  isFooterShowDialog.value = props.isFooterShow;
  backgroundDialog.value = props.background;
});

const emit = defineEmits(['update:show', 'submit']);

const toggleView = (type: string) => {
  if (type === clickType.OUTSIDE) {
    close();
  }
};

const close = () => {
  showDialog.value = !showDialog.value;
  emit('update:show', showDialog.value);
};

const submit = () => {
  emit('submit');
  close();
};
</script>
<style lang="scss" scoped src="./style/dialog.scss"></style>
