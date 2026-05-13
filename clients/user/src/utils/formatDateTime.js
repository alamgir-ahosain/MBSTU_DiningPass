export const formatDateTimeParts = (value) => {
  if (!value) {
    return { date: '-', time: '-' };
  }

  const dateValue = new Date(value);
  if (Number.isNaN(dateValue.getTime())) {
    return { date: String(value), time: '' };
  }

  const date = new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: undefined,
  }).format(dateValue);

  const time = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: undefined,
  }).format(dateValue);

  return { date, time };
};

