<template>
  <table
    :class="['tui-date-table', !isPC && 'tui-date-table-h5']"
    cellspacing="0"
    cellpadding="0"
    role="grid"
  >
    <tbody class="tui-date-table-body">
      <tr class="tui-date-table-body-weeks">
        <th
          v-for="item in WEEKS"
          :key="item"
          class="tui-date-table-body-weeks-item"
          :aria-label="item + ''"
          scope="col"
        >
          {{ TUITranslateService.t(`time.${item}`) }}
        </th>
      </tr>
      <tr
        v-for="(row, rowKey) in rows"
        :key="rowKey"
        class="tui-date-table-body-days"
      >
        <td
          v-for="(col, colKey) in row"
          :key="colKey"
          :class="['tui-date-table-body-days-item', col.type]"
        >
          <div
            :class="[
              'tui-date-table-body-days-item-cell',
              col.isSelected && 'selected',
              col.isSelectedStart && 'selected-start',
              col.isSelectedEnd && 'selected-end',
              col.isInRange && 'range',
            ]"
            @click="handlePick(col)"
          >
            <span class="tui-date-table-body-days-item-cell-text">
              {{ col.text }}
            </span>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts" setup>
import {
  computed,
  ref,
  getCurrentInstance,
  nextTick,
  watch,
} from '../../../adapter-vue';
import { TUITranslateService } from '@tencentcloud/chat-uikit-engine';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-cn';
import { DateCell, DateCellType } from './date-picker';
import { isPC } from '../../../utils/env';

const props = defineProps({
  type: {
    type: String,
    default: 'range', // "single"/"range"
  },
  currentPanelDate: {
    type: Dayjs,
    default: () => dayjs(),
  },
  // Unique attribute when type is single
  date: {
    type: Dayjs,
    default: null,
  },
  // Unique attribute when type is range
  startDate: {
    type: Dayjs,
    default: null,
  },
  endDate: {
    type: Dayjs,
    default: null,
  },
});

const emit = defineEmits(['pick']);
// vue instance
const instance = getCurrentInstance();

const tableRows = ref<DateCell[][]>([[], [], [], [], [], []]);
const currentPanelDateObject = ref<typeof Dayjs>(
  dayjs(props.currentPanelDate || null),
);
const dateObject = ref<typeof Dayjs>(dayjs(props.date || null));
const startDateObject = ref<typeof Dayjs>(dayjs(props.startDate || null));
const endDateObject = ref<typeof Dayjs>(dayjs(props.endDate || null));

const WEEKS_CONSTANT = computed(() => {
  return dayjs.weekdaysShort();
});

const WEEKS = computed(() =>
  WEEKS_CONSTANT.value.map((w: string) => w.substring(1)),
);

const startDateOnTable = computed(() => {
  const startDayOfMonth = currentPanelDateObject.value?.startOf('month');
  return startDayOfMonth?.subtract(startDayOfMonth?.day() || 7, 'day');
});

// Table data
const rows = computed(() => {
  const rows_ = tableRows.value;
  const cols = WEEKS.value.length;

  const startOfMonth = currentPanelDateObject.value?.startOf('month');
  const startOfMonthDay = startOfMonth?.day() || 7; // day of this month first day
  const dateCountOfMonth = startOfMonth?.daysInMonth(); // total days of this month

  let count = 1;
  for (let row = 0; row < tableRows.value.length; row++) {
    for (let col = 0; col < cols; col++) {
      const cellDate = startDateOnTable.value?.add(count, 'day');
      const text = cellDate?.date();
      // For type === "single", select the entered date
      // For type === "range", select the entered start and end dates
      const isSelected
        = props.type === 'single'
        && cellDate?.format('YYYY-MM-DD')
        === dateObject.value?.format('YYYY-MM-DD');
      const isSelectedStart
        = props.type === 'range'
        && cellDate?.format('YYYY-MM-DD')
        === startDateObject.value?.format('YYYY-MM-DD');
      const isSelectedEnd
        = props.type === 'range'
        && cellDate?.format('YYYY-MM-DD')
        === endDateObject.value?.format('YYYY-MM-DD');
      // For type === "range", check if it is within the selected range.
      const isInRange
        = cellDate?.isSameOrBefore(endDateObject.value, 'day')
        && cellDate?.isSameOrAfter(startDateObject.value, 'day');
      let type: DateCellType = 'normal';
      if (count < startOfMonthDay) {
        // Prev month's date
        type = 'prev-month';
      } else if (count - startOfMonthDay >= dateCountOfMonth) {
        // Next month's date
        type = 'next-month';
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

const handlePick = (cell: DateCell) => {
  if (cell?.type !== 'normal') {
    return;
  }
  emit('pick', cell);
};

watch(
  () => [props.currentPanelDate, props.date, props.startDate, props.endDate],
  () => {
    currentPanelDateObject.value = dayjs(props.currentPanelDate || null);
    dateObject.value = dayjs(props.date || null);
    startDateObject.value = dayjs(props.startDate || null);
    endDateObject.value = dayjs(props.endDate || null);
    nextTick(() => {
      instance?.proxy?.$forceUpdate();
    });
  },
  {
    deep: true,
    immediate: true,
  },
);
</script>

<style scoped lang="scss">
/* stylelint-disable selector-class-pattern */
.tui-date-table {
  border-spacing: 0;
  -webkit-border-horizontal-spacing: 0;
  -webkit-border-vertical-spacing: 0;
  font-size: 12px;
  user-select: none;
  table-layout: fixed;
  width: 100%;
  box-sizing: border-box;

  &::after,
  &::before {
    box-sizing: border-box;
  }

  &-body {
    width: 100%;
    background-color: #fff;

    &-weeks,
    &-days {
      box-sizing: border-box;
      min-width: 0;
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      overflow: hidden;
    }

    &-weeks {
      width: 100%;

      &-item {
        color: #666;
        font-size: 12px;
        font-weight: 400px;
      }
    }

    &-days {
      color: #000;

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
          border-radius: 12px;

          .tui-date-table-body-days-item-cell-text {
            box-sizing: border-box;
            color: #007aff;
            border: 1px solid #007aff;
            background-color: #fff;
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

      .prev-month,
      .next-month {
        color: #666;
        background-color: #fff;

        .range {
          color: #666;
          background-color: #fff;
        }

        .selected {
          .tui-date-table-body-days-item-cell-text {
            box-sizing: border-box;
            color: #666;
            border: none;
          }
        }
      }

    }
  }
}

.tui-date-table-h5 {

  /* stylelint-disable-next-line no-descending-specificity */
  .tui-date-table-body-days-item-cell-text {
    cursor: none !important;
  }
}

td,
._td,
.tui-date-table-body-days-item {
  flex: 1;
}
</style>
