<template>
  <div
    class="transfer"
    :class="[!isPC ? 'transfer-h5' : '', isWeChat ? 'transfer-h5-wechat' : '']"
  >
    <header
      v-if="!isPC"
      class="transfer-header transfer-h5-header"
    >
      <div
        v-if="!props.isHiddenBackIcon"
        @click="cancel"
      >
        <Icon
          class="icon"
          :file="backIcon"
          :width="'18px'"
          :height="'18px'"
        />
      </div>
      <span class="title">{{ transferTitle }}</span>
      <span class="space" />
    </header>
    <main class="main">
      <div class="left">
        <header class="transfer-header">
          <!-- PC triggers @keyup.enter -->
          <input
            v-if="isPC && isTransferSearch"
            type="text"
            :value="searchValue"
            :placeholder="TUITranslateService.t('component.请输入userID')"
            enterkeyhint="search"
            :class="[isUniFrameWork ? 'left-uniapp-input' : '']"
            @keyup.enter="handleInput"
          >
          <!-- not PC triggers blur -->
          <input
            v-if="!isPC && isTransferSearch"
            type="text"
            :placeholder="TUITranslateService.t('component.请输入userID')"
            enterkeyhint="search"
            :value="searchValue"
            :class="[isUniFrameWork ? 'left-uniapp-input' : '']"
            @blur="handleInput"
            @confirm="handleInput"
          >
        </header>
        <main class="transfer-left-main">
          <ul class="transfer-list">
            <li
              v-if="optional.length > 1 && !isRadio"
              class="transfer-list-item"
              @click="selectedAll"
            >
              <Icon
                v-if="transferSelectedList.length === optional.length"
                :file="selectedIcon"
                :width="'18px'"
                :height="'18px'"
              />
              <i
                v-else
                class="icon-unselected"
              />
              <span class="select-all">{{
                TUITranslateService.t("component.全选")
              }}</span>
            </li>
            <li
              v-for="item in transferList"
              :key="item.userID"
              class="transfer-list-item"
              @click="selected(item)"
            >
              <Icon
                v-if="transferSelectedList.indexOf(item) > -1"
                :file="selectedIcon"
                :class="[item.isDisabled && 'disabled']"
                :width="'18px'"
                :height="'18px'"
              />
              <i
                v-else
                :class="[item.isDisabled && 'disabled', 'icon-unselected']"
              />
              <template v-if="!isTransferCustomItem">
                <img
                  class="avatar"
                  :src="
                    item.avatar ||
                      'https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'
                  "
                  onerror="this.onerror=null;this.src='https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'"
                >
                <span class="name">{{ item.nick || item.userID }}</span>
                <span v-if="item.isDisabled">（{{ TUITranslateService.t("component.已在群中") }}）</span>
              </template>
              <template v-else>
                <slot
                  name="left"
                  :data="item"
                />
              </template>
            </li>
            <li
              v-if="transferTotal > transferList.length"
              class="transfer-list-item more"
              @click="getMore"
            >
              {{ TUITranslateService.t("component.查看更多") }}
            </li>
          </ul>
        </main>
      </div>
      <div class="right">
        <header
          v-if="isPC"
          class="transfer-header"
        >
          {{ transferTitle }}
        </header>
        <ul
          v-if="resultShow"
          class="transfer-list"
        >
          <p
            v-if="transferSelectedList.length > 0 && isPC"
            class="transfer-text"
          >
            {{ TUITranslateService.t("component.已选中")
            }}{{ transferSelectedList.length
            }}{{ TUITranslateService.t("component.人") }}
          </p>
          <li
            v-for="(item, index) in transferSelectedList"
            :key="index"
            class="transfer-list-item space-between"
          >
            <aside class="transfer-list-item-content">
              <template v-if="!isTransferCustomItem">
                <img
                  class="avatar"
                  :src="
                    item.avatar ||
                      'https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'
                  "
                  onerror="this.onerror=null;this.src='https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'"
                >
                <span
                  v-if="isPC"
                  class="name"
                >{{ item.nick || item.userID }}</span>
              </template>
              <template v-else>
                <slot
                  name="right"
                  :data="item"
                />
              </template>
            </aside>
            <span
              v-if="isPC"
              @click="selected(item)"
            >
              <Icon
                :file="cancelIcon"
                :width="'18px'"
                :height="'18px'"
              />
            </span>
          </li>
        </ul>
        <footer class="transfer-right-footer">
          <button
            class="btn btn-cancel"
            @click="cancel"
          >
            {{ TUITranslateService.t("component.取消") }}
          </button>
          <button
            v-if="transferSelectedList.length > 0"
            class="btn"
            @click="submit"
          >
            {{ TUITranslateService.t("component.完成") }}
          </button>
          <button
            v-else
            class="btn btn-no"
            @click="submit"
          >
            {{ TUITranslateService.t("component.完成") }}
          </button>
        </footer>
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect, computed } from '../../../adapter-vue';
import { TUITranslateService } from '@tencentcloud/chat-uikit-engine';
import { ITransferListItem } from '../../../interface';
import Icon from '../Icon.vue';
import selectedIcon from '../../../assets/icon/selected.svg';
import backIcon from '../../../assets/icon/back.svg';
import cancelIcon from '../../../assets/icon/cancel.svg';
import { isPC, isUniFrameWork, isWeChat } from '../../../utils/env';

