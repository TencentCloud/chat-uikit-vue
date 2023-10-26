<template>
  <div :class="['message-abstract-video']">
    <div class="message-abstract-video-box">
      <img :src="messageContent.snapshotUrl" :class="['messageVideo']" />
      <Icon :file="playIcon" class="video-play"></Icon>
    </div>
  </div>
</template>
<script setup lang="ts">
import Icon from "../../../../common/Icon.vue";
import playIcon from "../../../../../assets/icon/video-play.png";
const props = defineProps({
  messageContent: {
    type: Object,
    default: () => ({}),
  },
});
</script>
<style scoped lang="scss">
@import "../../../../../assets/styles/common.scss";

.message-abstract-video {
  max-width: 100px;
  max-height: 100px;
  width: 100px;
  height: 100px;
  overflow: hidden;
  background-color: #ffffff;

  &-box {
    max-width: 100px;
    max-height: 100px;
    width: 100px;
    height: 100px;
    overflow: hidden;
    background-color: #ffffff;
    position: relative;

    .messageVideo {
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
