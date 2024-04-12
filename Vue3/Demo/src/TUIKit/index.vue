<template>
  <div>
    <slot>
      <div :class="['TUIKit', isH5 && 'TUIKit-h5']">
        <div
          v-if="!(isH5 && currentConversationID)"
          class="TUIKit-navbar"
        >
          <div
            v-for="item of navbarList"
            :key="item.id"
            :class="['TUIKit-navbar-item', currentNavbar === item.id && 'TUIKit-navbar-item-active']"
            @click="currentNavbar = item.id"
          >
            {{ item.label }}
          </div>
        </div>
        <div class="TUIKit-main-container">
          <div
            v-if="currentNavbar === 'conversation'"
            class="TUIKit-main"
          >
            <div
              v-if="!(isH5 && currentConversationID)"
              class="TUIKit-main-aside"
            >
              <TUISearch searchType="global" />
              <TUIConversation />
            </div>
            <div
              v-if="!isH5 || currentConversationID"
              class="TUIKit-main-main"
            >
              <TUIChat>
                <h1>欢迎使用腾讯云即时通信IM</h1>
              </TUIChat>
              <TUIGroup :class="isH5 ? 'chat-popup' : 'chat-aside'" />
              <TUISearch
                :class="isH5 ? 'chat-popup' : 'chat-aside'"
                searchType="conversation"
              />
            </div>
            <TUIGroup
              v-if="isH5 && !currentConversationID"
              class="chat-popup"
            />
            <TUIContact displayType="selectFriend" />
          </div>
          <div
            v-else-if="currentNavbar === 'contact'"
            class="TUIKit-main"
          >
            <TUIContact
              displayType="contactList"
              @switchConversation="currentNavbar = 'conversation'"
            />
          </div>
        </div>
      </div>
    </slot>
  </div>
</template>
<script lang="ts"  setup>
import { ref, onMounted, framework } from './adapter-vue';
import { TUILogin } from '@tencentcloud/tui-core';
import { TUIStore, StoreName, TUIConversationService } from '@tencentcloud/chat-uikit-engine';
import { TUISearch, TUIConversation, TUIChat, TUIContact, TUIGroup } from './components';
import { isH5 } from './utils/env';

const currentConversationID = ref<string>('');
const currentNavbar = ref<string>('conversation');
const navbarList = [
  {
    id: 'conversation',
    label: '会话',
  },
  {
    id: 'contact',
    label: '通讯录',
  },
];

const props = defineProps({
  // 部署生产环境时不需要通过 props 传入 SDKAppID、userID、userSig
  // eslint-disable-next-line vue/prop-name-casing
  SDKAppID: {
    type: Number,
    default: 0,
    required: false,
  },
  userID: {
    type: String,
    default: '',
    required: false,
  },
  userSig: {
    type: String,
    default: '',
    required: false,
  },
  conversationID: {
    type: String,
    default: '',
    required: false, // 独立集成 Chat 时需要传 conversationID
  },
});

onMounted(() => {
  // 监听当前会话 ID
  TUIStore.watch(StoreName.CONV, {
    currentConversationID: (id: string) => {
      currentConversationID.value = id;
    },
  });

  // 默认登录逻辑
  login();

  // H5 环境下修改 CallKit 样式
  modifyCallKitStyle();
});

function login() {
  const { SDKAppID, userID, userSig, conversationID } = props;
  if (SDKAppID && userID && userSig) {
    TUILogin.login({
      SDKAppID,
      userID,
      userSig,
      useUploadPlugin: true,
      framework,
    }).then(() => {
      // 独立集成 Chat 时执行以下代码
      if (conversationID.startsWith('C2C') || conversationID.startsWith('GROUP')) {
        TUIConversationService.switchConversation(conversationID);
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    }).catch((error) => {});
  }
}

function modifyCallKitStyle() {
  if (isH5) {
    const bodyStyle = document.getElementsByTagName('body')[0].style;
    bodyStyle.setProperty('--callLeft', '0');
    bodyStyle.setProperty('--callTop', '0');
    bodyStyle.setProperty('--callWidth', '100%');
    bodyStyle.setProperty('--callHeight', '100%');
  }
}
</script>
<style scoped lang="scss">
  @import "./assets/styles/common";
  @import "./assets/styles/sample";
</style>
<style lang="scss">
  /* stylelint-disable-next-line */
  $left: var(--callLeft, calc(50% - 25rem));
  /* stylelint-disable-next-line */
  $top: var(--callTop, calc(50% - 18rem));
  /* stylelint-disable-next-line */
  $width: var(--callWidth, 50rem);
  /* stylelint-disable-next-line */
  $height: var(--callHeight, 36rem);

  .callkit-container {
    position: fixed !important;
    left: $left !important;
    top: $top !important;
    width: $width !important;
    height: $height !important;
  }
</style>
