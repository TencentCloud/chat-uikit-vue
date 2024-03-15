<template>
  <div :class="['message-abstract-video']">
    <div class="message-abstract-video-box">
      <img
        :src="videoUrl"
        :class="['video-snapshot']"
      >
      <Icon
        :file="playIcon"
        class="video-play"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from '../../../../../adapter-vue';
import Icon from '../../../../common/Icon.vue';
import playIcon from '../../../../../assets/icon/video-play.png';
import { IVideoMessageContent } from '../../../../../interface';
interface IProps {
  messageContent: Record<string, unknown> | IVideoMessageContent | undefined;
}
const props = withDefaults(defineProps<IProps>(), {
  messageContent: () => ({}) as IVideoMessageContent,
});
const videoUrl = computed<string>(() => {
  return (props.messageContent as IVideoMessageContent).snapshotUrl || (props.messageContent as IVideoMessageContent).url;
});
</script>
<style scoped lang="scss">
@import "../../../../../assets/styles/common";

.message-abstract-video {
  max-width: 100px;
  max-height: 100px;
  width: 100px;
  height: 100px;
  overflow: hidden;
  background-color: #fff;

  &-box {
    max-width: 100px;
    max-height: 100px;
    width: 100px;
    height: 100px;
    overflow: hidden;
    background-color: #fff;
    position: relative;

    .video-snapshot {
      max-width: 100px;
      max-height: 100px;
      width: 100px;
      height: 100px;
      object-fit: contain;
    }

    .video-play {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
      z-index: 3;
      width: 35px;
      height: 35px;
      margin: auto;
    }
  }
}</style>
