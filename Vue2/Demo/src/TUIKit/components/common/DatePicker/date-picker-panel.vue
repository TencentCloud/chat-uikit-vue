<template>
  <div :class="[n('')]" @mouseup.stop>
    <div :class="[n('body')]">
      <div :class="[n('body-header')]">
        <div :class="[n('body-header-prev')]">
          <!-- todo: 此处催产品给个双箭头icon -->
          <div
            :class="[n('icon')]"
            @click="change('year', -1)"
            v-if="canYearLess"
          >
            <Icon :file="dLeftArrowIcon" :width="'12px'" :height="'12px'" />
          </div>
          <div
            :class="[n('icon')]"
            @click="change('month', -1)"
            v-if="canMonthLess"
          >
            <Icon :file="leftArrowIcon" :width="'10px'" :height="'10px'" />
          </div>
        </div>
        <div :class="[n('body-header-label')]">
          <div :class="[n('body-header-label-item')]">{{ year }}</div>
          <div :class="[n('body-header-label-item')]">{{ month }}</div>
        </div>
        <div :class="[n('body-header-next')]">
          <div
            :class="[n('icon')]"
            @click="change('month', 1)"
            v-if="canMonthMore"
          >
            <Icon :file="rightArrowIcon" :width="'10px'" :height="'10px'" />
          </div>
          <!-- todo: 此处催产品给个双箭头icon -->
          <div :class="[n('icon')]" @click="change('year', 1)" v-if="canYearMore">
            <Icon :file="dRightArrowIcon" :width="'12px'" :height="'12px'" />
          </div>
        </div>
      </div>
      <div :class="[n('body-content')]">
        <DateTable
          :type="props.type"
          :startDate="props.startDate"
          :endDate="props.endDate"
          :currentPanelDate="currentPanelDate"
          @pick="handlePick"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { TUIGlobal } from "@tencentcloud/chat-uikit-engine";
import dayjs, { Dayjs, ManipulateType } from "dayjs";
import { computed, ref, onMounted } from "../../../adapter-vue";
import { DateCell } from "./date-picker";
import DateTable from "./date-table.vue";
import Icon from "../Icon.vue";
import leftArrowIcon from "../../../assets/icon/left-arrow.svg";
import rightArrowIcon from "../../../assets/icon/right-arrow.svg";
import dLeftArrowIcon from "../../../assets/icon/d-left-arrow.svg";
import dRightArrowIcon from "../../../assets/icon/d-right-arrow.svg";

const props = defineProps({
  type: {
    type: String,
    default: "range", // "single"/"range"
  },
  // type 为 single 时特有属性
  date: {
    type: Dayjs,
    default: () => dayjs(),
  },
  // type 为 range时特有属性
  startDate: {
    type: Dayjs,
    default: null,
  },
  endDate: {
    type: Dayjs,
    default: null,
  },
  rangeType: {
    type: String,
    default: "", // "left"/"right"
  },
  currentOtherPanelValue: {
    type: Dayjs,
    default: null,
  },
});

const emit = defineEmits(["pick", "change"]);

const isPC = ref(TUIGlobal.getPlatform() === "pc");

const n = (className: string) => {
  return className
    ? [
        "tui-date-picker-panel-" + className,
        !isPC && "tui-date-picker-panel-h5-" + className,
      ]
    : ["tui-date-picker-panel", !isPC && "tui-date-picker-panel-h5"];
};

