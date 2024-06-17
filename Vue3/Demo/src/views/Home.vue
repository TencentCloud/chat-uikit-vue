<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div
    :id="isPC ? 'preloadedImages' : ''"
    :class="['home', isH5 && 'home-h5']"
  >
    <div
      v-show="isMenuShow"
      class="home-menu"
    >
      <Menu @closeMenu="toggleMenu(false)" />
    </div>
    <div :class="['home-container', isMenuShow && 'menu-expand']">
      <div
        v-if="isPC"
        class="home-header"
      >
        <Header
          :class="[isMenuShow && 'header-menu-show']"
          showType="menu"
          :defaultLanguage="locale"
          @toggleMenu="toggleMenu(!isMenuShow)"
          @changeLanguage="changeLanguage"
        />
      </div>
      <div class="home-main">
        <div class="home-TUIKit">
          <div
            v-if="isPC || !currentConversationID"
            class="home-TUIKit-navbar"
          >
            <NavBar
              v-model:currentNavBar="currentNavBar"
              v-model:isSettingShow="isSettingShow"
            >
              <template #profile>
                <Profile display-type="profile" />
              </template>
              <template #setting>
                <Profile
                  v-model:showSetting="isSettingShow"
                  display-type="setting"
                />
              </template>
            </NavBar>
          </div>
          <div
            v-if="isPC"
            class="home-TUIKit-main"
          >
            <div
              v-show="currentNavBar === 'message'"
              class="home-TUIKit-main"
            >
              <div class="home-conversation">
                <TUISearch searchType="global" />
                <TUIConversation />
              </div>
              <div class="home-chat">
                <TUIChat>
                  <ChatDefaultContent />
                </TUIChat>
                <TUIGroup class="chat-aside" />
                <TUISearch
                  class="chat-aside"
                  searchType="conversation"
                />
              </div>
              <TUIContact display-type="selectFriend" />
            </div>
            <div
              v-show="currentNavBar === 'relation'"
              class="home-TUIKit-main"
            >
              <TUIContact
                display-type="contactList"
                @switchConversation="currentNavBar = 'message'"
              />
            </div>
          </div>
          <div
            v-else-if="isH5"
            class="home-TUIKit-main"
          >
            <div
              v-if="!currentConversationID"
              class="home-TUIKit-main"
            >
              <div
                v-show="currentNavBar === 'message'"
                class="home-TUIKit-main"
              >
                <TUISearch searchType="global" />
                <TUIConversation />
                <TUIContact display-type="selectFriend" />
              </div>
              <div
                v-show="currentNavBar === 'relation'"
                class="home-TUIKit-main"
              >
                <TUIContact
                  display-type="contactList"
                  @switchConversation="currentNavBar = 'message'"
                />
              </div>
              <div
                v-show="currentNavBar === 'profile'"
                class="home-TUIKit-main"
              >
                <Profile display-type="all" />
              </div>
            </div>
            <TUIChat v-else />
            <TUIGroup class="chat-popup" />
            <TUISearch
              class="chat-popup"
              searchType="conversation"
            />
          </div>
          <Drag
            ref="dragRef"
            :show="isCalling"
            domClassName="callkit-drag-container"
          >
            <TUICallKit
              :class="[
                'callkit-drag-container',
                `callkit-drag-container-${isMinimized ? 'mini' : isH5 ? 'h5' : 'pc'}`
              ]"
              :allowedMinimized="true"
              :allowedFullScreen="false"
              :beforeCalling="beforeCalling"
              :afterCalling="afterCalling"
              :onMinimized="onMinimized"
            />
          </Drag>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from '../TUIKit/adapter-vue';
import { TUIStore, StoreName } from '@tencentcloud/chat-uikit-engine';
import { TUICallKit } from '@tencentcloud/call-uikit-vue';
import { TUIChat, TUIConversation, TUIContact, TUIGroup, TUISearch } from '../TUIKit';
import Header from '../components/Header.vue';
import Menu from '../components/Menu.vue';
import NavBar from '../components/NavBar.vue';
import Profile from './Profile.vue';
import ChatDefaultContent from '../components/ChatDefaultContent.vue';
import Drag from '../TUIKit/components/common/Drag';
import { isPC, isH5 } from '../TUIKit/utils/env';
import { enableSampleTaskStatus } from '../TUIKit/utils/enableSampleTaskStatus';

const props = withDefaults(
  defineProps<{
    language: string;
  }>(),
  {
    language: 'zh',
  },
);
const emits = defineEmits(['changeLanguage']);

const locale = ref<string>(props.language);
const isMenuShow = ref<boolean>(true);
const currentNavBar = ref<string>('message');
const currentConversationID = ref<string>('');
const isCalling = ref<boolean>(false);
const isMinimized = ref<boolean>(false);
const dragRef = ref<typeof Drag>();
const isSettingShow = ref<boolean>(false);

function changeLanguage(language: string) {
  emits('changeLanguage', language);
}

TUIStore.watch(StoreName.CONV, {
  currentConversationID: (id: string) => {
    currentConversationID.value = id;
  },
});
function toggleMenu(value: boolean) {
  isMenuShow.value = value;
}

function beforeCalling() {
  isCalling.value = true;
  isMinimized.value = false;
  enableSampleTaskStatus('call');
}

function afterCalling() {
  isCalling.value = false;
  isMinimized.value = false;
}

function onMinimized(oldMinimizedStatus: boolean, newMinimizedStatus: boolean) {
  isMinimized.value = newMinimizedStatus;
  dragRef?.value?.positionReset();
}
</script>

<style lang="scss">
@import "../styles/home";
</style>
