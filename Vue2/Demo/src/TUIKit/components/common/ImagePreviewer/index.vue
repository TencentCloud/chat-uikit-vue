<template>
  <div class="image-previewer" :class="[isMobile && 'image-previewer-h5']">
    <div
      class="image-wrapper"
      ref="image"
      @touchstart.stop="handleTouchStart"
      @touchmove.stop="handleTouchMove"
      @touchend.stop="handleTouchEnd"
      @touchcancel.stop="handleTouchCancel"
      @wheel.stop="handleWheel"
    >
      <ul
        class="image-list"
        :style="{
          width: `${imageList.length * 100}%`,
          transform: `translateX(-${
            (currentImageIndex * 100) / imageList.length
          }%)`,
          transition: '0.5s',
        }"
        ref="ulRef"
      >
        <li class="image-item" v-for="(item, index) in imageList" :key="index">
          <ImageItem
            :zoom="zoom"
            :rotate="rotate"
            :src="getImageUrl(item)"
            :messageItem="item"
            :class="[isUniFrameWork ? 'image-item' : '']"
          ></ImageItem>
        </li>
      </ul>
    </div>
    <div class="icon icon-close" @click="close" v-show="isPC">
      <Icon :file="iconClose" width="16px" height="16px"></Icon>
    </div>
    <div
      class="image-button image-button-left"
      v-if="isPC && currentImageIndex > 0"
      @click="goPrev"
    >
      <Icon :file="iconArrowLeft"></Icon>
    </div>
    <div
      class="image-button image-button-right"
      v-if="isPC && currentImageIndex < imageList.length - 1"
      @click="goNext"
    >
      <Icon :file="iconArrowLeft"></Icon>
    </div>
    <div :class="['actions-bar', isMobile && 'actions-bar-h5']">
      <div v-if="isPC" class="icon-zoom-in" @click="zoomIn">
        <Icon :file="iconZoomIn" width="27px" height="27px"></Icon>
      </div>
      <div v-if="isPC" class="icon-zoom-out" @click="zoomOut">
        <Icon :file="iconZoomOut" width="27px" height="27px"></Icon>
      </div>
      <div v-if="isPC" class="icon-refresh-left" @click="rotateLeft">
        <Icon :file="iconRotateLeft" width="27px" height="27px"></Icon>
      </div>
      <div v-if="isPC" class="icon-refresh-right" @click="rotateRight">
        <Icon :file="iconRotateRight" width="27px" height="27px"></Icon>
      </div>
      <span class="image-counter">
        {{ currentImageIndex + 1 }} / {{ imageList.length }}
      </span>
    </div>
    <div class="save" @click.stop.prevent="save">
      <Icon :file="iconDownload" width="20px" height="20px"></Icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, onMounted, onUnmounted, withDefaults } from "../../../adapter-vue";
import { IMessageModel, TUITranslateService } from "@tencentcloud/chat-uikit-engine";
import Icon from "../../common/Icon.vue";
import iconClose from "../../../assets/icon/icon-close.svg";
import iconArrowLeft from "../../../assets/icon/icon-arrow-left.svg";
import iconZoomIn from "../../../assets/icon/zoom-in.svg";
import iconZoomOut from "../../../assets/icon/zoom-out.svg";
import iconRotateLeft from "../../../assets/icon/rotate-left.svg";
import iconRotateRight from "../../../assets/icon/rotate-right.svg";
import iconDownload from "../../../assets/icon/download.svg";
import ImageItem from "./image-item.vue";
import { Toast, TOAST_TYPE } from "../../common/Toast/index";
import { isPC, isMobile, isUniFrameWork } from "../../../utils/env";
import { TUIGlobal, getPlatform } from "../../../utils/universal-api/index";

interface touchesPosition {
  pageX1?: number;
  pageY1?: number;
  pageX2?: number;
  pageY2?: number;
}

const props = withDefaults(
  defineProps<{
    imageList: Array<IMessageModel>;
    currentImage: IMessageModel;
  }>(),
  {
    imageList: () => ([] as Array<IMessageModel>),
    messageItem: () => ({} as IMessageModel),
  }
);

