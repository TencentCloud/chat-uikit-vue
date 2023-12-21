<template>
  <div
    class="message-audio"
    :class="[
      !isPC && 'message-audio-h5',
      message.flow === 'out' && 'reserve',
      message.hasRiskContent && 'disable',
    ]"
    @click.stop="play"
  >
    <Icon class="icon" :file="audioIcon"></Icon>
    <label class="time" :style="{ width: `${data.second * 10 + 20}px` }">
      {{ data.second || 1 }} "
    </label>
    <audio ref="audioRef" :src="data.url"></audio>
  </div>
</template>

<script lang="ts" setup>
import { watchEffect, ref } from "../../../../adapter-vue";
import Icon from "../../../common/Icon.vue";
import audioIcon from "../../../../assets/icon/msg-audio.svg";
import { isPC } from "../../../../utils/env";
const props = defineProps({
  content: {
    type: Object,
    default: () => ({}),
  },
  messageItem: {
    type: Object,
    default: () => ({}),
  },
});

const data = ref();
const message = ref();
const show = ref();
const audioRef = ref(null);

watchEffect(() => {
  message.value = props.messageItem;
  data.value = props.content;
});

const play = () => {
  if (message.value.hasRiskContent) {
    return;
  }
  const audios = document.getElementsByTagName("audio");
  for (const audio of audios) {
    if (!audio.paused) {
      audio.pause();
      audio.load();
    }
  }
  const audioPlayer: any = audioRef.value;
  if (audioPlayer.paused) {
    audioPlayer.play();
    show.value = true;
  } else {
    audioPlayer.pause();
    audioPlayer.load();
    show.value = false;
  }
};
</script>
<style lang="scss" scoped>
@import "../../../../assets/styles/common.scss";
.message-audio {
  box-sizing: border-box;
  display: flex;
  flex: 0 0 auto;
  cursor: pointer;
  overflow: hidden;
  .icon {
    margin-right: 7px;
    margin-left: 0px;
  }
  .time {
    max-width: 300px;
    text-align: start;
  }
  audio {
    width: 0;
    height: 0;
  }
}
.message-audio-h5 {
  .time {
    max-width: 200px;
  }
}
.reserve {
  flex-direction: row-reverse;
  .time {
    text-align: end;
  }
  .icon {
    margin-right: 0px;
    margin-left: 7px;
    transform: rotate(180deg);
  }
}
.disable {
  cursor: not-allowed;
}
</style>
