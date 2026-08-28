import dayjs from 'dayjs';

export function formatDate(
  value: string | Date,
  template = 'MMM D, YYYY',
): string {
  return dayjs(value).format(template);
}

export function formatDateTime(value: string | Date): string {
  return dayjs(value).format('MMM D, YYYY h:mm A');
}
