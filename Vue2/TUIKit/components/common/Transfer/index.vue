<template>
  <div class="transfer" :class="[!isPC ? 'transfer-h5' : '', isWeChat ? 'transfer-h5-wechat' : '']">
    <header class="transfer-h5-header" v-if="!isPC" @click="cancel">
      <Icon :file="backIcon" :width="'18px'" :height="'18px'"></Icon>
      <span class="title">{{ transferTitle }}</span>
    </header>
    <main class="main">
      <div class="left">
        <header>
          <!-- PC 端触发 @keyup.enter -->
          <input v-if="isPC && isTransferSearch && !joinGroup" type="text"  :value="searchValue" @keyup.enter="handleInput" 
            :placeholder="TUITranslateService.t('component.请输入userID')" enterkeyhint="search"
            :class="[isUniFrameWork ? 'left-uniapp-input' : '']"/>
          <!-- 非 PC 端触发 blur -->  
          <input v-if="!isPC && isTransferSearch && !joinGroup" type="text"  @blur="handleInput" @confirm="handleInput"
            :placeholder="TUITranslateService.t('component.请输入userID')" enterkeyhint="search" :value="searchValue"
            :class="[isUniFrameWork ? 'left-uniapp-input' : '']"/>  
          <input v-if="isPC && isTransferSearch && joinGroup" type="text" @keyup.enter="handleInput" @confirm="handleInput"
            :placeholder="TUITranslateService.t('component.请输入groupID')" enterkeyhint="search" :value="searchValue"
            :class="[isUniFrameWork ? 'left-uniapp-input' : '']"/>
          <input v-if="!isPC && isTransferSearch && joinGroup" type="text" @blur="handleInput" :value="searchValue"
            :placeholder="TUITranslateService.t('component.请输入groupID')" enterkeyhint="search"
            :class="[isUniFrameWork ? 'left-uniapp-input' : '']"/>  
        </header>
        <main>
          <ul class="transfer-list" v-if="!joinGroup">
            <li class="transfer-list-item" @click="selectedAll" v-if="optional.length > 1 && !isRadio">
              <Icon v-if="transferSelectedList.length === optional.length" :file="selectedIcon" :width="'18px'" :height="'18px'"></Icon>
              <i v-else class="icon-unselected"></i>
              <span class="select-all">{{ TUITranslateService.t('component.全选') }}</span>
            </li>
            <li class="transfer-list-item" v-for="(item, index) in transferList" :key="index" @click="selected(item)">
              <Icon v-if="transferSelectedList.indexOf(item) > -1" :file="selectedIcon"
                :class="[item.isDisabled && 'disabled']" :width="'18px'" :height="'18px'"></Icon>
              <i v-else :class="[item.isDisabled && 'disabled', 'icon-unselected']"></i>
              <template v-if="!isTransferCustomItem">
                <img class="avatar"
                  :src="item.avatar || 'https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'"
                  onerror="this.src='https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'" />
                <span class="name">{{ item.nick || item.userID }}</span>
                <span v-if="item.isDisabled">（{{ TUITranslateService.t('component.已在群中') }}）</span>
              </template>
              <template v-else>
                <slot name="left" :data="item" />
              </template>
            </li>
          </ul>
          <ul class="transfer-list" v-if="joinGroup">
            <li class="transfer-list-item" @click="selectedAll" v-if="optional.length > 1 && !isRadio">
              <Icon v-if="transferSelectedList.length === optional.length" :file="selectedIcon" :width="'18px'" :height="'18px'"></Icon>
              <i v-else class="icon-unselected"></i>
              <span class="select-all">{{ TUITranslateService.t('component.全选') }}</span>
            </li>
            <li class="transfer-list-item" v-for="(item, index) in transferList" :key="index" @click="selected(item)">
              <Icon v-if="transferSelectedList.indexOf(item) > -1" :file="selectedIcon"
                :class="[item.isDisabled && 'disabled']" :width="'18px'" :height="'18px'"></Icon>
              <i v-else :class="[item.isDisabled && 'disabled', 'icon-unselected']"></i>
              <template v-if="!isTransferCustomItem">
                <img class="avatar" :src="item.avatar || 'https://web.sdk.qcloud.com/im/assets/images/Work.svg'"
                  onerror="this.src='https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'" />
                <span class="name">{{ item.groupID }}</span>
                <span v-if="item.isDisabled">（{{ TUITranslateService.t('component.已在群中') }}）</span>
              </template>
              <template v-else>
                <slot name="left" :data="item" />
              </template>
            </li>
          </ul>
        </main>
      </div>
      <div class="right">
        <header v-if="isPC">{{ transferTitle }}</header>
        <ul class="transfer-list" v-if="resultShow && !joinGroup">
          <p v-if="transferSelectedList.length > 0 && isPC">
            {{ TUITranslateService.t('component.已选中') }}{{ transferSelectedList.length }}{{
              TUITranslateService.t('component.人') }}
          </p>
          <li class="transfer-list-item space-between" v-for="(item, index) in transferSelectedList" :key="index">
            <aside>
              <template v-if="!isTransferCustomItem">
                <img class="avatar"
                  :src="item.avatar || 'https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'"
                  onerror="this.src='https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'" />
                <span v-if="isPC">{{ item.nick || item.userID }}</span>
              </template>
              <template v-else>
                <slot name="right" :data="item" />
              </template>
            </aside>
            <span @click="selected(item)" v-if="isPC">
              <Icon :file="cancelIcon" :width="'18px'" :height="'18px'"></Icon>
            </span>
          </li>
        </ul>
        <ul class="transfer-list" v-if="resultShow && joinGroup">
          <p v-if="transferSelectedList.length > 0 && isPC">
            {{ TUITranslateService.t('component.已选中') }}{{ transferSelectedList.length }}
          </p>
          <li class="transfer-list-item space-between" v-for="(item, index) in transferSelectedList" :key="index">
            <aside>
              <template v-if="!isTransferCustomItem">
                <img class="avatar" :src="item.avatar || 'https://web.sdk.qcloud.com/im/assets/images/Work.svg'"
                  onerror="this.src='https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'" />
                <span v-if="isPC">{{ item.groupID }}</span>
              </template>
              <template v-else>
                <slot name="right" :data="item" />
              </template>
            </aside>
            <span @click="selected(item)" v-if="isPC">
              <Icon :file="cancelIcon" :width="'18px'" :height="'18px'"></Icon>
            </span>
          </li>
        </ul>
        <footer>
          <button class="btn btn-cancel" @click="cancel">{{ TUITranslateService.t('component.取消') }}</button>
          <button v-if="transferSelectedList.length > 0" class="btn" @click="submit">{{
            TUITranslateService.t('component.完成') }}</button>
          <button v-else class="btn btn-no" @click="submit">{{ TUITranslateService.t('component.完成') }}</button>
        </footer>
      </div>
    </main>
  </div>
