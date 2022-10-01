let observe;
let lastOffset = 0;
export const Observer = (container) => {
  let items = container.querySelectorAll(".file");
  if (!observe && items.length > 0) {
    observe = new IntersectionObserver(
      (entries) => {
        if (entries.length < items.length) {
          for (let entry of entries) {
            let item = entry.target;
            if (entry.isIntersecting) {
              item.classList.add("on-view");
              lastOffset = item.offsetLeft;
            } else {
              item.classList.remove("on-view");
            }
          }
        }
      },
      { root: container, threshold: 0.1 }
    );

    items.forEach((item) => {
      observe.observe(item);
    });
  }

  return observe;
};
