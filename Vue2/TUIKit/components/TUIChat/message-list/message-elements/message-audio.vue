<template>
  <div
    class="message-audio"
    :class="[message.flow === 'out' && 'reserve']"
    @click.stop="play"
    :style="`width: ${data.second * 10 + 40}px`"
  >
    <Icon
    :file="voice"
    :class="[message.flow === 'out' && 'icon-reserve']"
    ></Icon>
    <label>{{ data.second }} "</label>
    <audio ref="audioRef" :src="data.url"></audio>
  </div>
</template>

<script lang="ts" setup>
import { watchEffect, ref, watch } from '../../../../adapter-vue';
import Icon from "../../../common/Icon.vue";
import voice from "../../../../assets/icon/voice.png";
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
  const audios = document.getElementsByTagName('audio');
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
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;
  max-width: 100%;
  overflow: hidden;
  .icon {
    margin: 0 7px;
  }
  audio {
    width: 0;
    height: 0;
  }
}
.reserve {
  flex-direction: row-reverse;
  .icon {
    transform: rotate(180deg);
  }
}
</style>
