<template>
  <div :class="['home', isH5 && 'home-h5']" :id="isPC ? 'preloadedImages' : ''">
    <div v-show="isMenuShow" class="home-menu">
      <Menu @closeMenu="toggleMenu(false)"></Menu>
    </div>
    <div :class="['home-container', isMenuShow && 'menu-expand']">
      <div v-if="isPC" class="home-header">
        <Header
          :class="[isMenuShow && 'header-menu-show']"
          showType="menu"
          :defaultLanguage="locale"
          @toggleMenu="toggleMenu(!isMenuShow)"
          @changeLanguage="changeLanguage"
        ></Header>
      </div>
      <div class="home-main">
        <div class="home-TUIKit">
          <div v-if="isPC || !currentConversationID" class="home-TUIKit-navbar">
            <NavBar
              :currentNavBar="currentNavBar"
              :isSettingShow="isSettingShow"
              @toggleSettingShow="toggleSettingShow"
              @switchNavBar="switchNavBar"
            >
              <template v-slot:profile>
                <Profile display-type="profile"></Profile>
              </template>
              <template v-slot:setting>
                <Profile
                  display-type="setting"
                  :showSetting="isSettingShow"
                  @toggleSettingShow="toggleSettingShow"
                ></Profile>
              </template>
            </NavBar>
          </div>
          <div v-if="isPC" class="home-TUIKit-main">
            <div v-show="currentNavBar === 'message'" class="home-TUIKit-main">
              <div class="home-conversation">
                <TUISearch searchType="global"></TUISearch>
                <TUIConversation></TUIConversation>
              </div>
              <div class="home-chat">
                <TUIChat>
                  <ChatDefaultContent></ChatDefaultContent>
                </TUIChat>
                <TUIGroup class="chat-aside" />
                <TUISearch class="chat-aside" searchType="conversation" />
              </div>
              <TUIContact display-type="selectFriend" />
            </div>
            <div v-show="currentNavBar === 'relation'" class="home-TUIKit-main">
              <TUIContact
                display-type="contactList"
                @switchConversation="currentNavBar = 'message'"
              />
            </div>
          </div>
          <div v-else-if="isH5" class="home-TUIKit-main">
            <div class="home-TUIKit-main" v-if="!currentConversationID">
              <div v-show="currentNavBar === 'message'" class="home-TUIKit-main">
                <TUISearch searchType="global"></TUISearch>
                <TUIConversation></TUIConversation>
                <TUIContact display-type="selectFriend"></TUIContact>
              </div>
              <div v-show="currentNavBar === 'relation'" class="home-TUIKit-main">
                <TUIContact
                  display-type="contactList"
                  @switchConversation="currentNavBar = 'message'"
                />
              </div>
              <div v-show="currentNavBar === 'profile'" class="home-TUIKit-main">
                <Profile display-type="all" />
              </div>
            </div>
            <TUIChat v-else></TUIChat>
            <TUIGroup class="chat-popup" />
            <TUISearch class="chat-popup" searchType="conversation" />
          </div>
          <Drag :show="isCalling" domClassName="callkit-drag-container" ref="dragRef">
            <TUICallKit
              :class="[
                'callkit-drag-container',
                `callkit-drag-container-${isMinimized ? 'mini' : isH5 ? 'h5' : 'pc'}`,
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
import { ref, withDefaults, defineProps, defineEmits } from "../TUIKit/adapter-vue";
import { TUIStore, StoreName } from "@tencentcloud/chat-uikit-engine";
import { TUICallKit } from "@tencentcloud/call-uikit-vue2";
import { TUIChat, TUIConversation, TUIContact, TUIGroup, TUISearch } from "../TUIKit";
import Header from "../components/Header.vue";
import Menu from "../components/Menu.vue";
import NavBar from "../components/NavBar.vue";
import Profile from "./Profile.vue";
import ChatDefaultContent from "../components/ChatDefaultContent.vue";
import Drag from "../TUIKit/components/common/Drag";
import { isPC, isH5 } from "../TUIKit/utils/env";
import { enableSampleTaskStatus } from "../TUIKit/utils/enableSampleTaskStatus";
const props = withDefaults(
  defineProps<{
    language: string;
  }>(),
  {
    language: "zh",
  }
);
const emits = defineEmits(["changeLanguage"]);
const locale = ref<string>(props.language);
const isMenuShow = ref<boolean>(true);
const currentNavBar = ref<string>("message");
const currentConversationID = ref<string>("");
const isCalling = ref<boolean>(false);
const isMinimized = ref<boolean>(false);
const dragRef = ref<typeof Drag>();
const isSettingShow = ref<boolean>(false);
// changeLanguage: 语言切换
function changeLanguage(language: string) {
  emits("changeLanguage", language);
}
TUIStore.watch(StoreName.CONV, {
  currentConversationID: (id: string) => {
    currentConversationID.value = id;
  },
});
function toggleMenu(value: boolean) {
  isMenuShow.value = value;
}
// beforeCalling: 通话前执行
function beforeCalling() {
  isCalling.value = true;
  enableSampleTaskStatus("call");
}
// afterCalling: 通话后执行
function afterCalling() {
  isCalling.value = false;
  isMinimized.value = false;
}
// onMinimized：音视频通话组件切换最小化状态时执行
function onMinimized(oldMinimizedStatus: boolean, newMinimizedStatus: boolean) {
  isMinimized.value = newMinimizedStatus;
  dragRef?.value?.positionReset();
}
function toggleSettingShow(value: boolean) {
  isSettingShow.value = value;
}
function switchNavBar(value: string) {
  currentNavBar.value = value;
}
</script>

<style lang="scss">
@import "../styles/home.scss";
</style>
