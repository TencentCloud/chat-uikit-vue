<template>
  <div class="memeber-profile">
    <div class="memeber-profile-main">
      <img
        class="avatar"
        :src="userInfo?.avatar || 'https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'"
        onerror="this.src='https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'"
      />
      <ul class="list">
        <h1>{{ userInfo?.nick || userInfo?.userID }}</h1>
        <li>
          <label>ID：</label>
          <span>{{ userInfo?.userID }}</span>
        </li>
        <li>
          <label>{{ $t('TUIContact.个性签名') }}：</label>
          <span>{{ userInfo?.selfSignature }}</span>
        </li>
      </ul>
    </div>
    <div class="memeber-profile-footer">
      <div class="button" @click="enter(userInfo?.userID, 'C2C')" v-if="showEnter()">
        {{ $t('TUIContact.发送消息') }}
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import TIM from '../../../../TUICore/tim';
import { reactive, toRefs, watch, watchEffect, defineComponent } from 'vue';
import manage from './manage.vue';

const memberProfile = defineComponent({
  props: {
    userInfo: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props: any, ctx: any) {
    const TUIServer = manage?.TUIServer;
    const data = reactive({
      isFriendShip: false,
      userInfo: {},
      self: {},
    });
    watchEffect(() => {
      data.self = props.self;
    });
    watch(
      () => props.userInfo,
      async (newVal: any, oldVal: any) => {
        if (newVal === oldVal) return;
        const res = await TUIServer.getUserProfile([props?.userInfo?.userID]);
        data.userInfo = res?.data[0];
        checkFriend();
      },
      {
        deep: true,
        immediate: true,
      }
    );
    const enter = async (ID: any, type: string) => {
      const name = `${type}${ID}`;
      TUIServer.TUICore.TUIServer.TUIConversation.getConversationProfile(name).then((imResponse: any) => {
        // 通知 TUIConversation 添加当前会话
        // Notify TUIConversation to toggle the current conversation
        TUIServer.TUICore.TUIServer.TUIConversation.handleCurrentConversation(imResponse.data.conversation);
      });
    };
    const checkFriend = async () => {
      if (!(data.userInfo as any).userID) return;
      const relation = await TUIServer.checkFriend((data.userInfo as any).userID, TIM.TYPES.SNS_CHECK_TYPE_BOTH);
      data.isFriendShip = relation === TIM.TYPES.SNS_TYPE_BOTH_WAY ? true : false;
    };

    const showEnter = () => {
      return data.isFriendShip || !TUIServer?.TUICore?.isOfficial;
    };
    return {
      ...toRefs(data),
      enter,
      showEnter,
    };
  },
});
export default memberProfile;
</script>
<style lang="scss" scoped>
.memeber-profile {
  flex: 1;
  display: flex;
  flex-direction: column;
  &-main {
    display: flex;
    flex-direction: row;
    width: 100%;
    overflow: hidden;
    img {
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
        color: #999999;
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
    border-top: 10px solid #f4f5f9;
    padding: 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .button {
      width: 100px;
      font-size: 14px;
      cursor: pointer;
      background-color: #006eff;
      color: #ffffff;
      padding: 8px 20px;
      border-radius: 4px;
      border: none;
      font-size: 14px;
      text-align: center;
      line-height: 20px;
    }
  }
}
</style>