const imageFormatMap = new Map([
  [1, "jpg"],
  [2, "gif"],
  [3, "png"],
  [4, "bmp"],
]);

const emit = defineEmits(["close"]);
const zoom = ref(1);
const rotate = ref(0);
const minZoom = ref(0.1);
const currentImageIndex = ref(0);
const image = ref();
const ulRef = ref();
// touch
let startX = 0;
let touchStore = {} as touchesPosition;
let moveFlag = false;
let twoTouchesFlag = false;
let timer: number | null = null;

watchEffect(() => {
  currentImageIndex.value = props.imageList.findIndex((message: any) => {
    return message.ID === props?.currentImage?.ID;
  });
});

const isNumber = (value: any) => {
  return typeof value === "number" && isFinite(value);
};

const handleTouchStart = (e: any) => {
  e.preventDefault();
  moveInit(e);
  twoTouchesInit(e);
};

const handleTouchMove = (e: any) => {
  e.preventDefault();
  moveFlag = true;
  if (e.touches && e.touches.length === 2) {
    twoTouchesFlag = true;
    handleTwoTouches(e);
  }
};

const handleTouchEnd = (e: any) => {
  e.preventDefault();
  e.stopPropagation();
  let moveEndX = 0;
  let X = 0;
  if (twoTouchesFlag) {
    if (!timer) {
      twoTouchesFlag = false;
      delete touchStore.pageX2;
      delete touchStore.pageY2;
      timer = setTimeout(() => {
        timer = null;
      }, 200);
    }
    return;
  }
  // H5 touch move to left to go to prev image
  // H5 touch move to right to go to next image
  if (timer === null) {
    switch (moveFlag) {
      // touch event
      case true:
        moveEndX = e?.changedTouches[0]?.pageX;
        X = moveEndX - startX;
        if (X > 100) {
          goPrev();
        } else if (X < -100) {
          goNext();
        }
        break;
      // click event
      case false:
        close();
        break;
    }
    timer = setTimeout(() => {
      timer = null;
    }, 200);
  }
};

const handleTouchCancel = (e: any) => {
  twoTouchesFlag = false;
  delete touchStore.pageX1;
  delete touchStore.pageY1;
};

const handleWheel = (e: any) => {
  e.preventDefault();
  if (Math.abs(e.deltaX) !== 0 && Math.abs(e.deltaY) !== 0) return;
  let scale = zoom.value;
  scale += e.deltaY * (e.ctrlKey ? -0.01 : 0.002);
  scale = Math.min(Math.max(0.125, scale), 4);
  zoom.value = scale;
};

const moveInit = (e: any) => {
  startX = e?.changedTouches[0]?.pageX;
  moveFlag = false;
};

const twoTouchesInit = (e: any) => {
  let touch1 = e?.touches[0];
  let touch2 = e?.touches[1];
  touchStore.pageX1 = touch1?.pageX;
  touchStore.pageY1 = touch1?.pageY;
  if (touch2) {
    touchStore.pageX2 = touch2?.pageX;
    touchStore.pageY2 = touch2?.pageY;
  }
};

const handleTwoTouches = (e: any) => {
  let touch1 = e?.touches[0];
  let touch2 = e?.touches[1];
  if (touch2) {
    if (!isNumber(touchStore.pageX2)) {
      touchStore.pageX2 = touch2.pageX;
    }
    if (!isNumber(touchStore.pageY2)) {
      touchStore.pageY2 = touch2.pageY;
    }
  }
  const getDistance = (
    startX: number,
    startY: number,
    stopX: number,
    stopY: number
  ) => {
    return Math.hypot(stopX - startX, stopY - startY);
  };
  if (
    !isNumber(touchStore.pageX1) ||
    !isNumber(touchStore.pageY1) ||
    !isNumber(touchStore.pageX2) ||
    !isNumber(touchStore.pageY2)
  ) {
    return;
  }
  let touchZoom =
    getDistance(touch1.pageX, touch1.pageY, touch2.pageX, touch2.pageY) /
    getDistance(
      touchStore.pageX1 as number,
      touchStore.pageY1 as number,
      touchStore.pageX2 as number,
      touchStore.pageY2 as number
    );
  zoom.value = Math.min(Math.max(0.5, zoom.value * touchZoom), 4);
};

