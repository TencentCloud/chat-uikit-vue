<template>
  <ToolbarItemContainer
    ref="container"
    :iconFile="evaluateIcon"
    title="评价"
    :needBottomPopup="true"
    :iconWidth="isUniFrameWork ? '26px' : '20px'"
    :iconHeight="isUniFrameWork ? '26px' : '20px'"
    @onDialogShow="onDialogShow"
    @onDialogClose="onDialogClose"
  >
    <div :class="['evaluate', !isPC && 'evaluate-h5']">
      <div :class="['evaluate-header', !isPC && 'evaluate-h5-header']">
        <div
          :class="[
            'evaluate-header-content',
            !isPC && 'evaluate-h5-header-content',
          ]"
        >
          {{ TUITranslateService.t("Evaluate.请对本次服务进行评价") }}
        </div>
        <div
          v-if="!isPC"
          :class="[
            'evaluate-header-close',
            !isPC && 'evaluate-h5-header-close',
          ]"
          @click.stop="closeDialog"
        >
          {{ TUITranslateService.t("关闭") }}
        </div>
      </div>
      <div :class="['evaluate-content', !isPC && 'evaluate-h5-content']">
        <ul
          :class="[
            'evaluate-content-list',
            !isPC && 'evaluate-h5-content-list',
          ]"
        >
          <li
            v-for="(item, index) in starList"
            :key="index"
            :class="[
              'evaluate-content-list-item',
              !isPC && 'evaluate-h5-content-list-item',
            ]"
            @click.stop="selectStar(index)"
          >
            <Icon
              v-if="index <= currentStarIndex"
              :file="starLightIcon"
              :width="isPC ? '20px' : '30px'"
              :height="isPC ? '20px' : '30px'"
            />
            <Icon
              v-else
              :file="starIcon"
              :width="isPC ? '20px' : '30px'"
              :height="isPC ? '20px' : '30px'"
            />
          </li>
        </ul>
        <textarea
          v-model="comment"
          :class="[
            'evaluate-content-text',
            !isPC && 'evaluate-h5-content-text',
          ]"
        />
        <div
          :class="[
            'evaluate-content-button',
            !isPC && 'evaluate-h5-content-button',
          ]"
        >
          <button
            :class="['btn', isEvaluateValid ? 'btn-valid' : 'btn-invalid']"
            @click="submitEvaluate"
          >
            {{ TUITranslateService.t("Evaluate.提交评价") }}
          </button>
        </div>
      </div>
      <div :class="['evaluate-adv', !isPC && 'evaluate-h5-adv']">
        {{ TUITranslateService.t("Evaluate.服务评价工具") }}
        {{ "(" + TUITranslateService.t("Evaluate.使用") }}
        <a @click="openLink(Link.customMessage)">
          {{ TUITranslateService.t(`Evaluate.${Link.customMessage.label}`) }}
        </a>
        {{ TUITranslateService.t("Evaluate.搭建") + ")" }}
      </div>
    </div>
  </ToolbarItemContainer>
</template>
<script setup lang="ts">
import TUIChatEngine, {
  TUITranslateService,
  TUIStore,
  StoreName,
  IConversationModel,
  TUIChatService,
  SendMessageParams,
  SendMessageOptions,
} from '@tencentcloud/chat-uikit-engine';
import { ref, computed } from '../../../../adapter-vue';
import ToolbarItemContainer from '../toolbar-item-container/index.vue';
import evaluateIconLight from '../../../../assets/icon/evalute-light.svg';
import evaluateIconDark from '../../../../assets/icon/evalute-dark.svg';
import Link from '../../../../utils/documentLink';
import Icon from '../../../common/Icon.vue';
import starIcon from '../../../../assets/icon/star.png';
import starLightIcon from '../../../../assets/icon/star-light.png';
import { CHAT_MSG_CUSTOM_TYPE } from '../../../../constant';
import { isPC, isH5, isUniFrameWork } from '../../../../utils/env';
import { isEnabledMessageReadReceiptGlobal } from '../../utils/utils';
import OfflinePushInfoManager, { IOfflinePushInfoCreateParams } from '../../offlinePushInfoManager/index';
import TUIChatConfig from '../../config';

const evaluateIcon = TUIChatConfig.getTheme() === 'dark' ? evaluateIconDark : evaluateIconLight;
const props = defineProps({
  starTotal: {
    type: Number,
    default: 5,
  },
});
const emits = defineEmits(['onDialogPopupShowOrHide']);

const container = ref();

const starList = ref<number>(props.starTotal);
const currentStarIndex = ref<number>(-1);
const comment = ref('');
const currentConversation = ref<IConversationModel>();

TUIStore.watch(StoreName.CONV, {
  currentConversation: (conversation: IConversationModel) => {
    currentConversation.value = conversation;
  },
});

const isEvaluateValid = computed(() => comment.value.length || currentStarIndex.value >= 0);

const onDialogShow = () => {
  emits('onDialogPopupShowOrHide', true);
};

const onDialogClose = () => {
  resetEvaluate();
  emits('onDialogPopupShowOrHide', false);
};

const openLink = () => {
  if (isPC || isH5) {
    window.open(Link?.customMessage?.url);
  }
};

const closeDialog = () => {
  container?.value?.toggleDialogDisplay(false);
};

const resetEvaluate = () => {
  currentStarIndex.value = -1;
  comment.value = '';
};

const selectStar = (starIndex?: any) => {
  if (currentStarIndex.value === starIndex) {
    currentStarIndex.value = currentStarIndex.value - 1;
  } else {
    currentStarIndex.value = starIndex;
  }
};

const submitEvaluate = () => {
  // The evaluate message must have at least one star or comment to be submitted.
  if (currentStarIndex.value < 0 && !comment.value.length) {
    return;
  }
  const payload = {
    data: JSON.stringify({
      businessID: CHAT_MSG_CUSTOM_TYPE.EVALUATE,
      version: 1,
      score: currentStarIndex.value + 1,
      comment: comment.value,
    }),
    description: '对本次的服务评价',
    extension: '对本次的服务评价',
  };
  const options = {
    to:
      currentConversation?.value?.groupProfile?.groupID
      || currentConversation?.value?.userProfile?.userID,
    conversationType: currentConversation?.value?.type,
    payload,
    needReadReceipt: isEnabledMessageReadReceiptGlobal(),
  };
  const offlinePushInfoCreateParams: IOfflinePushInfoCreateParams = {
    conversation: currentConversation.value,
    payload: options.payload,
    messageType: TUIChatEngine.TYPES.MSG_CUSTOM,
  };
  const sendMessageOptions: SendMessageOptions = {
    offlinePushInfo: OfflinePushInfoManager.create(offlinePushInfoCreateParams),
  };
  TUIChatService.sendCustomMessage(options as SendMessageParams, sendMessageOptions);
  // close dialog after submit evaluate
  container?.value?.toggleDialogDisplay(false);
};
</script>
<style scoped lang="scss" src="./style/index.scss"></style>
