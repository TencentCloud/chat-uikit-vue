import { Dayjs } from 'dayjs';

export type DateCellType =
  | 'normal'
  | 'today'
  | 'week'
  | 'next-month'
  | 'prev-month';
export interface DateCell {
  text?: number;
  disabled?: boolean;
  isSelected?: boolean;
  isSelectedStart?: boolean;
  isSelectedEnd?: boolean;
  isInRange?: boolean;
  isCurrent?: boolean;
  date: typeof Dayjs;
  type?: DateCellType;
}
