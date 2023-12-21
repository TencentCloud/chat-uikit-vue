<template>
  <div :class="[n([''])]">
    <div
      :class="[n(['input']), isDatePanelShow && n(['input-active'])]"
      @click="setDatePanelDisplay(!isDatePanelShow)"
    >
      <slot name="start-icon"></slot>
      <input
        :placeholder="startPlaceholderVal"
        :class="[n(['input-start'])]"
        type="text"
        v-model="startFormatDate"
        readonly
        autocomplete="false"
      />
      <span v-if="type !== 'single'">-</span>
      <input
        v-if="type !== 'single'"
        :placeholder="endPlaceholderVal"
        :class="[n(['input-end'])]"
        type="text"
        v-model="endFormatDate"
        readonly
        autocomplete="false"
      />
      <slot name="end-icon"></slot>
    </div>
    <div :class="[n(['dialog'])]" v-if="isDatePanelShow">
      <div
        :class="[
          n([
            'dialog-container',
            'dialog-container-' + rangeTableType,
            'dialog-container-' + popupPosition,
          ]),
        ]"
      >
        <DatePickerPanel
          :type="props.type"
          rangeType="left"
          :date="dateValue"
          :startDate="startValue"
          :endDate="endValue"
          :currentOtherPanelValue="rightCurrentPanelValue"
          @pick="handlePick"
          @change="handleLeftPanelChange"
        >
        </DatePickerPanel>
        <DatePickerPanel
          v-if="props.type === 'range' && isPC && rangeTableType === 'two'"
          :type="props.type"
          rangeType="right"
          :date="dateValue"
          :startDate="startValue"
          :endDate="endValue"
          :currentOtherPanelValue="leftCurrentPanelValue"
          @pick="handlePick"
          @change="handleRightPanelChange"
        ></DatePickerPanel>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { TUITranslateService } from "@tencentcloud/chat-uikit-engine";
import DatePickerPanel from "./date-picker-panel.vue";
import { ref, computed } from "../../../adapter-vue";
import { DateCell } from "./date-picker";
// dayjs extension
import dayjs, { Dayjs } from "dayjs";
import localeData from "dayjs/plugin/localeData.js";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter.js";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";
import "dayjs/locale/zh-cn";
import { isPC } from "../../../utils/env";

dayjs.extend(localeData);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.locale("zh-cn");

const emit = defineEmits(["pick", "change"]);

const props = defineProps({
  type: {
    type: String,
    default: "range", // "single":单选, 暂不支持 / "range":区间选择
  },
  rangeTableType: {
    type: String,
    default: "one", // "one": 在 一个 datePanel 之内选择区间（注意，移动端因屏幕较窄，仅支持在一个 datePanel 中进行选择） / "two": 在 两个 datePanel 之间选择区间
  },
  startPlaceholder: {
    type: String,
    default: () => TUITranslateService.t("开始时间"),
  },
  endPlaceholder: {
    type: String,
    default: () => TUITranslateService.t("开始时间"),
  },
  popupPosition: {
    type: String,
    default: "bottom", // "top": 向上弹出 datePanel / "bottom": 向下弹出 datePanel
  },
  // 默认单选日期
  defaultSingleDate: {
    type: Dayjs,
    default: null,
    required: false,
  },
});

const isDatePanelShow = ref<boolean>(false);

const dateValue = ref<typeof Dayjs>(props.type === "single" ? props?.defaultSingleDate : null);
const startValue = ref<typeof Dayjs>(props.type === "single" ? props?.defaultSingleDate : null);
const endValue = ref<typeof Dayjs>(props.type === "single" ? props?.defaultSingleDate : null);
const startFormatDate = computed(() => startValue?.value?.format("YYYY/MM/DD"));
const endFormatDate = computed(() => endValue?.value?.format("YYYY/MM/DD"));
const startPlaceholderVal = props.startPlaceholder;
const endPlaceholderVal = props.endPlaceholder;
const leftCurrentPanelValue = ref<typeof Dayjs>();
const rightCurrentPanelValue = ref<typeof Dayjs>();

const setDatePanelDisplay = (show: boolean) => {
  isDatePanelShow.value = show;
};

const n = (classNameList: Array<string>) => {
  const resultClassList: Array<string> = [];
  classNameList.forEach((className: string) => {
    if (className) {
      resultClassList.push("tui-date-picker-" + className);
      !isPC && resultClassList.push("tui-date-picker-h5-" + className);
    } else {
      resultClassList.push("tui-date-picker");
      !isPC && resultClassList.push("tui-date-picker-h5");
    }
  });
  return resultClassList;
};

const handlePick = (cell: DateCell) => {
  switch (props.type) {
    case "single":
      startValue.value = cell.date;
      endValue.value = cell.date;
      dateValue.value = cell.date;
      emit("change", cell);
      emit("pick", dateValue.value);
      // 避免生硬直接关闭
      setTimeout(() => {
        setDatePanelDisplay(false);
      }, 300);
      break;
    case "range":
      if (!startValue?.value) {
        startValue.value = cell.date;
      } else if (!endValue?.value) {
        if (startValue?.value?.isSameOrBefore(cell.date, "day")) {
          endValue.value = cell.date;
        } else {
          endValue.value = startValue.value;
          startValue.value = cell.date;
        }
        emit("pick", {
          startDate: startValue?.value?.startOf("date"),
          endDate: endValue?.value?.endOf("date"),
        });
        // 避免生硬直接关闭
        setTimeout(() => {
          setDatePanelDisplay(false);
        }, 200);
      } else {
        startValue.value = cell.date;
        endValue.value = null;
      }
      emit("change", {
        startDate: startValue.value,
        endDate: endValue.value,
        leftCurrentPanel: leftCurrentPanelValue.value,
        rightCurrentPanel: leftCurrentPanelValue.value,
      });
      break;
  }
};

const handleLeftPanelChange = (value: typeof Dayjs) => {
  leftCurrentPanelValue.value = value;
  emit("change", {
    startDate: startValue.value,
    endDate: endValue.value,
    leftCurrentPanel: leftCurrentPanelValue.value,
    rightCurrentPanel: leftCurrentPanelValue.value,
  });
};
const handleRightPanelChange = (value: typeof Dayjs) => {
  rightCurrentPanelValue.value = value;
  emit("change", {
    startDate: startValue.value,
    endDate: endValue.value,
    leftCurrentPanel: leftCurrentPanelValue.value,
    rightCurrentPanel: leftCurrentPanelValue.value,
  });
};
</script>
<style scoped lang="scss">
.tui-date-picker {
  &-input {
    min-width: 160px;
    display: flex;
    flex-direction: row;
    color: #666666;
    border-radius: 5px;
    font-size: 12px;

    &-start,
    &-end {
      flex: 1;
      color: #666666;
      height: 17px;
      border: none;
      width: 67px;
      padding: 2px 5px;
      background-color: transparent;
      font-size: 12px;
      text-align: center;

      &:focus {
        border: none;
        outline: none;
      }

      &::placeholder {
        text-align: center;
      }
    }
  }

  &-dialog {
    position: relative;
    &-container {
      position: absolute;
      display: flex;
      flex-direction: row;
      padding: 10px;
      left: 5px;
      background-color: #ffffff;
      box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
      z-index: 1000;
      &-bottom {
        left: 5px;
      }
      &-top {
        bottom: 30px;
      }
      &-one {
        left: -5px;
      }
    }
  }
}
</style>