onMounted(() => {
  // web: close on esc keydown
  document?.addEventListener &&
    document?.addEventListener("keydown", handleEsc);
});

const handleEsc = (e: any) => {
  e.preventDefault();
  if (e?.keyCode === 27) {
    close();
  }
};
const zoomIn = () => {
  zoom.value += 0.1;
};
const zoomOut = () => {
  zoom.value =
    zoom.value - 0.1 > minZoom.value ? zoom.value - 0.1 : minZoom.value;
};
const close = () => {
  emit("close");
};
const rotateLeft = () => {
  rotate.value -= 90;
};
const rotateRight = () => {
  rotate.value += 90;
};
const goNext = () => {
  currentImageIndex.value < props.imageList.length - 1 &&
    currentImageIndex.value++;
  initStyle();
};
const goPrev = () => {
  currentImageIndex.value > 0 && currentImageIndex.value--;
  initStyle();
};
const initStyle = () => {
  zoom.value = 1;
  rotate.value = 0;
};

const getImageUrl = (message: IMessageModel) => {
  if (isPC) {
    return message?.payload?.imageInfoArray[0]?.url;
  } else {
    return message?.payload?.imageInfoArray[2]?.url;
  }
};

const save = () => {
  const imageMessage = props.imageList[
    currentImageIndex.value
  ] as IMessageModel;
  const imageSrc = imageMessage?.payload?.imageInfoArray[0]?.url;
  if (!imageSrc) {
    Toast({
      message: TUITranslateService.t("component.图片 url 不存在"),
      type: TOAST_TYPE.ERROR,
    });
    return;
  }
  switch (getPlatform()) {
    case "wechat":
      //获取用户的当前设置，获取相册权限
      TUIGlobal.getSetting({
        success: (res: any) => {
          //如果没有相册权限
          if (!res?.authSetting["scope.writePhotosAlbum"]) {
            //提前向用户发起授权请求
            TUIGlobal.authorize({
              scope: "scope.writePhotosAlbum",
              success() {
                downloadImgInUni(imageSrc);
              },
              fail() {
                TUIGlobal.showModal({
                  title: "您已拒绝获取相册权限",
                  content: "是否进入权限管理，调整授权？",
                  success: (res: any) => {
                    if (res.confirm) {
                      //调起客户端小程序设置界面，返回用户设置的操作结果。（重新让用户授权）
                      TUIGlobal.openSetting({
                        success: (res: any) => {
                          console.log(res.authSetting);
                        },
                      });
                    } else if (res.cancel) {
                      return Toast({
                        message: TUITranslateService.t("component.已取消"),
                        type: TOAST_TYPE.ERROR,
                      });
                    }
                  },
                });
              },
            });
          } else {
            // 如果已有相册权限，直接进行保存到相册
            downloadImgInUni(imageSrc);
          }
        },
        fail: () => {
          Toast({
            message: TUITranslateService.t("component.获取权限失败"),
            type: TOAST_TYPE.ERROR,
          });
        },
      });
      break;
    case "app":
      downloadImgInUni(imageSrc);
      break;
    default:
      downloadImgInWeb(imageSrc);
      break;
  }
};

const downloadImgInUni = (src: string) => {
  //下载图片文件
  TUIGlobal.showLoading({
    title: "大图提取中",
  });
  TUIGlobal.downloadFile({
    url: src,
    success: function (res: any) {
      TUIGlobal.hideLoading();
      TUIGlobal.saveImageToPhotosAlbum({
        filePath: res.tempFilePath,
        success: () => {
          Toast({
            message: TUITranslateService.t("component.已保存至相册"),
            type: TOAST_TYPE.SUCCESS,
          });
        },
      });
    },
    fail: function (error: any) {
      TUIGlobal.hideLoading();
      Toast({
        message: TUITranslateService.t("component.图片下载失败"),
        type: TOAST_TYPE.ERROR,
      });
    },
  });
};

