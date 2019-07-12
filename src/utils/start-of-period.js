export default (date, period) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();

  const startOf = {
    year: new Date(year, 0, 1),
    month: new Date(year, month, 1),
    day: new Date(year, month, day),
    hour: new Date(year, month, day, hour),
    minute: new Date(year, month, day, hour, minute),
  };

  return startOf[period];
};
