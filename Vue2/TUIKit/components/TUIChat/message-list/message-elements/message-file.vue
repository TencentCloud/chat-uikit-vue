<template>
  <div
    class="fileMessageContainer"
    :title="TUITranslateService.t('TUIChat.单击下载')"
    @click="download"
  >
    <Icon :file="files" class="fileIcon"></Icon>
    <div>
      <div>{{ props.content.name }}</div>
      <div>{{ props.content.size }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { withDefaults } from "../../../../adapter-vue";
import { TUIGlobal, TUITranslateService } from "@tencentcloud/chat-uikit-engine";
import Icon from "../../../common/Icon.vue";
import files from "../../../../assets/icon/files.png";

const props = withDefaults(defineProps<{
  content: {
    name: string,
    url: string,
    size: number,
  }
}>(), {
  content: {}
});

const isPC = TUIGlobal.getPlatform() === 'pc';

// todo: 区分 web 和 uniapp
const download = () => {
  const option = {
    mode: "cors",
    headers: new Headers({
      "Content-Type": "application/x-www-form-urlencoded",
    }),
  } as RequestInit;
  // 浏览器支持fetch则用blob下载，避免浏览器点击a标签，跳转到新页面预览的行为
  // If the browser supports fetch, use blob to download, so as to avoid the browser clicking the a tag and jumping to the preview of the new page
  if ((window as any)?.fetch) {
    fetch(props.content.url, option)
      .then((res) => res.blob())
      .then((blob) => {
        const a = document.createElement("a");
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = props.content.name;
        a.click();
      });
  } else {
    const a = document.createElement("a");
    a.href = props.content.url;
    a.target = "_blank";
    a.download = props.content.name;
    a.click();
  }
};
</script>
<style lang="scss" scoped>
@import "../../../../assets/styles/common.scss";
.fileMessageContainer {
  display: flex;
  flex-direction: row;
  cursor: pointer;

  .fileIcon {
    margin: auto 8px;
  }
}
</style>