const currentPanelDate = ref<typeof Dayjs>();
const year = computed(() => currentPanelDate?.value?.get("year"));
const month = computed(() => currentPanelDate?.value?.format("MMMM"));
const canYearMore = computed(() => {
  const prevYearNumber = props.currentOtherPanelValue?.year() - 1;
  const prevYear = props.currentOtherPanelValue?.year(prevYearNumber);
  return (
    props.rangeType === "right" ||
    currentPanelDate.value?.isBefore(prevYear, "year")
  );
});
const canMonthMore = computed(() => {
  const prevMonthNumber = props.currentOtherPanelValue?.month() - 1;
  const prevMonth = props.currentOtherPanelValue?.month(prevMonthNumber);
  return (
    props.rangeType === "right" ||
    currentPanelDate.value?.isBefore(prevMonth, "month")
  );
});
const canYearLess = computed(() => {
  const nextYearNumber = props.currentOtherPanelValue?.year() + 1;
  const nextYear = props.currentOtherPanelValue?.year(nextYearNumber);
  return (
    props.rangeType === "left" ||
    currentPanelDate.value?.isAfter(nextYear, "year")
  );
});
const canMonthLess = computed(() => {
  const nextMonthNumber = props.currentOtherPanelValue?.month() + 1;
  const nextMonth = props.currentOtherPanelValue?.month(nextMonthNumber);
  return (
    props.rangeType === "left" ||
    currentPanelDate.value?.isAfter(nextMonth, "month")
  );
});

// range 判断：
// 前提，如果只有一个，那一定是start
// 如果有startDate
// left所在界面首次展示startDate所在month/year
// 如果有startDate && endDate
// 如果在同一个月
// 均在left展示，right展示下一个月
// 如果不在同个月
// start在left展示，end在right展示
// 即要判断start和end是否在同一个月
// 如果都没有 left展示当前月 right展示下一个月
const handleSingleDate = (): { date: typeof Dayjs } => {
  if (props.date && dayjs(props.date)?.isValid()) {
    // props.date year and month
    return {
      date: props?.date,
    };
  }
  // nowadays year and month
  return {
    date: dayjs(),
  };
};

const handleRangeDate = (): { date: typeof Dayjs } => {
  // 计算左边
  switch (props.rangeType) {
    case "left":
      if (props.startDate && dayjs.isDayjs(props.startDate)) {
        return {
          date: props?.startDate,
        };
      } else {
        return {
          date: dayjs(),
        };
      }
    case "right":
      if (
        props.endDate &&
        dayjs.isDayjs(props.endDate) &&
        props?.endDate?.isAfter(props.startDate, "month")
      ) {
        return {
          date: props?.endDate,
        };
      } else {
        const _month = (props.startDate || dayjs()).month();
        return {
          date: (props.startDate || dayjs()).month(_month + 1),
        };
      }
    default:
      return {
        date: dayjs(),
      };
  }
};

function handlePick(cell: DateCell) {
  emit("pick", cell);
}

// 统一处理日期切换
function change(type: typeof ManipulateType, num: number) {
  currentPanelDate.value = dayjs(currentPanelDate.value.toDate()).add(
    num,
    type
  );
  emit("change", currentPanelDate.value);
}

onMounted(() => {
  switch (props.type) {
    case "single":
      currentPanelDate.value = handleSingleDate().date;
      emit("change", currentPanelDate.value);
      break;
    case "range":
      currentPanelDate.value = handleRangeDate().date;
      emit("change", currentPanelDate.value);
      break;
  }
});
</script>

<style scoped lang="scss">
.tui-date-picker-panel {
  width: 200px;
  margin: 5px;
  &-body {
    width: 200px;
    display: flex;
    flex-direction: column;
    &-header {
      width: 100%;
      display: flex;
      flex-direction: row;
      height: 30px;
      padding: 0 5px;
      box-sizing: border-box;
      &-prev {
        display: flex;
        flex-direction: row;
        cursor: pointer;
        width: 24px;
      }
      &-label {
        flex: 1;
        display: flex;
        flex-direction: row;
        text-align: center;
        align-items: center;
        justify-content: center;
        user-select: none;
        color: #666666;
        &-item {
          padding: 0 5px;
          color: #666666;
        }
      }
      &-next {
        display: flex;
        flex-direction: row;
        cursor: pointer;
        width: 24px;
      }
    }
  }
  &-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 12px;
  }
}
</style>
