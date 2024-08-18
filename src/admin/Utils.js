export const calRows = (query) => {
  let container = document.querySelector(query || ".list-container") || {};
  return parseInt(container.offsetHeight / 40);
};

const tags = [
  "Age Gap",
  "Battle Royale",
  "Borderline H",
  "Body Swapping",
  "Brother Complex",
  "Childhood Friends",
  "College Life",
  "Coming of Age",
  "Demon King",
  "Explicit Sex",
  "Gender Bender",
  "Gender Swap",
  "Love Triangle",
  "Love Life",
  "Magical Girl",
  "Martial Arts",
  "Mature Themes",
  "Office Workers",
  "Physical Abuse",
  "Sexual Abuse",
  "School Club",
  "School Life",
  "Slice of life",
  "Slow Life",
  "Super Power",
  "Time Travel",
  "Tower Climbing",
  "Video Games",
  "Virtual Reality",
  "Reverse Harem",
  "Time Loop",
  "Unrequited Love",
  "Work Life",
  "Child Protagonists",
  "Boarding School",
  "Sci Fi",
];

const regex = new RegExp(tags.join("|"), "ig");

export const validGenres = (g) => {
  const parts = g.match(regex) || [];

  const gens = new Set([...parts, ...g.replace(regex, "").split(/,|\/|\n| /g)].sort());
  return [...gens].filter((g) => g).join(", ");
};

export const validateAuthor = (auth) => {
  if (auth === "N/A") return auth;

  auth = auth
    .split(/\/|,|;/)
    .map((a) => a.trim())
    .filter((a) => a)
    .join(", ");
  return auth
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLocaleLowerCase())
    .join(" ");
};

export const validAltName = (v) => {
  return v.replace(/( |)(•|\/)( |)/g, "; ").replace("N; A", "N/A");
};

export const map = (val, min, max) => Math.min(Math.max(min, val), max);

export const isDiff = (obj1, obj2) => {
  for (const key of Object.keys(obj1)) {
    if (obj1[key] !== obj2[key]) return true;
  }

  return false;
};