const downloadImgInWeb = (src: string) => {
  const option: any = {
    mode: "cors",
    headers: new Headers({
      "Content-Type": "application/x-www-form-urlencoded",
    }),
  };
  const imageMessage = props.imageList[
    currentImageIndex.value
  ] as IMessageModel;
  const imageFormat: number = imageMessage?.payload?.imageFormat;
  if (!imageFormatMap.has(imageFormat)) {
    Toast({
      message: TUITranslateService.t("component.暂不支持下载此类型图片"),
      type: TOAST_TYPE.ERROR,
    });
    return;
  }
  // 浏览器支持fetch则用blob下载，避免浏览器点击a标签，跳转到新页面预览的行为
  // If the browser supports fetch, use blob to download, so as to avoid the browser clicking the a tag and jumping to the preview of the new page
  if ((window as any).fetch) {
    fetch(src, option)
      .then((res) => res.blob())
      .then((blob) => {
        const a = document.createElement("a");
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = url + "." + imageFormatMap.get(imageFormat);
        a.click();
      });
  } else {
    const a = document.createElement("a");
    a.href = src;
    a.target = "_blank";
    a.download = src + "." + imageFormatMap.get(imageFormat);
    a.click();
  }
};

onUnmounted(() => {
  document?.removeEventListener &&
    document?.removeEventListener("keydown", handleEsc);
});
</script>

<style lang="scss" scoped>
@import url("../../../assets/styles/common.scss");
.image-previewer {
  position: fixed;
  z-index: 101;
  width: 100vw;
  height: 100vh;
  background: rgba(#000000, 0.3);
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  .image-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }
  .image-list {
    position: absolute;
    height: 100%;
    left: 0;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-content: center;
    .image-item {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
  }
  .image-preview {
    max-width: 100%;
    max-height: 100%;
    transition: transform 0.1s ease 0s;
    pointer-events: auto;
  }
  .image-button {
    display: flex;
    flex-direction: column;
    min-width: auto;
    justify-content: center;
    align-items: center;
    position: absolute;
    cursor: pointer;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    top: calc(50% - 20px);
    background: rgba(255, 255, 255, 0.8);
    &-left {
      left: 10px;
    }
    &-right {
      right: 10px;
      transform: rotate(180deg);
    }
    .icon {
      position: absolute;
      bottom: 0;
      top: 0;
      left: 0;
      right: 0;
      margin: auto;
      line-height: 40px;
      display: flex;
      flex-direction: column;
      min-width: auto;
      justify-content: center;
      align-items: center;
    }
  }
  .icon-close {
    position: absolute;
    cursor: pointer;
    border-radius: 50%;
    top: 3%;
    right: 3%;
    padding: 10px;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    &::before,
    &::after {
      background-color: #444444;
    }
  }
}
.image-previewer-h5 {
  width: 100%;
  height: 100%;
  background: #000000;
  display: flex;
  flex-direction: column;
}
.actions-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: absolute;
  bottom: 5%;
  padding: 12px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.8);
  &-h5 {
    padding: 6px;
  }
  .icon {
    position: static;
    font-size: 24px;
    cursor: pointer;
    margin: 0 6px;
    width: 27px;
    height: 27px;
    margin: 5px;
  }
  .icon-zoom-in,
  .icon-zoom-out,
  .icon-refresh-left,
  .icon-refresh-right {
    cursor: pointer;
    user-select: none;
    padding: 5px;
  }
}
.save {
  cursor: pointer;
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: absolute;
  bottom: 5%;
  right: 5%;
  padding: 12px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.8);
}
.image-counter {
  background: rgba(20, 18, 20, 0.53);
  padding: 3px 5px;
  margin: 5px;
  border-radius: 3px;
  color: #fff;
}
</style>
