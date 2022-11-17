<template>
  <div class="call" id="call" v-if="handleShowCallIcon(conversation, isH5)">
    <div class="call-icon" @click="toggleShowSelectDialog">
      <i class="icon icon-call" title="通话"></i>
      <i class="icon icon-down-arrow" title="通话"></i>
    </div>
    <div class="call-main" :class="[isH5 && 'call-main-h5']" v-show="showSelectDialog">
      <div class="call-main-content" ref="dialog">
        <div class="call-main-voice" @click="onClickCall(1)">
          <i class="icon icon-call-voice" v-if="isH5"></i>
          {{ $t('TUIChat.语音通话') }}
        </div>
        <div class="call-main-video" @click="onClickCall(2)">
          <i class="icon icon-call-video" v-if="isH5"></i>
          {{ $t('TUIChat.视频通话') }}
        </div>
        <footer>
          <span v-if="isH5" class="close" @click.stop="showSelectDialog = false">{{ $t('TUIChat.取消') }}</span>
        </footer>
      </div>
    </div>
    <Dialog
      :show="showGroupUserDialog"
      :isH5="isH5"
      :isHeaderShow="false"
      :isFooterShow="false"
      :background="false"
      @update:show="(e: boolean) => (showGroupUserDialog = e)"
    >
      <Transfer
        :isSearch="true"
        :title="showTitle"
        :list="searchUserList"
        :isH5="isH5"
        :isRadio="conversation?.type === 'isC2C'"
        @search="handleSearch"
        @submit="submit"
        @cancel="cancle"
      />
    </Dialog>
    <Dialog
      :show="showUnsupportDialog"
      :isH5="isH5"
      :isHeaderShow="true"
      :isFooterShow="true"
      :background="true"
      :title="$t('TUIChat.欢迎使用TUICallKit')"
      @update:show="(e: boolean) => (showUnsupportDialog = e)"
    >
      <div>
        <div class="uncall-dialog-body">
          <p>
            {{ errorContent }}
          </p>
          <p v-show="Object.keys(errorLink).length > 0">
            {{ $t('TUIChat.请点击') }}
            <a @click="openLink(errorLink?.url)">{{ $t(`TUIChat.${errorLink?.label}`) }}</a>
            {{ $t('TUIChat.进行体验') }}
          </p>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, watchEffect, toRefs, ref, watch } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { Conversation } from '../../../TUIConversation/interface';
import Dialog from '../../../../components/dialog';
import Transfer from '../../../../components/transfer';
import TUIAegis from '../../../../../utils/TUIAegis';
import Link from '../../../../../utils/link/index';
import { useStore } from 'vuex';

