<template>
  <Overlay
    :maskColor="'transparent'"
    @onOverlayClick="() => emits('closeConversationActionMenu')"
  >
    <div
      id="conversation-actions-menu"
      ref="actionsMenuDomRef"
      :class="[
        isPC && 'actions-menu-pc',
        'actions-menu',
        !isHiddenActionsMenu && 'cancel-hidden',
      ]"
      :style="{
        top: `${_actionsMenuPosition.top}px`,
        left: `${_actionsMenuPosition.left}px`,
      }"
    >
      <div
        :class="['actions-menu-item']"
        @click.stop="deleteConversation()"
      >
        {{ TUITranslateService.t("TUIConversation.删除会话") }}
      </div>
      <div
        v-if="!(props.selectedConversation && props.selectedConversation.isPinned)"
        :class="['actions-menu-item']"
        @click.stop="handleItem({ name: CONV_OPERATION.ISPINNED })"
      >
        {{ TUITranslateService.t("TUIConversation.置顶会话") }}
      </div>
      <div
        v-if="props.selectedConversation && props.selectedConversation.isPinned"
        :class="['actions-menu-item']"
        @click.stop="handleItem({ name: CONV_OPERATION.DISPINNED })"
      >
        {{ TUITranslateService.t("TUIConversation.取消置顶") }}
      </div>
      <div
        v-if="!(props.selectedConversation && props.selectedConversation.isMuted)"
        :class="['actions-menu-item']"
        @click.stop="handleItem({ name: CONV_OPERATION.MUTE })"
      >
        {{ TUITranslateService.t("TUIConversation.消息免打扰") }}
      </div>
      <div
        v-if="props.selectedConversation && props.selectedConversation.isMuted"
        :class="['actions-menu-item']"
        @click.stop="handleItem({ name: CONV_OPERATION.NOTMUTE })"
      >
        {{ TUITranslateService.t("TUIConversation.取消免打扰") }}
      </div>
    </div>
    <Dialog
      :show="isShowDeleteConversationDialog"
      :center="true"
      :isHeaderShow="isPC"
      @submit="handleItem({ name: CONV_OPERATION.DELETE })"
      @update:show="updateShowDeleteConversationDialog"
    >
      <p class="delDialog-title">
        {{ TUITranslateService.t(deleteConversationDialogTitle) }}
      </p>
    </Dialog>
  </Overlay>
</template>

<script setup lang="ts">
import {
  ref,
  nextTick,
  onMounted,
  computed,
  getCurrentInstance,
} from '../../../adapter-vue';
import TUIChatEngine, {
  IConversationModel,
  TUIStore,
  TUITranslateService,
} from '@tencentcloud/chat-uikit-engine';
import { TUIGlobal } from '@tencentcloud/universal-api';
import { CONV_OPERATION } from '../../../constant';
import { isPC, isUniFrameWork } from '../../../utils/env';
import Overlay from '../../common/Overlay/index.vue';
import Dialog from '../../common/Dialog/index.vue';

interface IProps {
  actionsMenuPosition: {
    top: number;
    left?: number;
    conversationHeight?: number;
  };
  selectedConversation: IConversationModel | undefined;
  selectedConversationDomRect: DOMRect | undefined;
}

const emits = defineEmits(['closeConversationActionMenu']);
const props = defineProps<IProps>();

const thisInstance = getCurrentInstance()?.proxy || getCurrentInstance();
const actionsMenuDomRef = ref<HTMLElement | null>();
const isHiddenActionsMenu = ref(true);
const isShowDeleteConversationDialog = ref<boolean>(false);
const currentConversation = TUIStore.getConversationModel(
  props.selectedConversation?.conversationID || '',
);
const _actionsMenuPosition = ref<{
  top: number;
  left?: number;
  conversationHeight?: number;
}>(props.actionsMenuPosition);

onMounted(() => {
  checkExceedBounds();
});

