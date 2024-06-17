<template>
  <div
    class="radio-select"
    @click="toggleSelect"
  >
    <div
      v-if="!props.isSelected"
      class="radio-no-select"
    />
    <Icon
      v-else
      :file="radioIcon"
      :size="'20px'"
    />
  </div>
</template>

<script lang="ts" setup>
import Icon from '../Icon.vue';
import radioIcon from '../../../assets/icon/radio.svg';

interface IProps {
  isSelected: boolean;
}

interface IEmits {
  (e: 'onChange', value: boolean): void;
}

const emits = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(),
  {},
);

function toggleSelect() {
  emits('onChange', !props.isSelected);
}
</script>
<style lang="scss" scoped>
:not(not) {
  display: flex;
  flex-direction: column;
  min-width: 0;
  box-sizing: border-box
}

.radio-select {
  flex: 1;
  flex-direction: column;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  justify-content: center;

  .radio-no-select {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    border: 2px solid #ddd;
  }
}
</style>
