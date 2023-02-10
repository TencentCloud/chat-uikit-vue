<template>
  <div class="TUIChat" :class="[env.isH5 ? 'TUIChat-H5' : '']" v-if="conversationType === 'chat'">
    <header class="TUIChat-header">
      <i class="icon icon-back" @click="back" v-if="env.isH5"></i>
      <TypingHeader
        :needTyping="needTyping"
        :conversation="conversation"
        :messageList="messageList"
        :inputText="text"
        :inputBlur="inputBlur"
        :inputCompositionCont="inputCompositionCont"
      />
      <aside class="setting">
        <Manage v-if="conversation.groupProfile" :conversation="conversation" :userInfo="userInfo" :isH5="env.isH5" />
        <Replies
          :message="currentMessage"
          :conversation="conversation"
          :show="repliesDialogStatus"
          :isH5="env.isH5"
          :messageList="messageList"
          @closeDialog="closeDialog"
          ref="repliesDialog"
        />
      </aside>
    </header>
    <div class="TUIChat-main">
      <div class="TUIChat-safe-tips">
        <span>
          {{ $t('TUIChat.安全提示') }}
        </span>
        <a @click="openLink(Link.complaint)">{{ $t('TUIChat.点此投诉') }}</a>
      </div>
      <ul class="TUI-message-list" @click="dialogID = ''" ref="messageEle" id="messageEle">
        <p class="message-more" @click="getHistoryMessageList" v-if="!isCompleted">
          {{ $t('TUIChat.查看更多') }}
        </p>
        <li v-for="(item, index) in messages" :key="index" :id="item?.ID" ref="messageAimID">
          <MessageTip v-if="isMessageTip(item)" :data="handleTipMessageShowContext(item)" />
          <MessageBubble
            v-else-if="!item.isRevoked"
            :isH5="env.isH5"
            :data="item"
            :messagesList="messages"
            :needGroupReceipt="needGroupReceipt"
            :needReplies="true"
            :needEmojiReact="isNeedEmojiReact"
            @jumpID="jumpID"
            @resendMessage="resendMessage"
            @showReadReceiptDialog="showDialog"
            @showRepliesDialog="showDialog"
            @dropDownOpen="handleDropDownOpen"
          >
            <MessageText v-if="item.type === types.MSG_TEXT" :data="handleTextMessageShowContext(item)" />
            <MessageImage
              v-if="item.type === types.MSG_IMAGE"
              :data="handleImageMessageShowContext(item)"
              :isH5="env.isH5"
              @uploading="handleUploadingImageOrVideo"
              @previewImage="handleImagePreview"
            />
            <MessageVideo
              v-if="item.type === types.MSG_VIDEO"
              :data="handleVideoMessageShowContext(item)"
              :isH5="env.isH5"
              @uploading="handleUploadingImageOrVideo"
            />
            <MessageAudio v-if="item.type === types.MSG_AUDIO" :data="handleAudioMessageShowContext(item)" />
            <MessageFile v-if="item.type === types.MSG_FILE" :data="handleFileMessageShowContext(item)" />
            <MessageFace v-if="item.type === types.MSG_FACE" :data="handleFaceMessageShowContext(item)" />
            <MessageLocation v-if="item.type === types.MSG_LOCATION" :data="handleLocationMessageShowContext(item)" />
            <MessageCustom v-if="item.type === types.MSG_CUSTOM" :data="handleCustomMessageShowContext(item)" />
            <MessageMerger v-if="item.type === types.MSG_MERGER" :data="handleMergerMessageShowContext(item)" />
            <template #dialog>
              <MessageTool
                :message="item"
                :needEmojiReact="isNeedEmojiReact"
                @forwardMessage="forwardMessage"
                @referOrReplyMessage="referOrReplyMessage"
              />
              <MessageEmojiReact v-if="!env?.isH5 && isNeedEmojiReact" :message="item" type="dropdown" />
            </template>
          </MessageBubble>
          <MessageRevoked v-else :isEdit="item.type === types.MSG_TEXT" :data="item" @edit="handleEdit(item)" />
        </li>
        <div class="to-bottom-tip" v-if="needToBottom" @click="scrollToTarget('bottom')">
          <i class="icon icon-bottom-double"></i>
          <div class="to-bottom-tip-cont">
            <span>{{ toBottomTipCont }}</span>
          </div>
        </div>
      </ul>
      <div class="dialog dialog-conversation" v-if="forwardStatus && messageComponents.Forward">
        <component
          :is="'Forward'"
          :list="conversationData.list"
          :message="currentMessage"
          :show="forwardStatus"
          :isH5="env.isH5"
          @update:show="(e: any) => (forwardStatus = e)"
        >
          <template #left="{ data }">
            <img class="avatar" :src="conversationData.handleAvatar(data)" />
            <label class="name">{{ conversationData.handleName(data) }}</label>
          </template>
          <template #right="{ data }">
            <img class="avatar" :src="conversationData.handleAvatar(data)" />
            <label class="name" v-if="!env.isH5">{{ conversationData.handleName(data) }}</label>
          </template>
        </component>
      </div>
      <div class="dialog dialog-conversation">
        <ReadReceiptDialog
          :message="currentMessage"
          :conversation="conversation"
          :show="receiptDialogStatus"
          :isH5="env.isH5"
          @closeDialog="closeDialog"
          ref="readReceiptDialog"
        />
      </div>
      <imagePreviewer
        v-if="showImagePreview"
        :currentImage="currentImagePreview"
        :imageList="imageList"
        @close="showImagePreview = false"
      />
    </div>
    <div class="TUIChat-footer" :class="[isMute && 'disabled', env.isH5 && 'TUIChat-H5-footer']">
      <div class="func" id="func">
        <main class="func-main">
          <component
            v-for="(item, index) in pluginComponentList"
            :key="index"
            :isMute="isMute"
            :is="item"
            :isH5="env.isH5"
            :conversation="conversation"
            parentID="func"
            @send="handleSend"
          ></component>
        </main>
      </div>
      <div class="memberList" v-if="showGroupMemberList">
        <ul class="memberList-box" ref="dialog">
          <header class="memberList-box-title" v-if="env.isH5">
            <h1>选择提醒的人</h1>
            <span class="close" @click="toggleshowGroupMemberList">关闭</span>
          </header>
          <li class="memberList-box-header" @click="selectAt('allMember', allMember)">
            <img src="../../assets/icon/at.svg" alt="" />
            <span>{{ allMember[0].allText }}</span>
            <span>({{ allMemberList.length }})</span>
          </li>
          <li
            class="memberList-box-body"
            v-for="(item, index) in allMemberList"
            :key="index"
            @click="selectAt('oneMember', item)"
          >
            <img :src="item.avatar" alt="" />
            <span>{{ item.nick ? item.nick : item.userID }}</span>
          </li>
        </ul>
      </div>
      <div class="reply" v-if="reference?.show === 'reply'">
        <div class="reply-box">
          <i></i>
          <div class="reply-box-show">
            <span
              >{{ reference.message.nick ? reference.message.nick : reference.message.from }}{{ env.isH5 ? ':' : '' }}
            </span>
            <span>{{ reference.content }}</span>
          </div>
          <label class="icon icon-cancel" @click="closeReferenceInEdit"></label>
        </div>
      </div>
      <div class="input">
        <textarea
          v-show="!isMute"
          ref="inputEle"
          id="input-text-area"
          @paste="pasting"
          v-model="text"
          :placeholder="$t('TUIChat.请输入消息')"
          data-type="text"
          @input="inputChange"
          @keyup.delete="deleteAt"
          @keydown.enter="sendMseeage"
          @keypress="geeks"
          @blur="inputBlur = true"
          @focus="inputBlur = false"
          @compositionstart="inputComposition = true"
          @compositionend="compositionEnd"
          rows="1"
        ></textarea>
        <p v-if="isMute">{{ $t(`TUIChat.${muteText}`) }}</p>
        <button v-if="!isMute" class="input-btn" data-type="text" :disabled="!text" @click="sendMseeage">
          <p class="input-btn-hover">
            {{ $t('TUIChat.按Enter发送，Ctrl+Enter换行') }}
          </p>
          {{ $t('发送') }}
        </button>
        <div class="reference" v-if="reference?.show === 'reference' && !isMute">
          <div class="reference-box">
            <div class="reference-box-show">
              <span class="reference-box-show-name"
                >{{ reference.message.nick ? reference.message.nick : reference.message.from }}:</span
              >
              <span>{{ reference.content }}</span>
            </div>
            <label class="icon icon-cancel" @click="closeReferenceInEdit"></label>
          </div>
        </div>
      </div>
    </div>
    <div v-show="showResend" class="mask" @click="showResend = false">
      <div class="mask-main">
        <header>{{ $t('TUIChat.确认重发该消息？') }}</header>
        <footer>
          <p @click="showResend = false">{{ $t('TUIChat.取消') }}</p>
          <i></i>
          <p @click="submit">{{ $t('TUIChat.确定') }}</p>
        </footer>
      </div>
    </div>
  </div>
  <div class="TUIChat" v-else-if="conversationType === 'system'">
    <header class="TUIChat-header">
      <h1>{{ conversationName }}</h1>
    </header>
    <MessageSystem :data="messages" :types="types" @application="handleApplication" />
  </div>
  <slot v-else-if="slotDefault" />
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  toRefs,
  ref,
  computed,
  nextTick,
  watch,
  useSlots,
  onMounted,
  watchEffect,
} from 'vue';
import {
  MessageText,
  MessageImage,
  MessageVideo,
  MessageAudio,
  MessageFile,
  MessageFace,
  MessageLocation,
  MessageMerger,
  MessageCustom,
  MessageBubble,
  MessageTip,
  MessageRevoked,
  MessageSystem,
  MessageTool,
  MessageEmojiReact,
} from './components';
import { onClickOutside } from '@vueuse/core';
import { Manage } from './manage-components';