const props = defineProps({
  list: {
    type: Array,
    default: () => [],
  },
  selectedList: {
    type: Array,
    default: () => [],
  },
  isSearch: {
    type: Boolean,
    default: true,
  },
  isRadio: {
    type: Boolean,
    default: false,
  },
  isCustomItem: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: '',
  },
  resultShow: {
    type: Boolean,
    default: true,
  },
  total: {
    type: Number,
    default: 0,
  },
  isHiddenBackIcon: {
    type: Boolean,
    default: false,
  },
});

const transferList = ref<ITransferListItem[]>([]);
const transferTotal = ref<number>(0);
const transferSelectedList = ref<ITransferListItem[]>([]);
const isTransferSearch = ref(true);
const isTransferCustomItem = ref(false);
const transferTitle = ref('');
const searchValue = ref('');

watchEffect(() => {
  if (props.isCustomItem) {
    for (let index = 0; index < props.list.length; index++) {
      if (
        (props.list[index] as any).conversationID.indexOf('@TIM#SYSTEM') > -1
      ) {
        // eslint-disable-next-line vue/no-mutating-props
        props.list.splice(index, 1);
      }
      transferList.value = props.list as ITransferListItem[];
    }
  } else {
    transferList.value = props.list as ITransferListItem[];
  }
  transferTotal.value = props.total ? props.total : props.list.length;
  transferSelectedList.value = (props.selectedList && props.selectedList.length > 0 ? props.selectedList : transferSelectedList.value) as any;
  isTransferSearch.value = props.isSearch;
  isTransferCustomItem.value = props.isCustomItem;
  transferTitle.value = props.title;
});

const emit = defineEmits(['search', 'submit', 'cancel', 'getMore']);

const optional = computed(() =>
  transferList.value.filter((item: any) => !item.isDisabled),
);

const handleInput = (e: any) => {
  searchValue.value = e.target.value || e.detail.value;
  emit('search', searchValue.value);
};
const selected = (item: any) => {
  if (item.isDisabled) {
    return;
  }
  let list: ITransferListItem[] = transferSelectedList.value;
  const index: number = list.indexOf(item);
  if (index > -1) {
    return transferSelectedList.value.splice(index, 1);
  }
  if (props.isRadio) {
    list = [];
  }
  list.push(item);
  transferSelectedList.value = list;
};

const selectedAll = () => {
  if (transferSelectedList.value.length === optional.value.length) {
    transferSelectedList.value = [];
  } else {
    transferSelectedList.value = [...optional.value];
  }
};

const submit = () => {
  emit('submit', transferSelectedList.value);
  searchValue.value = '';
};

const cancel = () => {
  emit('cancel');
  searchValue.value = '';
};

const getMore = () => {
  emit('getMore');
};
</script>

<style lang="scss" scoped src="./style/transfer.scss"></style>
