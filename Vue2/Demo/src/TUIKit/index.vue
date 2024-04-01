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
import { ref, onMounted } from './adapter-vue';
import { TUIStore, StoreName } from '@tencentcloud/chat-uikit-engine';
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

onMounted(() => {
  // 监听当前会话 ID
  TUIStore.watch(StoreName.CONV, {
    currentConversationID: (id: string) => {
      currentConversationID.value = id;
    },
  });

  // H5 环境下修改 CallKit 样式
  modifyCallKitStyle();
});

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