import {
  handleAvatar,
  handleName,
  handleTextMessageShowContext,
  handleImageMessageShowContext,
  handleVideoMessageShowContext,
  handleAudioMessageShowContext,
  handleFileMessageShowContext,
  handleFaceMessageShowContext,
  handleLocationMessageShowContext,
  handleMergerMessageShowContext,
  handleTipMessageShowContext,
  handleCustomMessageShowContext,
  getImgLoad,
  isTypingMessage,
  deepCopy,
  isMessageTip,
  JSONToObject,
  handleReferenceForShow,
} from './utils/utils';

import { getComponents } from './index';

import { useStore } from 'vuex';
import TUIAegis from '../../../utils/TUIAegis';
import constant from '../constant';
import { handleErrorPrompts } from '../utils';
import Link from '../../../utils/link';
import { Message } from './interface';
import { Conversation } from '../TUIConversation/interface';

const TUIChat: any = defineComponent({
  name: 'TUIChat',
  components: {
    MessageText,
    MessageImage,
    MessageVideo,
    MessageAudio,
    MessageFile,
    MessageFace,
    MessageLocation,
    MessageMerger,
    MessageCustom,
    MessageBubble,
    MessageTip,
    MessageRevoked,
    MessageSystem,
    Manage,
    MessageTool,
    MessageEmojiReact,
  },
  props: {
    isMsgNeedReadReceipt: {
      type: Boolean,
      default: false,
    },
    isNeedTyping: {
      type: Boolean,
      default: true,
    },
    isNeedEmojiReact: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const { TUIServer } = TUIChat;
    const GroupServer = TUIServer?.TUICore?.TUIServer?.TUIGroup;
    const ProfileServer = TUIServer?.TUICore?.TUIServer?.TUIProfile;
    const VuexStore = useStore && useStore();
    const { t } = (window as any).TUIKitTUICore.config.i18n.useI18n();
    const data = reactive({
      messageList: [] as Message[],
      conversation: {} as Conversation,
      text: '',
      atText: '',
      types: TUIServer.TUICore.TIM.TYPES,
      currentMessage: {} as Message,
      dialogID: '',
      forwardStatus: false,
      receiptDialogStatus: false,
      repliesDialogStatus: false,
      showImagePreview: false,
      currentImagePreview: {} as Message,
      isCompleted: false,
      userInfoView: false,
      userInfo: {
        isGroup: false,
        list: [],
      },
      selfInfo: {},
      messageComponents: getComponents('message'),
      isShow: false,
      muteText: '您已被管理员禁言',
      isFirstSend: true,
      isFirstRender: true,
      showGroupMemberList: false,
      reference: {
        message: {} as Message,
        content: '',
        type: 0, // message type
        show: '', // 'reference' or 'reply'
      },
      historyReference: false,
      referenceID: '',
      allMemberList: [],
      atType: [],
      atAllText: '',
      atOneText: [],
      allMember: [
        {
          allText: '所有人',
          type: TUIServer.TUICore.TIM.TYPES.MSG_AT_ALL,
        },
      ],
      env: TUIServer.TUICore.TUIEnv,
      showResend: false,
      resendMessage: {},
      inputBlur: false,
      inputComposition: false,
      inputCompositionCont: '',
      needTyping: props.isNeedTyping,
      needReadReceipt: false,
      peerNeedReceipt: false,
      needToBottom: false,
      toBottomTipCont: '',
      messageInView: [] as Message[],
      readSet: new Set(),
      isUserAction: false,
      scroll: {
        scrollTop: 0,
        scrollHeight: 0,
        scrollTopMin: Infinity,
        scrollTopMax: 0,
      },
      isMsgNeedReadReceipt: false,
      isNeedEmojiReact: false,
      dropDownRef: null,
    });

    const slotDefault = !!useSlots().default;
    // 调用 TUIConversation 模块的 setMessageRead 方法
    // 消息已读
    // Using the setMessageRead method of the TUIConversion module
    const setMessageRead = async (conversationID: string | undefined) => {
      if (!conversationID) return;
      await TUIServer?.TUICore?.TUIServer?.TUIConversation?.setMessageRead(conversationID);
      return;
    };

    const sendMessageReadReceipt = async (messageList: Message[]) => {
      const needReceiptMessageList = messageList.filter(
        (item: Message) => item?.flow === 'in' && item?.needReadReceipt && !data.readSet.has(item?.ID)
      );
      if (needReceiptMessageList.length) {
        await TUIServer?.sendMessageReadReceipt(needReceiptMessageList).then(() => {
          needReceiptMessageList.forEach((item: Message) => data.readSet.add(item?.ID));
        });
      }
      await setMessageRead(data?.conversation?.conversationID);
    };

    const pluginComponentList: any = [];
    Object.keys(getComponents('send')).forEach((name: any) => {
      pluginComponentList.push(name);
    });

    Manage.TUIServer = TUIServer;
    Manage.GroupServer = TUIServer?.TUICore?.TUIServer?.TUIGroup;

    const messageEle = ref();
    const inputEle: any = ref();
    const messageAimID = ref();
    const readReceiptDialog = ref();

    TUIServer.bind(data);

    const conversationData = {
      list: [],
      handleAvatar,
      handleName,
    };

    const dialog: any = ref();

    onClickOutside(dialog, () => {
      data.showGroupMemberList = false;
    });

    const conversationType = computed(() => {
      const { conversation } = data;
      if (!conversation?.conversationID) {
        return '';
      }
      if (conversation?.type === TUIServer.TUICore.TIM.TYPES.CONV_SYSTEM) {
        return 'system';
      }
      return 'chat';
    });

    const isMute = computed(() => {
      const { conversation } = data;
      if (conversation?.type === TUIServer.TUICore.TIM.TYPES.CONV_GROUP) {
        const userRole = conversation?.groupProfile?.selfInfo.role;
        const isMember = userRole === TUIServer.TUICore.TIM.TYPES.GRP_MBR_ROLE_MEMBER;
        if (isMember && conversation?.groupProfile?.muteAllMembers) {
          // data.muteText = "管理员开启全员禁言";
          return true;
        }
        const time: number = new Date().getTime();
        if ((data.selfInfo as any)?.muteUntil * 1000 - time > 0) {
          // data.muteText = "您已被管理员禁言";
          return true;
        }
      }
      return false;
    });

    watchEffect(() => {
      data.isMsgNeedReadReceipt = props.isMsgNeedReadReceipt;
      data.needReadReceipt = data.isMsgNeedReadReceipt;
      data.needTyping = props.isNeedTyping;
      data.isNeedEmojiReact = props.isNeedEmojiReact;
    });

    watch(
      () => data?.conversation?.conversationID,
      (newVal: () => string | undefined, oldVal: () => string | undefined) => {
        if (newVal === oldVal) return;
        data.scroll.scrollTop = 0;
        data.scroll.scrollHeight = 0;
        data.scroll.scrollTopMin = Infinity;
        data.scroll.scrollTopMax = 0;
        data.text = '';
        data.atText = '';
        data.reference = {
          message: {} as Message,
          content: '',
          type: 0,
          show: '',
        };
      },
      {
        deep: true,
      }
    );

    watch(isMute, (newVal: any, oldVal: any) => {
      const { conversation } = data;
      if (newVal && conversation?.type === TUIServer.TUICore.TIM.TYPES.CONV_GROUP) {
        const userRole = conversation?.groupProfile?.selfInfo.role;
        const isMember = userRole === TUIServer.TUICore.TIM.TYPES.GRP_MBR_ROLE_MEMBER;
        if (isMember && conversation?.groupProfile?.muteAllMembers) {
          data.muteText = '管理员开启全员禁言';
        }
        const time: number = new Date().getTime();
        if ((data.selfInfo as any)?.muteUntil * 1000 - time > 0) {
          data.muteText = '您已被管理员禁言';
        }
      }
    });

    const conversationName = computed(() => {
      const { conversation } = data;
      return handleName(conversation);
    });

    const messages = computed(() => data.messageList.filter((item: any) => !item.isDeleted && !isTypingMessage(item)));
    const imageList = computed(() =>
      messages?.value?.filter((item: Message) => {
        return !item.isRevoked && item.type === data.types.MSG_IMAGE;
      })
    );

    const needGroupReceipt = computed(() => {
      const { conversation, needReadReceipt } = data;
      if (conversation?.type === TUIServer.TUICore.TIM.TYPES.CONV_C2C || needReadReceipt) {
        return true;
      }
      return false;
    });

    watch(
      messages,
      (newVal: Array<Message>, oldVal: Array<Message>) => {
        nextTick(() => {
          const isTheSameMessage = newVal[newVal.length - 1]?.ID === oldVal[oldVal.length - 1]?.ID;
          if (newVal.length === 0 || isTheSameMessage) {
            return;
          }
          handleScroll();
        });
        if (data.currentMessage) {
          const messageID = data.currentMessage?.ID;
          const message = newVal.find((item: any) => item.ID === messageID);
          if (message) {
            data.currentMessage = deepCopy(message);
          }
        }
        if (data.historyReference) {
          for (let index = 0; index < messages.value.length; index++) {
            if (messages?.value[index]?.ID === data?.referenceID) {
              scrollToTarget('target', messageAimID.value[index]);
              messageAimID.value[index].getElementsByClassName('content')[0].classList.add('reference-content');
            }
          }
          data.historyReference = false;
        }
      },
      { deep: true }
    );

    watch(
      () => data.scroll.scrollTop,
      (newVal: number) => {
        setTimeout(() => {
          // scrolling end
          if (newVal === messageEle?.value?.scrollTop) {
            if (data.scroll.scrollTopMin !== Infinity && data.scroll.scrollTopMax !== 0) {
              sendMessageReadInView('scroll');
            }
            data.scroll.scrollTopMin = Infinity;
            data.scroll.scrollTopMax = 0;
          }
        }, 20);
      },
      { deep: true }
    );

    onMounted(() => {
      watch(
        () => messageEle?.value,
        () => {
          if (messageEle?.value) {
            messageEle.value.addEventListener('scroll', onScrolling);
          }
        },
        {
          deep: true,
        }
      );
    });

    const handleSend = (emo: any) => {
      data.text += emo.name;
      if (!data.env.isH5) {
        inputEle.value.focus();
      }
    };

    const sendMseeage = async (event: any) => {
      if (event.keyCode === 13 && event.ctrlKey) return;
      if (data.inputComposition || data.inputCompositionCont) return;
      const text = data.text.trimEnd();
      const cloudCustomData: any = {};
      data.text = '';
      handleTextAreaHeight(data.text, true);
      if (data.needTyping) {
        cloudCustomData.messageFeature = {
          needTyping: 1,
          version: 1,
        };
      }
      if (data?.reference?.show) {
        cloudCustomData.messageReply = {
          messageAbstract: data.reference.content,
          messageSender: data.reference.message.nick || data.reference.message.from,
          messageID: data.reference.message.ID,
          messageType: data.reference.type,
          version: 1,
        };
        if (data.reference?.show === 'reply') {
          try {
            cloudCustomData.messageReply.messageRootID = data?.reference.message?.ID;
            if (data?.reference.message?.cloudCustomData) {
              const replyMessageCloudCustomData = JSONToObject(data?.reference.message?.cloudCustomData as any);
              cloudCustomData.messageReply.messageRootID =
                replyMessageCloudCustomData?.messageReply?.messageRootID || data?.reference.message?.ID;
            }
          } catch (error) {
            console.warn(error);
          }
        }
        try {
          const res = await TUIServer.sendTextMessage(JSON.parse(JSON.stringify(text)), cloudCustomData);
          if (data.reference?.show === 'reply') {
            await TUIServer.replyMessage(res?.data?.message);
          }
        } catch (error: any) {
          handleErrorPrompts(error, data.env);
        }
      }
      if (text && data.atType.length === 0 && !data.reference?.show) {
        try {
          if (data.needTyping) {
            await TUIServer.sendTextMessage(JSON.parse(JSON.stringify(text)), cloudCustomData);
          } else {
            await TUIServer.sendTextMessage(JSON.parse(JSON.stringify(text)));
          }
          data.reference.show = '';
          TUIAegis.getInstance().reportEvent({
            name: 'messageType',
            ext1: 'typeText',
          });
        } catch (error: any) {
          handleErrorPrompts(error, data.env);
        }
      }
      if (data.atType.length > 0) {
        const options: any = {
          to: data?.conversation?.groupProfile?.groupID,
          conversationType: TUIServer.TUICore.TIM.TYPES.CONV_GROUP,
          payload: {
            text,
            atUserList: data.atType,
          },
        };
        try {
          await TUIServer.sendTextAtMessage({
            text: options.payload.text,
            atUserList: options.payload.atUserList,
          });
          data.showGroupMemberList = false;
        } catch (error) {
          console.log(error);
        }
      }
      if (data.isFirstSend) {
        TUIAegis.getInstance().reportEvent({
          name: 'sendMessage',
          ext1: 'sendMessage-success',
        });
        data.isFirstSend = false;
      }
      data.reference.show = '';
      TUIServer.TUICore.isOfficial && VuexStore?.commit('handleTask', 0);
      return (data.atType = []);
    };

    const handleItem = (item: any) => {
      data.currentMessage = item;
      data.dialogID = item.ID;
    };

    const resendMessage = (message: Message) => {
      if (data.env.isH5) {
        data.showResend = true;
        data.resendMessage = message;
      } else {
        TUIServer.resendMessage(message).catch((error: any) => {
          handleErrorPrompts(error, data.env);
        });
        TUIAegis.getInstance().reportEvent({
          name: 'messageOptions',
          ext1: 'messageResend',
        });
      }
    };

    const forwardMessage = (message: Message) => {
      data.currentMessage = message;
      conversationData.list = TUIServer.TUICore.getStore().TUIConversation.conversationList;
      data.forwardStatus = true;
    };

    const referOrReplyMessage = (message: Message, type: any) => {
      let replyObj = handleReferenceForShow(message);
      data.reference = {
        message,
        content: replyObj?.referenceMessageForShow,
        type: replyObj?.referenceMessageType,
        show: type,
      };
    };

    const submit = () => {
      TUIServer.resendMessage(data.resendMessage)
        .then(() => {
          data.showResend = false;
        })
        .catch((error: any) => {
          handleErrorPrompts(error, data.env);
          data.showResend = false;
        });
      TUIAegis.getInstance().reportEvent({
        name: 'messageOptions',
        ext1: 'messageResend',
      });
    };

    const handleEdit = (item: any) => {
      data.text = item.payload.text;
    };

    const handleApplication = (options: any) => {
      TUIServer.handleGroupApplication(options);
    };

    const geeks = (e: any) => {
      if (e.keyCode === 13) {
        e.preventDefault();
        if (e.ctrlKey) {
          e.target.value += '\n';
          data.text += '\n';
          handleTextAreaHeight(data.text);
        }
      }
    };

    const inputChange = (e: any) => {
      if (data.inputComposition) {
        data.inputCompositionCont = e?.data ? e.data : '';
      }
      if (e.data === constant.at && data?.conversation?.type === constant.group) {
        const options: any = {
          groupID: data?.conversation?.groupProfile?.groupID,
          count: 100,
          offset: 0,
        };
        data.showGroupMemberList = true;
        GroupServer.getGroupMemberList(options).then((res: any) => {
          res.data.memberList = res.data.memberList.filter(
            (item: any) => item.userID !== ProfileServer.currentStore.profile.userID
          );
          data.allMemberList = res.data.memberList;
        });
      }
      // 输入@和空格，默认值不是@人
      // input @ and Space，Default is not @ person
      if (e.data === ' ' && data.text.indexOf(constant.at) !== -1) {
        data.showGroupMemberList = false;
      }
      handleTextAreaHeight(data.text);
    };

    const pasting = (e: any) => {
      if (e.clipboardData.files[0]) {
        TUIServer.sendImageMessage(e.clipboardData.files[0]);
      }
    };

    const getHistoryMessageList = async () => {
      await TUIServer.getHistoryMessageList().then(() => {
        scrollToTarget('target', messageEle?.value?.firstElementChild);
      });
    };

    const selectAt = async (type: string, item: any) => {
      let atName = '';
      switch (type) {
        case 'allMember':
          data.atText = constant.all;
          data.text = `${data.text}${constant.all}`;
          inputEle.value.focus();
          data.showGroupMemberList = false;
          (data.atType as any).push(TUIServer.TUICore.TIM.TYPES.MSG_AT_ALL);
          (data.atOneText as any).push({ name: constant.all, userID: TUIServer.TUICore.TIM.TYPES.MSG_AT_ALL });
          break;
        case 'oneMember':
          atName = item.nameCard || item.nick || item.userID;
          data.text += `${item.nameCard || item.nick || item.userID}`;
          // 为后续删除的@成员创建存储数组。
          // Create a stored array for subsequent deleted @ members.
          (data.atOneText as any).push({ name: atName, userID: item.userID });
          inputEle.value.focus();
          data.showGroupMemberList = false;
          (data.atType as any).push(item.userID);
          break;
      }
    };

    const deleteAt = (e: any) => {
      const array = data.atOneText;
      for (let index = 0; index < array.length; index++) {
        // 判断输入框中是否有@+尼克/名片/用户名字符串。
        // Judge whether there is a string of @ + Nick / namecard / userid in the input box.
        const flagName = `${constant.at}${(array[index] as any).name}`;
        if (data.text.indexOf(flagName) === -1) {
          const { userID } = array[index] as any;
          data.atType.splice((data.atType as any).indexOf(userID), 1);
          data.atOneText = [];
        }
      }
      return data.atType;
    };

    const jumpID = (messageID: string) => {
      data.referenceID = messageID;
      const list: any = [];
      // If the referenced message is in the current messageList, you can jump directly. Otherwise, you need to pull the historical message
      for (let index = 0; index < messages.value.length; index++) {
        list.push(messages?.value[index]?.ID);
        if (list.indexOf(messageID) !== -1 && messages.value[index]?.ID === messageID) {
          scrollToTarget('target', messageAimID.value[index]);
          messageAimID.value[index].getElementsByClassName('content')[0].classList.remove('reference-content');
          nextTick(() => {
            messageAimID.value[index].getElementsByClassName('content')[0].classList.add('reference-content');
          });
        }
      }
      if (list.indexOf(messageID) === -1) {
        TUIServer.getHistoryMessageList().then(() => {
          data.historyReference = true;
        });
      }
    };

    const toggleshowGroupMemberList = () => {
      data.showGroupMemberList = !data.showGroupMemberList;
    };

    const back = () => {
      TUIServer.TUICore.TUIServer.TUIConversation.handleCurrentConversation();
    };

    const openLink = (type: any) => {
      window.open(type.url);
      TUIAegis.getInstance().reportEvent({
        name: 'openLink',
        ext1: type.label,
      });
    };

    const compositionEnd = () => {
      data.inputComposition = false;
      data.inputCompositionCont = '';
    };

    const showDialog = async (message: Message, type: string) => {
      if (!message?.ID || !type) return;
      switch (type) {
        case 'receipt':
          if (
            message.conversationType !== TUIServer.TUICore.TIM.TYPES.CONV_GROUP ||
            message.readReceiptInfo?.unreadCount === 0
          ) {
            return;
          }
          data.currentMessage = message;
          data.receiptDialogStatus = true;
          break;
        case 'replies':
          data.currentMessage = message;
          data.repliesDialogStatus = true;
          break;
        default:
          break;
      }
    };
    const closeDialog = async (type: string) => {
      if (!type) return;
      switch (type) {
        case 'receipt':
          data.currentMessage = {};
          data.receiptDialogStatus = false;
          break;
        case 'replies':
          data.currentMessage = {};
          data.repliesDialogStatus = false;
          break;
        default:
          break;
      }
    };

    const handleScroll = () => {
      if (data.isFirstRender) {
        data.needToBottom = false;
        scrollToTarget('bottom');
        data.isFirstRender = false;
        return;
      }
      if (messageEle.value) {
        const { scrollHeight, scrollTop, clientHeight } = messageEle.value;
        if (
          scrollHeight - (scrollTop + clientHeight) <= clientHeight ||
          messages.value[messages.value.length - 1]?.flow === 'out'
        ) {
          scrollToTarget('bottom');
        } else {
          handleToBottomTip(true);
        }
      }
    };

    const scrollToTarget = (type: string, targetElement?: HTMLElement) => {
      messageEle.value.removeEventListener('scroll', onScrolling);
      data.isUserAction = true;
      switch (type) {
        case constant.scrollType.toBottom:
          data.needToBottom = false;
          nextTick(() => {
            messageEle?.value?.lastElementChild?.scrollIntoView(false);
            getImgLoad(messageEle?.value, 'message-img', async () => {
              messageEle?.value?.lastElementChild?.scrollIntoView(false);
              messageEle.value.addEventListener('scroll', onScrolling);
              await sendMessageReadInView('page');
            });
          });
          break;
        case constant.scrollType.toTarget:
          nextTick(() => {
            targetElement?.scrollIntoView(false);
            getImgLoad(messageEle?.value, 'message-img', async () => {
              targetElement?.scrollIntoView(false);
              messageEle.value.addEventListener('scroll', onScrolling);
              await sendMessageReadInView('page');
            });
          });

          break;
        default:
          break;
      }
    };

    const onScrolling = () => {
      const { scrollHeight, scrollTop, clientHeight } = messageEle.value;
      if (needGroupReceipt.value) {
        data.scroll.scrollHeight = scrollHeight;
        data.scroll.scrollTop = scrollTop;
        data.scroll.scrollTopMin = data.isUserAction
          ? data.scroll.scrollTopMin
          : Math.min(data.scroll.scrollTopMin, data.scroll.scrollTop);
        data.scroll.scrollTopMax = data.isUserAction
          ? data.scroll.scrollTopMax
          : Math.max(data.scroll.scrollTopMax, data.scroll.scrollTop);
      }
      if (scrollHeight - (scrollTop + clientHeight) > clientHeight) {
        handleToBottomTip(true);
      } else {
        handleToBottomTip(false);
      }
      data.isUserAction = false;
    };

    const handleToBottomTip = (needToBottom: boolean) => {
      switch (needToBottom) {
        case true:
          data.needToBottom = true;
          if (data?.conversation?.unreadCount && data?.conversation?.unreadCount > 0) {
            data.toBottomTipCont = `${data?.conversation?.unreadCount} ${t('TUIChat.条新消息')}`;
          } else {
            data.toBottomTipCont = t('TUIChat.回到最新位置');
          }
          break;
        case false:
          data.needToBottom = false;
          break;
        default:
          data.needToBottom = false;
          break;
      }
    };

    const sendMessageReadInView = async (type: string) => {
      if (!needGroupReceipt.value) {
        setMessageRead(data?.conversation?.conversationID);
        return;
      }
      if (data.messageInView.length) data.messageInView = [] as Message[];
      let start = 0;
      let end = 0;
      switch (type) {
        case constant.inViewType.page:
          start = data.scroll.scrollTop;
          end = data.scroll.scrollTop + messageEle?.value?.clientHeight;
          break;
        case constant.inViewType.scroll:
          start = data.scroll.scrollTopMin;
          end = data.scroll.scrollTopMax + messageEle?.value?.clientHeight;
          break;
        default:
          break;
      }
      for (let i = 0; i < messageAimID?.value?.length; i++) {
        if (isInView(type, messageAimID?.value[i], start, end)) {
          const message = messages.value[i];
          data.messageInView.push(message);
        }
      }
      await sendMessageReadReceipt(data.messageInView);
    };

    const isInView = (type: string, dom: HTMLElement, viewStart: number, viewEnd: number) => {
      const containerTop = messageEle.value.getBoundingClientRect().top;
      const containerBottom = messageEle.value.getBoundingClientRect().bottom;
      const { top, bottom } = dom.getBoundingClientRect();
      const { offsetTop, clientHeight } = dom;
      switch (type) {
        case constant.inViewType.page:
          return Math.round(top) >= Math.round(containerTop) && Math.round(bottom) <= Math.round(containerBottom);
        case constant.inViewType.scroll:
          return (
            Math.round(offsetTop) >= Math.round(viewStart) &&
            Math.round(offsetTop + clientHeight) <= Math.round(viewEnd)
          );
        default:
          return false;
      }
    };

    const handleDropDownOpen = (value: any) => {
      if (data.dropDownRef) {
        (data.dropDownRef as any).removeChild((data.dropDownRef as any).children[0]);
      }
      data.dropDownRef = value;
    };

    const closeReferenceInEdit = () => {
      data.reference.show = '';
    };

    const handleTextAreaHeight = (content: string, reset = false) => {
      let maxHeight = 0;
      const textArea = inputEle.value;
      if (reset) {
        textArea.style.height = '';
        return;
      }
      textArea.style.height = 'auto';
      maxHeight = Math.max(
        data?.env?.isH5 ? content.split(/\r*\n/)?.length * 18 + 14 : content.split(/\r*\n/)?.length * 20 + 4,
        textArea?.scrollHeight
      );
      textArea.style.height = `${Math.min(maxHeight, data?.env?.isH5 ? 86 : 80)}px`;
      textArea.scrollTop = textArea.scrollHeight;
    };

    const handleUploadingImageOrVideo = () => {
      scrollToTarget('bottom');
    };
    const handleImagePreview = (message: any) => {
      data.showImagePreview = !data.showImagePreview;
      data.currentImagePreview = message;
    };

    return {
      ...toRefs(data),
      conversationType,
      messages,
      messageEle,
      inputEle,
      messageAimID,
      conversationData,
      conversationName,
      constant,
      sendMseeage,
      deleteAt,
      handleItem,
      handleEdit,
      getHistoryMessageList,
      handleApplication,
      handleTextMessageShowContext,
      handleImageMessageShowContext,
      handleVideoMessageShowContext,
      handleAudioMessageShowContext,
      handleFileMessageShowContext,
      handleFaceMessageShowContext,
      handleLocationMessageShowContext,
      handleMergerMessageShowContext,
      handleTipMessageShowContext,
      handleCustomMessageShowContext,
      pluginComponentList,
      handleSend,
      closeDialog,
      isMute,
      geeks,
      pasting,
      setMessageRead,
      sendMessageReadReceipt,
      selectAt,
      inputChange,
      dialog,
      jumpID,
      back,
      slotDefault,
      toggleshowGroupMemberList,
      resendMessage,
      submit,
      Link,
      openLink,
      compositionEnd,
      readReceiptDialog,
      scrollToTarget,
      needGroupReceipt,
      handleDropDownOpen,
      isMessageTip,
      showDialog,
      closeReferenceInEdit,
      forwardMessage,
      referOrReplyMessage,
      handleUploadingImageOrVideo,
      handleImagePreview,
      imageList,
    };
  },
});
export default TUIChat;
</script>

<style lang="scss" scoped src="./style/index.scss"></style>
