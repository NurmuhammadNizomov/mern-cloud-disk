import dayjs from 'dayjs';

/**
 * Format date string or Date object to DD.MM.YYYY
 */
export const fmtDate = (date: string | Date | number): string => {
  if (!date) return '';
  return dayjs(date).format('DD.MM.YYYY');
};

/**
 * Format date and time to DD.MM.YYYY · HH:mm
 */
export const fmtDateTime = (date: string | Date | number): string => {
  if (!date) return '';
  return dayjs(date).format('DD.MM.YYYY · HH:mm');
};