</template>
  
<script lang="ts" setup>
import { ref, watchEffect, computed, defineProps, defineEmits } from "../../../adapter-vue";
import {
  TUIGlobal,
  TUITranslateService,
} from "@tencentcloud/chat-uikit-engine";
import Icon from "../Icon.vue";
import selectedIcon from "../../../assets/icon/selected.svg";
import backIcon from "../../../assets/icon/back.svg";
import cancelIcon from "../../../assets/icon/cancel.svg";

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
  joinGroup: {
    type: Boolean,
    default: false
  }
});

const type = ref('');
const transferList = ref([]);
const transferSelectedList = ref([]);
const isTransferSearch = ref(true);
const isTransferCustomItem = ref(false);
const transferTitle = ref('');
const searchValue = ref('');
const isPC = ref(TUIGlobal.getPlatform() === "pc");
const isUniFrameWork = ref(typeof uni !== 'undefined');
const isWeChat = ref(TUIGlobal.getPlatform() === "wechat");


watchEffect(() => {
  if (props.isCustomItem) {
    for (let index = 0; index < props.list.length; index++) {
      if ((props.list[index] as any).conversationID.indexOf('@TIM#SYSTEM') > -1) {
        props.list.splice(index, 1);
      }
      transferList.value = props.list;
    }
  } else {
    transferList.value = props.list;
  }
  transferSelectedList.value = props.selectedList;
  isTransferSearch.value = props.isSearch;
  isTransferCustomItem.value = props.isCustomItem;
  transferTitle.value = props.title;
  type.value = props.type;
});


const emit = defineEmits(['search', 'submit', 'cancel']);

// 可选项
const optional = computed(() => transferList.value.filter((item: any) => !item.isDisabled));

const handleInput = (e: any) => {
  searchValue.value = e.target.value;
  emit('search', e.target.value);
};
const selected = (item: any) => {
  if (item.isDisabled) {
    return;
  }
  let list: Array<[]> = transferSelectedList.value;
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
  // 针对小程序做的数据清空
  searchValue.value = "";
};

const cancel = () => {
  emit('cancel');
  // 针对小程序做的数据清空
  searchValue.value = "";
};
</script>
  
<style lang="scss" scoped src="./style/transfer.scss"></style>
  