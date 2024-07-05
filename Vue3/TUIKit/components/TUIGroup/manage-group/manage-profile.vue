<template>
  <div
    v-if="!isUniFrameWork"
    class="memeber-profile"
  >
    <div class="memeber-profile-main">
      <img
        class="avatar"
        :src="
          userInfoManager.avatar ||
            'https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'
        "
        onerror="this.onerror=null;this.src='https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'"
      >
      <ul class="list">
        <h2>{{ userInfoManager.nick || userInfoManager.userID }}</h2>
        <li>
          <label>ID：</label>
          <span>{{ userInfoManager.userID }}</span>
        </li>
        <li>
          <label>{{ TUITranslateService.t("TUIContact.个性签名") }}：</label>
          <span>{{ userInfoManager.selfSignature }}</span>
        </li>
      </ul>
    </div>
    <div class="memeber-profile-footer">
      <div
        v-if="showEnter()"
        class="button"
        @click="enter(userInfoManager.userID, 'C2C')"
      >
        {{ TUITranslateService.t("TUIContact.发送消息") }}
      </div>
    </div>
  </div>
  <div
    v-else
    class="edit-h5"
  >
    <main class="main">
      <header class="edit-h5-header">
        <aside class="left">
          <h1>{{ TUITranslateService.t(`TUIGroup.群成员`) }}</h1>
        </aside>
        <span
          class="close"
          @click="close('profile')"
        >{{
          TUITranslateService.t(`关闭`)
        }}</span>
      </header>
      <div class="edit-h5-profile">
        <div class="memeber-profile-main">
          <Avatar
            class="avatar"
            :url="userInfoManager.avatar"
            size="60px"
          />
          <ul class="list">
            <h1>{{ userInfoManager.nick || userInfoManager.userID }}</h1>
            <li>
              <label>ID：</label>
              <span>{{ userInfoManager.userID }}</span>
            </li>
            <li>
              <label>{{ TUITranslateService.t("TUIContact.个性签名") }}：</label>
              <span>{{ userInfoManager.selfSignature }}</span>
            </li>
          </ul>
        </div>
        <div class="memeber-profile-footer">
          <div
            v-if="showEnter()"
            class="button"
            @click="enter(userInfoManager.userID, 'C2C')"
          >
            {{ TUITranslateService.t("TUIContact.发送消息") }}
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
<script lang="ts" setup>
import { ref, watch, watchEffect } from '../../../adapter-vue';
import TUIChatEngine, {
  TUITranslateService,
  TUIUserService,
  TUIConversationService,
  TUIFriendService,
  TUIStore,
  StoreName,
} from '@tencentcloud/chat-uikit-engine';
import { TUIGlobal } from '@tencentcloud/universal-api';
import Avatar from '../../common/Avatar/index.vue';
import { IUserProfile } from '../../../interface';
import { isUniFrameWork } from '../../../utils/env';

const props = defineProps({
  userInfo: {
    type: Object,
    default: () => ({}),
  },
});

const isFriendShip = ref(false);
const userInfoManager = ref<IUserProfile>({});

watchEffect(() => {
  userInfoManager.value = props.userInfo;
});
const emits = defineEmits([
  'handleSwitchConversation',
  'close',
  'openConversation',
]);

watch(
  () => props.userInfo,
  async (newVal: any, oldVal: any) => {
    if (newVal === oldVal) return;
    const res = await TUIUserService.getUserProfile({
      userIDList: [props.userInfo.userID],
    });
    userInfoManager.value = res?.data[0];
    checkFriend();
  },
  {
    deep: true,
    immediate: true,
  },
);

const enter = async (ID: any, type: string) => {
  const name = `${type}${ID}`;
  TUIConversationService.getConversationProfile(name)
    .then((res: any) => {
      TUIConversationService.switchConversation(res.data.conversation.conversationID).then(() => {
        TUIStore.update(StoreName.GRP, 'isShowManageComponent', false);
        if (isUniFrameWork) {
          TUIGlobal?.navigateBack();
        }
      });
    })
    .catch((err: any) => {
      console.warn('获取会话资料失败', err.code, err.msg);
    });
};
const checkFriend = async () => {
  if (!(userInfoManager.value as any).userID) return;
  TUIFriendService.checkFriend({
    userIDList: [userInfoManager.value.userID],
    type: TUIChatEngine.TYPES.SNS_CHECK_TYPE_BOTH,
  }).then((res: any) => {
    const relation = res?.data?.successUserIDList?.[0]?.relation;
    isFriendShip.value = (relation === TUIChatEngine.TYPES.SNS_TYPE_BOTH_WAY);
  });
};

const showEnter = () => {
  return isFriendShip.value || !TUIStore.getData(StoreName.APP, 'isOfficial');
};

const close = (tabName: string) => {
  emits('close', tabName);
};
</script>
<style lang="scss" scoped>
@import "../../../assets/styles/common";

.memeber-profile {
  flex: 1;
  display: flex;
  flex-direction: column;

  &-main {
    display: flex;
    flex-direction: row;
    width: 100%;
    overflow: hidden;

    .avatar {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      margin: 20px 10px 20px 20px;
    }

    .list {
      flex: 1;
      overflow: hidden;
      margin: 20px 10px;
      font-weight: 400;

      li {
        color: #999;
      }

      h1,
      li {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }

  &-footer {
    border-top: 1px solid #f4f5f9;
    padding: 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .button {
      width: 100px;
      cursor: pointer;
      background-color: #006eff;
      color: #fff;
      padding: 8px 20px;
      border-radius: 4px;
      border: none;
      font-size: 14px;
      text-align: center;
      line-height: 20px;
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

  .main {
    background: #fff;
    flex: 1;
    padding: 18px;
    border-radius: 12px 12px 0 0;
    width: 80vw;

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

    .edit-h5-profile {
      .memeber-profile-main {
        .avatar {
          margin: 20px;
        }

      }
    }
  }
}
</style>
