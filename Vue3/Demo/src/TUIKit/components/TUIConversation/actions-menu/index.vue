<template>
  <Overlay
    :bgColor="'transparent'"
    @clickHandler="() => emits('closeConversationActionMenu')"
    @touchHandler="() => emits('closeConversationActionMenu')"
  >
    <div
      id="conversation-actions-menu"
      ref="actionsMenuDomRef"
      :class="[
        isPC && 'isPC',
        'actionsMenu',
        !isHiddenActionsMenu && 'cancelHidden',
      ]"
      :style="{ top: `${_actionsMenuPosition.top}px` }"
    >
      <div
        :class="['actionsMenuItem']"
        @click.stop="deleteConversation()"
      >
        {{ TUITranslateService.t("TUIConversation.删除会话") }}
      </div>
      <div
        v-if="!props.selectedConversation.isPinned"
        :class="['actionsMenuItem']"
        @click.stop="handleItem({ name: CONV_OPERATION.ISPINNED })"
      >
        {{ TUITranslateService.t("TUIConversation.置顶会话") }}
      </div>
      <div
        :class="['actionsMenuItem']"
        v-if="props.selectedConversation.isPinned"
        @click.stop="handleItem({ name: CONV_OPERATION.DISPINNED })"
      >
        {{ TUITranslateService.t("TUIConversation.取消置顶") }}
      </div>
      <div
        :class="['actionsMenuItem']"
        v-if="!props.selectedConversation.isMuted"
        @click.stop="handleItem({ name: CONV_OPERATION.MUTE })"
      >
        {{ TUITranslateService.t("TUIConversation.消息免打扰") }}
      </div>
      <div
        :class="['actionsMenuItem']"
        v-if="props.selectedConversation.isMuted"
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
        {{TUITranslateService.t(deleteConversationDialogTitle)}}
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
  getCurrentInstance
} from "../../../adapter-vue";
import TUIChatEngine, {
  TUIStore,
  TUITranslateService,
} from "@tencentcloud/chat-uikit-engine";
import { CONV_OPERATION } from "../../../constant";
import { isPC, isUniFrameWork } from "../../../utils/env";
import { TUIGlobal } from "../../../utils/universal-api/index";
import Overlay from "../../common/Overlay/index.vue";
import Dialog from "../../common/Dialog/index.vue";
const emits = defineEmits(["closeConversationActionMenu"]);
const props = defineProps([
  "actionsMenuPosition",
  "selectedConversation",
  "selectedConversationDomRect",
]);

const thisInstance = getCurrentInstance()?.proxy || getCurrentInstance();
const actionsMenuDomRef = ref<HTMLElement | null>();
const isHiddenActionsMenu = ref(true);
const isShowDeleteConversationDialog  = ref<boolean>(false);
const currentConversation = TUIStore.getConversationModel(
  props.selectedConversation?.conversationID
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
  return props.selectedConversation?.type === TUIChatEngine.TYPES.CONV_C2C ? "TUIConversation.删除后，将清空该聊天的消息记录"
  : props.selectedConversation?.type === TUIChatEngine.TYPES.CONV_GROUP ? "TUIConversation.删除后，将清空该群聊的消息记录" : ''
})
function checkExceedBounds() {
  // 组件初始渲染时，执行并自检边界有没有超出屏幕，在nextTick中处理。
  nextTick(() => {
    if (isUniFrameWork) {
      // 处理UniFrameWork菜单低于屏幕的情况
      const query = uni.createSelectorQuery().in(thisInstance);
      query
        .select(`#conversation-actions-menu`)
        .boundingClientRect((data) => {
          if (data) {
            if (data.bottom > TUIGlobal?.getWindowInfo?.().windowHeight) {
              _actionsMenuPosition.value = {
                ...props.actionsMenuPosition,
                top:
                  props.actionsMenuPosition.top -
                  props.actionsMenuPosition.conversationHeight -
                  data.height,
              };
            }
          }
          isHiddenActionsMenu.value = false;
        })
        .exec();
    } else {
      // 处理原生Vue菜单低于屏幕的情况
      const rect = actionsMenuDomRef.value?.getBoundingClientRect();
      // PC端根据鼠标点击的位置设置actionsMenu的位置，否则使用默认值167px
      if (isPC && typeof props.actionsMenuPosition.left !== 'undefined') {
        actionsMenuDomRef.value?.style.setProperty("left", `${props.actionsMenuPosition.left}px`);
      }
      if (rect && rect.bottom > window.innerHeight) {
        _actionsMenuPosition.value.top =
          props.actionsMenuPosition.top -
          props.actionsMenuPosition.conversationHeight -
          rect.height;
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
  emits("closeConversationActionMenu");
};

const deleteConversation = () => {
  isShowDeleteConversationDialog.value = true;
};

const updateShowDeleteConversationDialog = (isShow: boolean) => {
  if (!isShow) {
    emits("closeConversationActionMenu");
  }
  isShowDeleteConversationDialog.value = isShow;
};
</script>

<style scoped lang="scss">
.overlay {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0);
  z-index: 9999;
}

.cancelHidden {
  opacity: 1 !important;
}

.actionsMenu {
  position: absolute;
  left: 164px;
  cursor: pointer;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 -4px 12px 0 rgba(0, 0, 0, 0.06);
  background-color: #fff;
  overflow: hidden;
  opacity: 0;

  .actionsMenuItem {
    padding: 7px 20px;
    font-size: 12px;
  }

  &.isPC .actionsMenuItem:hover {
    background-color: #eee;
  }
}
</style>
