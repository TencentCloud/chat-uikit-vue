<template>
  <main v-if="!isUniFrameWork" class="admin">
    <div class="admin-list">
      <label class="admin-label">{{ TUITranslateService.t(`TUIGroup.群管理员`) }}</label>
      <ol class="ol">
        <dl class="dl" v-for="(item, index) in memberAdmin.admin" :key="index">
          <dt class="dt">
            <img class="avatar" :src="item.avatar ||
              'https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'
              " onerror="this.src='https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'" />
          </dt>
          <dd class="dd">{{ item.nick || item.userID }}</dd>
        </dl>
        <dl class="dl">
          <dt class="avatar dt" @click="addAdmin">+</dt>
        </dl>
        <dl class="dl">
          <dt class="avatar dt" v-if="memberAdmin.admin.length > 0" @click="removeAdmin">
            -
          </dt>
        </dl>
      </ol>
    </div>
    <div class="admin-content space-top" v-if="isAdminSetMuteTime">
      <aside>
        <label class="admin-label">{{ TUITranslateService.t(`TUIGroup.全员禁言`) }}</label>
        <p>
          {{
            TUITranslateService.t(
              `TUIGroup.全员禁言开启后，只允许群主和管理员发言。`
            )
          }}
        </p>
      </aside>
      <Slider :open="currentGroupAdmin.muteAllMembers" @change="setAllMuteTime" />
    </div>
    <div class="admin-list last" v-if="isAdminSetMuteTime">
      <label>{{ TUITranslateService.t(`TUIGroup.单独禁言人员`) }}</label>
      <ol class="ol">
        <dl class="dl" v-for="(item, index) in memberAdmin.muteMember" :key="index">
          <dt class="dt">
            <img class="avatar" :src="item.avatar ||
              'https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'
              " onerror="this.src='https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'" />
          </dt>
          <dd class="dd">{{ item.nick || item.userID }}</dd>
        </dl>
        <dl class="dl">
          <dt class="avatar dt" @click="addMute">+</dt>
        </dl>
        <dl class="dl">
          <dt class="avatar dt" v-if="memberAdmin.muteMember.length > 0" @click="removeMute">
            -
          </dt>
        </dl>
      </ol>
    </div>
  </main>
  <div v-else class="edit-h5">
    <main>
      <header class="edit-h5-header">
        <aside class="left">
          <h1>{{ TUITranslateService.t(`TUIGroup.群管理`) }}</h1>
        </aside>
        <span class="close" @click="toggleEdit('admin')">{{
          TUITranslateService.t(`关闭`)
        }}</span>
      </header>
      <div class="admin">
        <div class="admin-list">
          <label class="admin-label">{{ TUITranslateService.t(`TUIGroup.群管理员`) }}</label>
          <ol class="ol">
            <dl class="dl" v-for="(item, index) in memberAdmin.admin" :key="index">
              <dt class="dt">
                <img class="avatar" :src="item.avatar ||
                  'https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'
                  " onerror="this.src='https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'" />
              </dt>
              <dd class="dd">{{ item.nick || item.userID }}</dd>
            </dl>
            <dl class="dl">
              <dt class="avatar dt" @click="addAdmin">+</dt>
            </dl>
            <dl class="dl">
              <dt class="avatar dt" v-if="memberAdmin.admin.length > 0" @click="removeAdmin">
                -
              </dt>
            </dl>
          </ol>
        </div>
        <div class="admin-content space-top" v-if="isAdminSetMuteTime">
          <aside>
            <label class="admin-label">{{ TUITranslateService.t(`TUIGroup.全员禁言`) }}</label>
            <p>
              {{
                TUITranslateService.t(
                  `TUIGroup.全员禁言开启后，只允许群主和管理员发言。`
                )
              }}
            </p>
          </aside>
          <Slider :open="currentGroupAdmin.muteAllMembers" @change="setAllMuteTime" />
        </div>
        <div class="admin-list last" v-if="isAdminSetMuteTime">
          <label>{{ TUITranslateService.t(`TUIGroup.单独禁言人员`) }}</label>
          <ol class="ol">
            <dl class="dl" v-for="(item, index) in memberAdmin.muteMember" :key="index">
              <dt class="dt">
                <img class="avatar" :src="item.avatar ||
                  'https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'
                  " onerror="this.src='https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'" />
              </dt>
              <dd class="dd">{{ item.nick || item.userID }}</dd>
            </dl>
            <dl class="dl">
              <dt class="avatar dt" @click="addMute">+</dt>
            </dl>
            <dl class="dl">
              <dt class="avatar dt" v-if="memberAdmin.muteMember.length > 0" @click="removeMute">
                -
              </dt>
            </dl>
          </ol>
        </div>
      </div>
    </main>
  </div>
