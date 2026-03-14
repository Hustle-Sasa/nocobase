export const handleFormatDateTime = (startDate: string, startTime: string): string => {
  const [year, month, day] = startDate?.split('-') || [];
  const [hours, minutes] = startTime?.split(':') || [];

  if (!startTime) {
    return `${day}/${month}/${year}`;
  }

  const hour = parseInt(hours, 10);
  const period = hour >= 12 ? 'pm' : 'am';
  const displayHour = hour % 12 || 12;

  return `${day}/${month}/${year} @ ${displayHour}:${minutes}${period}`;
};
