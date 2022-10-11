export const compare = (a, b, key) => {
  let a1 = a[key || "Name"] || a;
  let b1 = b[key || "Name"] || b;

  return a1.toLocaleLowerCase() === b1.toLocaleLowerCase();
};