const deleteConversationDialogTitle = computed(() => {
  return props.selectedConversation?.type === TUIChatEngine.TYPES.CONV_C2C
    ? 'TUIConversation.删除后，将清空该聊天的消息记录'
    : props.selectedConversation?.type === TUIChatEngine.TYPES.CONV_GROUP ? 'TUIConversation.删除后，将清空该群聊的消息记录' : '';
});
function checkExceedBounds() {
  // When the component is initially rendered, it executes and self-checks whether the boundary exceeds the screen, and handles it in nextTick.
  nextTick(() => {
    if (isUniFrameWork) {
      // check exceed bounds
      const query = TUIGlobal?.createSelectorQuery().in(thisInstance);
      query
        .select(`#conversation-actions-menu`)
        .boundingClientRect((data) => {
          if (data) {
            // check if actionsMenu is exceed bottom of the screen
            if (data.bottom > TUIGlobal?.getWindowInfo?.().windowHeight) {
              _actionsMenuPosition.value = {
                ...props.actionsMenuPosition,
                top:
                  props.actionsMenuPosition.top
                  - (props.actionsMenuPosition.conversationHeight || 0)
                  - data.height,
              };
            }
            // check if actionsMenu is exceed right of the screen
            if (_actionsMenuPosition.value.left + data.width + 5 > TUIGlobal.getWindowInfo().windowWidth) {
              _actionsMenuPosition.value.left = TUIGlobal.getWindowInfo().windowWidth - data.width - 5;
            }
          }
          isHiddenActionsMenu.value = false;
        })
        .exec();
    } else {
      // Handling the situation where the native Vue menu is lower than the screen
      const rect = actionsMenuDomRef.value?.getBoundingClientRect();
      // The PC side sets the position of actionsMenu according to the position of the mouse click, otherwise the default value of 167px is used
      if (isPC && typeof props.actionsMenuPosition.left !== 'undefined') {
        _actionsMenuPosition.value.left = props.actionsMenuPosition.left;
      }
      if (rect && rect.bottom > window.innerHeight) {
        _actionsMenuPosition.value.top
          = props.actionsMenuPosition.top
          - (props.actionsMenuPosition.conversationHeight || 0)
          - rect.height;
      }
      isHiddenActionsMenu.value = false;
    }
  });
}

const handleItem = (params: { name: string }) => {
  const { name } = params;
  const conversationModel = currentConversation;
  if (!name || !conversationModel || !conversationModel.conversationID) {
    return;
  }
  switch (name) {
    case CONV_OPERATION.DELETE:
      conversationModel?.deleteConversation();
      break;
    case CONV_OPERATION.ISPINNED:
      conversationModel?.pinConversation();
      break;
    case CONV_OPERATION.DISPINNED:
      conversationModel?.pinConversation();
      break;
    case CONV_OPERATION.MUTE:
      conversationModel?.muteConversation();
      break;
    case CONV_OPERATION.NOTMUTE:
      conversationModel?.muteConversation();
      break;
  }
  emits('closeConversationActionMenu');
};

const deleteConversation = () => {
  isShowDeleteConversationDialog.value = true;
};

const updateShowDeleteConversationDialog = (isShow: boolean) => {
  if (!isShow) {
    emits('closeConversationActionMenu');
  }
  isShowDeleteConversationDialog.value = isShow;
};
</script>

<style scoped lang="scss">
.cancel-hidden {
  opacity: 1 !important;
}

.actions-menu {
  position: absolute;
  left: 164px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 -4px 12px 0 rgba(0, 0, 0, 0.06);
  background-color: #fff;
  overflow: hidden;
  opacity: 0;

  .actions-menu-item {
    cursor: pointer;
    padding: 10px 20px;
    font-size: 12px;
    word-break: keep-all;
  }

  &.actions-menu-pc .actions-menu-item:hover {
    background-color: #eee;
  }
}
</style>