const Call = defineComponent({
  props: {
    show: {
      type: Boolean,
      default: () => false,
    },
    isMute: {
      type: Boolean,
      default: () => false,
    },
    isH5: {
      type: Boolean,
      default: () => false,
    },
    conversation: {
      type: Object,
      default: () => ({}),
    },
  },
  components: {
    Dialog,
    Transfer,
  },
  setup(props: any, ctx: any) {
    const { t } = Call.TUIServer.TUICore.config.i18n.useI18n();
    const VuexStore = useStore && useStore();
    const data = reactive({
      showSelectDialog: false,
      showCall: false,
      showGroupUserDialog: false,
      isH5: false,
      isMute: false,
      isHomeMenuOpen: false,
      conversation: {} as Conversation,
      showTitle: '',
      searchUserList: [],
      memberList: [],
      mediaType: 0,
      showUnsupportDialog: false,
      errorContent: '',
      errorLink: {},
    });

    const dialog: any = ref();

    watchEffect(() => {
      data.showSelectDialog = props.show;
      data.isMute = props.isMute;
      data.isH5 = props.isH5;
      data.conversation = props.conversation;
    });

    watch(
      () => data.showCall,
      (newVal: boolean, oldVal: boolean) => {
        if (newVal === oldVal) return;
        if (data.showCall) {
          handleCallDialogPosition();
        }
      }
    );

    const toggleShowSelectDialog = () => {
      if (!data.isMute) {
        data.showSelectDialog = true;
      }
    };

    onClickOutside(dialog, () => {
      data.showSelectDialog = false;
    });

    const handleCallDialogPosition = () => {
      data.isHomeMenuOpen = !!document?.getElementsByClassName('home-menu')?.length;
    };

    const onClickCall = (mediaType: number) => {
      data.showSelectDialog = false;
      data.mediaType = mediaType;
      if (!Call?.TUIServer?.TUICore?.TUIServer?.TUICallKit) {
        handleUnsupportDialog();
        TUIAegis.getInstance().reportEvent({
          name: 'callOptions',
          ext1: 'call-uninstall',
        });
        return;
      }
      TUIAegis.getInstance().reportEvent({
        name: 'callOptions',
        ext1: 'clickCall-success',
      });
      VuexStore?.commit('handleTask', 6);
      switch (data.conversation?.type) {
        case Call.TUIServer.TUICore.TIM.TYPES.CONV_C2C:
          handleCall(data.conversation, mediaType);
          TUIAegis.getInstance().reportEvent({
            name: 'callOptions',
            ext1: 'call-c2c',
          });
          break;
        case Call.TUIServer.TUICore.TIM.TYPES.CONV_GROUP:
          handleGroupDialog(mediaType);
          TUIAegis.getInstance().reportEvent({
            name: 'callOptions',
            ext1: 'call-group',
          });
          break;
        default:
          break;
      }
    };

    const handleCall = async (conversation: Conversation, mediaType: number, userIDList: Array<string> = []) => {
      const conversationType = conversation.type;
      switch (conversationType) {
        case Call.TUIServer.TUICore.TIM.TYPES.CONV_C2C:
          try {
            await Call.TUIServer.TUICore.TUIServer.TUICallKit.call({
              userID: conversation?.userProfile?.userID,
              type: mediaType,
            });
          } catch (error) {
            Call?.TUIServer?.TUICore?.TUIServer?.TUICallKit?.afterCalling();
            handleUnsupportDialog(error);
          }
          break;
        case Call.TUIServer.TUICore.TIM.TYPES.CONV_GROUP:
          try {
            await Call.TUIServer.TUICore.TUIServer.TUICallKit.groupCall({
              userIDList,
              groupID: conversation?.groupProfile?.groupID,
              type: mediaType,
            });
          } catch (error) {
            Call?.TUIServer?.TUICore?.TUIServer?.TUICallKit?.afterCalling();
            handleUnsupportDialog(error);
          }
          break;
        default:
          break;
      }
    };

    const handleShowCallIcon = (conversation: Conversation, isH5: boolean) => {
      // 目前暂不支持H5版本 / H5 version is not currently supported
      // if (isH5) return false;
      // 目前暂不支持群通话 / GROUP_CALL is not currently supported
      // if (conversation.type === Call.TUIServer.TUICore.TIM.TYPES.CONV_GROUP) return false;
      if (
        conversation.type === Call.TUIServer.TUICore.TIM.TYPES.CONV_C2C &&
        conversation?.userProfile?.userID ===
          Call?.TUIServer?.TUICore?.TUIServer?.TUIProfile?.currentStore?.profile?.userID
      ) {
        return false;
      }
      TUIAegis.getInstance().reportEvent({
        name: 'callOptions',
        ext1: 'clickCall',
      });
      return true;
    };

    const handleGroupDialog = (mediaType: number) => {
      data.showGroupUserDialog = true;
      data.showTitle = mediaType === 1 ? t('TUIChat.发起群语音') : t('TUIChat.发起群视频');
      const options: any = {
        groupID: data?.conversation?.groupProfile?.groupID,
        count: 100,
        offset: 0,
      };
      Call?.TUIServer?.TUICore?.TUIServer?.TUIGroup?.getGroupMemberList(options)?.then((res: any) => {
        const myUserID: any = data.conversation?.groupProfile?.selfInfo?.userID;
        let memberList = [];
        if (data?.conversation?.groupProfile?.muteAllMembers) {
          memberList = [];
        } else {
          const time: number = new Date().getTime();
          memberList = res.data.memberList.filter((item: any) => {
            if (item?.userID === myUserID) return false;
            if ((item as any)?.muteUntil * 1000 - time > 0) {
              return false;
            }
            return item;
          });
        }
        if (data?.conversation?.groupProfile?.muteAllMembers) {
          memberList = [];
        }
        data.memberList = memberList;
        data.searchUserList = memberList;
      });
    };

    const handleSearch = async (val: any) => {
      const user = data.memberList?.filter((item: any) => item?.userID === val);
      data.searchUserList = user?.length ? user : data.memberList;
    };

    const submit = (userList: any) => {
      data.searchUserList = data.memberList;
      data.showGroupUserDialog = false;
      const userIDList = userList?.map((item: any) => item?.userID);
      handleCall(data.conversation, data.mediaType, userIDList);
    };

    const cancle = () => {
      data.showGroupUserDialog = false;
      data.mediaType = 0;
    };

    const openLink = (url: any) => {
      if (url) {
        window.open(url);
        TUIAegis.getInstance().reportEvent({
          name: 'openLink',
          ext1: 'callkit-doc',
        });
      }
    };

    const handleUnsupportDialog = (error?: any) => {
      if (!error) {
        data.showUnsupportDialog = true;
        data.errorContent = t('TUIChat.检测到您暂未集成TUICallKit，无法体验音视频通话功能');
        data.errorLink = Link.implement;
      } else if (error?.message?.indexOf('The package you purchased does not support this ability.') >= 0) {
        data.showUnsupportDialog = true;
        data.errorContent = t('TUIChat.您当前购买使用的套餐包暂未开通此功能');
        data.errorLink = Link.purchase;
      } else {
        data.errorContent = error?.message || error;
        data.showUnsupportDialog = false;
        data.errorLink = {};
      }
    };

    return {
      ...toRefs(data),
      toggleShowSelectDialog,
      dialog,
      onClickCall,
      handleCallDialogPosition,
      handleCall,
      handleGroupDialog,
      handleSearch,
      submit,
      cancle,
      handleShowCallIcon,
      openLink,
      handleUnsupportDialog,
    };
  },
});
export default Call;
</script>

<style lang="scss" scoped src="./style/index.scss"></style>
