export function formatDateAsTimeAgo(date: Date) {
  const MS_PER_SECOND = 1000;
  const MS_PER_MINUTE = MS_PER_SECOND * 60;
  const MS_PER_HOUR = MS_PER_MINUTE * 60;
  const MS_PER_DAY = MS_PER_HOUR * 24;
  const MS_PER_MONTH = MS_PER_DAY * 30.44;
  const MS_PER_YEAR = MS_PER_DAY * 365.25;

  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  if (diffInMs < 0) {
    return "in the future";
  }

  const years = Math.floor(diffInMs / MS_PER_YEAR);
  const months = Math.floor((diffInMs % MS_PER_YEAR) / MS_PER_MONTH);
  const days = Math.floor(((diffInMs % MS_PER_YEAR) % MS_PER_MONTH) / MS_PER_DAY);
  const hours = Math.floor((((diffInMs % MS_PER_YEAR) % MS_PER_MONTH) % MS_PER_DAY) / MS_PER_HOUR);
  const minutes = Math.floor(((((diffInMs % MS_PER_YEAR) % MS_PER_MONTH) % MS_PER_DAY) % MS_PER_HOUR) / MS_PER_MINUTE);

  const unitString = (value: Number, unit: String) => `${value} ${unit}${value !== 1 ? "s" : ""}`;

  if (years > 0) {
    if (months > 0) {
      return `${unitString(years, "year")}, ${unitString(months, "month")}`;
    }
    if (days > 0) {
      return `${unitString(years, "year")}, ${unitString(days, "day")}`;
    }
    return unitString(years, "year");
  } else if (months > 0) {
    if (days > 0) {
      return `${unitString(months, "month")}, ${unitString(days, "day")}`;
    }
    if (hours > 0) {
      return `${unitString(months, "month")}, ${unitString(hours, "hour")}`;
    }
    return unitString(months, "month");
  } else if (days > 0) {
    if (hours > 0) {
      return `${unitString(days, "day")}, ${unitString(hours, "hour")}`;
    }
    if (minutes > 0) {
      return `${unitString(days, "day")}, ${unitString(minutes, "minute")}`;
    }
    return unitString(days, "day");
  } else if (hours > 0) {
    if (minutes > 0) {
      return `${unitString(hours, "hour")}, ${unitString(minutes, "minute")}`;
    }
    return unitString(hours, "hour");
  } else if (minutes > 0) {
    return unitString(minutes, "minute");
  } else {
    return "just now";
  }
}
