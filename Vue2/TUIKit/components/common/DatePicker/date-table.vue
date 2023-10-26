<template>
  <table :class="['tui-date-table']" cellspacing="0" cellpadding="0" role="grid">
    <tbody :class="['tui-date-table-body']">
      <tr :class="['tui-date-table-body-weeks']">
        <th :class="['tui-date-table-body-weeks-item']" v-for="item in WEEKS" :aria-label="item + ''" scope="col">
          {{ item }}
        </th>
      </tr>
      <tr :class="['tui-date-table-body-days']" v-for="(row, rowKey) in rows" :key="rowKey">
        <td v-for="(col, colKey) in row" :key="generateVueRenderKey(rowKey, colKey)"
          :class="['tui-date-table-body-days-item', col.type]">
          <div :class="[handleDateCellClass(col)]" @click="handlePick(col)">
            <span :class="'tui-date-table-body-days-item-cell-text'">
              {{ col.text }}
            </span>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { DateCell, DateCellType } from "./date-picker";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/zh-cn";

const props = defineProps({
  type: {
    type: String,
    default: "range", // "single"/"range"
  },
  currentPanelDate: {
    type: Dayjs,
    default: () => dayjs(),
  },
  // type 为 single 时特有属性
  date: {
    type: Dayjs,
    default: null,
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
});

const emit = defineEmits(["pick"]);
// 当前日期
const now = dayjs();
// 面板行数
const tableRows = ref<DateCell[][]>([[], [], [], [], [], []]);

const WEEKS_CONSTANT = computed(() => {
  return dayjs.weekdaysShort();
});

// 表头数据
const WEEKS = computed(() =>
  WEEKS_CONSTANT.value.map((w: string) => w.substring(1))
);

// 表格开始日期
const startDate = computed(() => {
  const startDayOfMonth = props?.currentPanelDate?.startOf("month");
  return startDayOfMonth.subtract(startDayOfMonth.day() || 7, "day");
});

// 表格数据
const rows = computed(() => {
  const rows_ = tableRows.value;
  const cols = WEEKS.value.length;

  // 当月第一天
  const startOfMonth = props.currentPanelDate.startOf("month");
  const startOfMonthDay = startOfMonth.day() || 7; // day of this month first day
  const dateCountOfMonth = startOfMonth.daysInMonth(); // total days of this month

  let count = 1;
  // 循环填充表格，6行7列
  for (let row = 0; row < tableRows.value.length; row++) {
    for (let col = 0; col < cols; col++) {
      const cellDate = startDate.value.add(count, "day");
      const text = cellDate.date();
      // 对于 type === "single", 选中传入日期
      // 对于 type === "range", 选中传入的开始与结束的日期
      const isSelected =
        props.type === "single" &&
        cellDate.format("YYYY-MM-DD") === props?.date?.format("YYYY-MM-DD");
      const isSelectedStart =
        props.type === "range" &&
        cellDate.format("YYYY-MM-DD") ===
        props?.startDate?.format("YYYY-MM-DD");
      const isSelectedEnd =
        props.type === "range" &&
        cellDate.format("YYYY-MM-DD") === props?.endDate?.format("YYYY-MM-DD");
      // 对于 type === "range", 是否在选择区间中
      const isInRange =
        cellDate.isSameOrBefore(props.endDate, "day") &&
        cellDate.isSameOrAfter(props.startDate, "day");
      let type: DateCellType = "normal";
      if (count < startOfMonthDay) {
        // 上个月日期
        type = "prev-month";
      } else if (count - startOfMonthDay >= dateCountOfMonth) {
        // 下个月日期
        type = "next-month";
      }
      rows_[row][col] = {
        type,
        date: cellDate,
        text,
        isSelected: isSelected || isSelectedStart || isSelectedEnd,
        isSelectedStart,
        isSelectedEnd,
        isInRange,
      };
      count++;
    }
  }
  return rows_;
});

const handleDateCellClass = (cell: DateCell): Array<string> => {
  const classNameList = ["tui-date-table-body-days-item-cell"];
  cell?.isSelected && classNameList.push("selected");
  cell?.isSelectedStart && classNameList.push("selected-start");
  cell?.isSelectedEnd && classNameList.push("selected-end");
  cell?.isInRange && classNameList.push("range");
  return classNameList;
};

const handlePick = (cell: DateCell) => {
  if (cell?.type !== "normal") {
    return;
  }
  emit("pick", cell);
};

const generateVueRenderKey = (rowKey: number, colKey: number): string => {
  return `${rowKey + colKey} `
}
</script>

<style scoped lang="scss">
.tui-date-table {
  border-spacing: 0px;
  -webkit-border-horizontal-spacing: 0px;
  -webkit-border-vertical-spacing: 0px;
  font-size: 12px;
  user-select: none;
  table-layout: fixed;
  width: 100%;
  box-sizing: border-box;

  &:after,
  &:before {
    box-sizing: border-box;
  }

  &-body {
    width: 100%;
    background-color: #ffffff;

    &-weeks {
      width: 100%;

      &-item {
        color: #666666;
        font-size: 12px;
        font-weight: 400px;
      }
    }

    &-days {
      color: #000000;

      .prev-month,
      .next-month {
        color: #666666;
        background-color: #ffffff;

        .range {
          color: #666666;
          background-color: #ffffff;
        }

        .selected {
          .tui-date-table-body-days-item-cell-text {
            box-sizing: border-box;
            color: #666666;
            border: none;
          }
        }
      }

      &-item {
        &-cell {
          text-align: center;
          padding: 2px;
          margin: 2px 0;

          &-text {
            display: inline-flex;
            justify-content: center;
            align-items: center;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            user-select: none;
            cursor: pointer;
            box-sizing: border-box;
          }
        }

        .selected {
          .tui-date-table-body-days-item-cell-text {
            box-sizing: border-box;
            color: #007aff;
            border: 1px solid #007aff;
            background-color: #ffffff;
          }
        }

        .range {
          background-color: #007aff33;
        }

        .selected-start {
          border-radius: 12px 0 0 12px;
        }

        .selected-end {
          border-radius: 0 12px 12px 0;
        }

        .selected-start.selected-end {
          border-radius: 12px;
        }
      }
    }
  }
}
</style>
