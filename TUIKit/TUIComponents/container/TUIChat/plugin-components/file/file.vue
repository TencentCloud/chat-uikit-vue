<template>
  <span class="upload-btn icon icon-files">
      <input title="文件" v-if="!isMute" type="file" data-type="file" accept="*" @change="sendUploadMessage" />
      <slot />
  </span>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, watchEffect } from 'vue';
import { handleErrorPrompts } from '../../../utils';

const File = defineComponent({
  props: {
    show: {
      type: Boolean,
      default: () => false,
    },
    isMute: {
      type: Boolean,
      default: () => false,
    },
    isH5: {
      type: Boolean,
      default: () => false,
    },
  },
  setup(props:any, ctx:any) {
    const data = reactive({
      isMute: false,
    });

    watchEffect(() => {
      data.isMute = props.isMute;
    });

    // 发送需要上传的消息：文件
    const sendUploadMessage = async (e:any) => {
      if (e.target.files.length > 0) {
        try {
          await File.TUIServer.sendFileMessage(e.target);
        } catch (error) {
          handleErrorPrompts(error, props);
        }
      }
      e.target.value = '';
    };

    return {
      ...toRefs(data),
      sendUploadMessage,
    };
  },
});
export default File;
</script>

<style lang="scss" scoped>
@import url('../../../../styles/common.scss');
@import url('../../../../styles/icon.scss');
.upload-btn {
  position: relative;
  input {
    position: absolute;
    cursor: pointer;
    left: 0;
    top: 0;
    opacity: 0;
    width: 100%;
    height: 100%;
  }
}
</style>
