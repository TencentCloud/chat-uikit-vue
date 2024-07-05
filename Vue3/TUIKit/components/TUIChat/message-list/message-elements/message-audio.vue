<template>
  <div
    class="message-audio"
    :class="[
      isMobile && 'message-audio-h5',
      message.flow === 'out' && 'reserve',
      message.hasRiskContent && 'disable',
    ]"
    @click.stop="play"
  >
    <div class="audio-icon-container">
      <div :class="{ 'mask': true, 'play': isAudioPlaying }" />
      <Icon
        class="icon"
        width="16px"
        height="20px"
        :file="audioIcon"
      />
    </div>
    <span
      class="time"
      :style="{ width: `${data.second * 10 + 20}px` }"
    >
      {{ data.second || 1 }} "
    </span>
    <audio
      ref="audioRef"
      :src="data.url"
    />
  </div>
</template>

<script lang="ts" setup>
import { watchEffect, ref, onMounted, onUnmounted } from '../../../../adapter-vue';
import Icon from '../../../common/Icon.vue';
import audioIcon from '../../../../assets/icon/msg-audio.svg';
import { isMobile } from '../../../../utils/env';

interface IEmits {
  (e: 'setAudioPlayed', messageID: string): void;
}

const emits = defineEmits<IEmits>();
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
const isAudioPlaying = ref();
const audioRef = ref<HTMLAudioElement>();

onMounted(() => {
  if (audioRef.value) {
    audioRef.value.addEventListener('ended', onAudioEnded);
    audioRef.value.addEventListener('pause', onAudioPaused);
  }
});

onUnmounted(() => {
  if (audioRef.value) {
    audioRef.value.removeEventListener('ended', onAudioEnded);
    audioRef.value.removeEventListener('pause', onAudioPaused);
  }
});

watchEffect(() => {
  message.value = props.messageItem;
  data.value = props.content;
});

function play() {
  if (message.value.hasRiskContent || !audioRef.value) {
    return;
  }
  if (!audioRef.value.paused) {
    audioRef.value.pause();
    audioRef.value.currentTime = 0;
    isAudioPlaying.value = false;
    return;
  }
  const audios = document.getElementsByTagName('audio');
  Array.from(audios).forEach((audio) => {
    if (!audio.paused) {
      audio.pause();
      audio.currentTime = 0;
    }
  });
  audioRef.value.play();
  isAudioPlaying.value = true;
  if (message.value.flow === 'in') {
    emits('setAudioPlayed', message.value.ID);
  }
}

function onAudioEnded() {
  isAudioPlaying.value = false;
}

function onAudioPaused() {
  isAudioPlaying.value = false;
}
</script>
<style lang="scss" scoped>
@import "../../../../assets/styles/common";

$flow-in-bg-color: #fbfbfb;
$flow-out-bg-color: #dceafd;

.message-audio {
  flex-direction: row;
  display: flex;
  flex: 0 0 auto;
  cursor: pointer;
  overflow: hidden;

  .time {
    flex: 1 1 auto;
    max-width: 300px;
    text-align: start;
  }

  audio {
    width: 0;
    height: 0;
  }
}

.disable {
  cursor: not-allowed;
}

.audio-icon-container {
  flex: 0 0 auto;
  position: relative;
  margin: 0 7px 0 0;
  overflow: hidden;

  .mask {
    position: absolute;
    z-index: 1;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    transform-origin: right;
    transform: scaleX(0);
    background-color: $flow-in-bg-color;

    &.play {
      animation: audio-play 2s steps(1, end) infinite;
    }
  }
}

@keyframes audio-play {
  0% {
    transform: scaleX(0.7056);
  }

  50% {
    transform: scaleX(0.3953);
  }

  75% {
    transform: scaleX(0);
    visibility: hidden;
  }

  100% {
    transform: scaleX(0);
    visibility: hidden;
  }
}

.message-audio.reserve {
  flex-direction: row-reverse;

  .time {
    text-align: end;
  }

  .icon {
    transform: rotate(180deg);
  }

  .audio-icon-container {
    margin: 0 0 0 7px;

    .mask {
      transform-origin: left;
      background-color: $flow-out-bg-color;
    }
  }
}
</style>
