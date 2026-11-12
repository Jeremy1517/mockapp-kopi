const LOCALE = "en-MY";
const TIME_ZONE = "Asia/Kuala_Lumpur";

const day = new Intl.DateTimeFormat(LOCALE, {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: TIME_ZONE,
});

const time = new Intl.DateTimeFormat(LOCALE, { hour: "numeric", minute: "2-digit", timeZone: TIME_ZONE });

/** "Wednesday, 12 November 2026" in the shop's time zone. */
export const formatDay = (iso: string) => day.format(new Date(iso));

/** "5:42 pm" in the shop's time zone. */
export const formatTime = (iso: string) => time.format(new Date(iso));

/** Calendar day in the shop's time zone, for grouping. */
export const dayKey = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date(iso));