</template>
  
<script lang="ts" setup>
import { TUITranslateService, TUIGlobal } from "@tencentcloud/chat-uikit-engine";
import {
  watchEffect,
  ref,
  defineProps,
  defineEmits,
} from "../../../adapter-vue";
import Slider from "../../common/Slider/index.vue";

const props = defineProps({
  member: {
    type: Object,
    default: () => { },
  },
  isSetMuteTime: {
    type: Boolean,
    default: () => false,
  },
  currentGroup: {
    type: Object,
    default: () => { },
  },
});

const isAdminSetMuteTime = ref(false);
const memberAdmin = ref({});
const currentGroupAdmin = ref({});
const isUniFrameWork = ref(typeof uni !== 'undefined');

watchEffect(() => {
  memberAdmin.value = props.member;
  isAdminSetMuteTime.value = props.isSetMuteTime;
  currentGroupAdmin.value = props.currentGroup;
});

const emits = defineEmits([
  "addAdmin",
  "removeAdmin",
  "setAllMuteTime",
  "addMute",
  "removeMute",
  "toggleEdit"
]);

const addAdmin = () => {
  emits("addAdmin");
};

const removeAdmin = () => {
  emits("removeAdmin");
};

const setAllMuteTime = (value: boolean) => {
  emits("setAllMuteTime", value);
};

const addMute = () => {
  emits("addMute");
};

const removeMute = () => {
  emits("removeMute");
};

const toggleEdit = async (tabName: string) => {
  emits("toggleEdit", tabName);
};
</script>
  
<style lang="scss" scoped >
@import url("../../../assets/styles/common.scss");

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #F4F5F9;
  color: #000000;
}

.admin {
  padding: 20px 0;

  &-content {
    padding: 20px 20px 12px;
    display: flex;
    align-items: center;

    .aside {
      flex: 1;
      font-size: 14px;

      .p {
        font-size: 12px;
      }
    }
  }

  &-list {
    padding: 0 20px;

    .label {
      display: inline-block;
      font-size: 14px;
      padding-bottom: 8px;
    }
  }

  .last {
    padding-top: 13px;
    position: relative;

    &::before {
      position: absolute;
      content: "";
      width: calc(100% - 40px);
      height: 1px;
      top: 0;
      left: 0;
      right: 0;
      margin: 0 auto;
    }
  }
}

.admin {
  &-content {
    aside {
      font-weight: 400;
      color: #000000;
      letter-spacing: 0;

      p {
        opacity: 0.6;
      }
    }
  }

  &-list {
    label {
      font-weight: 400;
      color: #000000;
    }
  }

  .last {
    &::before {
      background: #E8E8E9;
    }
  }
}

.ol {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  padding-bottom: 20px;

  .dl {
    position: relative;
    flex: 0 0 36px;
    display: flex;
    flex-direction: column;
    padding-right: 20px;

    &:last-child {
      padding-right: 0;
    }

    .more {
      padding-top: 10px;
    }

    .dd {
      text-align: center;
      max-width: 36px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

  }
}

.content {
  padding: 0 20px;

  .li {
    padding: 14px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;

    .btn {
      flex: 1;
    }

    .article {
      opacity: 0.6;
      width: 246px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .end {
      align-self: flex-end;
      margin-bottom: 4px;
    }
  }
}

.footer {
  padding: 0 20px;

  .li {
    cursor: pointer;
    width: 100%;
    font-size: 14px;
    padding: 14px 0;
    text-align: center;

    &:last-child {
      border: none;
    }
  }
}

.edit-h5 {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1;

  main {
    background: #ffffff;
    flex: 1;
    padding: 18px;
    border-radius: 12px 12px 0 0;
    width: 80vw;
  }

  .edit-h5-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .close {
      font-family: PingFangSC-Regular;
      font-weight: 400;
      font-size: 18px;
      color: #3370ff;
      letter-spacing: 0;
      line-height: 27px;
    }
  }

  &-footer {
    display: flex;

    .btn {
      flex: 1;
      border: none;
      background: #147aff;
      border-radius: 5px;
      font-family: PingFangSC-Regular;
      font-weight: 400;
      font-size: 16px;
      color: #ffffff;
      letter-spacing: 0;
      line-height: 27px;
      padding: 8px 0;

      &:disabled {
        opacity: 0.3;
      }
    }
  }
}
</style>
  