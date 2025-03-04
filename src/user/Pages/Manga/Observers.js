import { scrollInView } from "./mangaUtils";

let pageObserver;
let imgObserver;
let currentPage;
let scrollDir;
let oldScroll;
//memorize scroll direction
const onScroll = function ({ target: { scrollTop } }) {
  scrollDir = oldScroll < scrollTop ? 1 : -1;
  oldScroll = scrollTop;
};

export const PageObserver = (setPage, container) => {
  const imgs = container.querySelectorAll("img");
  if (!pageObserver && imgs.length) {
    container.onscroll = onScroll;
    pageObserver = new IntersectionObserver(
      (entries) => {
        if (imgs.length) {
          for (let entry of entries) {
            let img = entry.target;
            if (entry.isIntersecting) {
              currentPage = +img.id;
              setPage(currentPage);
            }
          }
        }
      },
      { threshold: 0.1, root: container }
    );

    imgs.forEach((lazyImg) => {
      pageObserver.observe(lazyImg);
    });
  }

  return pageObserver;
};

let mDown = false;
const onmousedown = () => {
  mDown = true;
};

const onmouseup = (e) => {
  const curPage = currentPage;
  const imgs = e.target.querySelectorAll("img");
  if (imgs[curPage] && !imgs[curPage].src) {
    loadImages(curPage - 1, 6);
    setTimeout(() => {
      scrollInView(curPage);
      setTimeout(() => {
        clearTimeout(tout);
        mDown = false;
      }, 100);
    }, 500);
  } else {
    mDown = false;
  }
};

let tout;
let load = false;
export const scrollImageLoader = (loadImages, container) => {
  const imgs = container.querySelectorAll("img");
  container.onmouseup = onmouseup;
  container.onmousedown = onmousedown;
  disconnectObvrs(container);

  const margin = window.innerHeight * 2;

  imgObserver = new IntersectionObserver(
    (entries) => {
      if (!mDown) {
        if (entries.length < imgs.length) {
          let pg;
          for (let entry of entries) {
            if (entry.isIntersecting) {
              pg = +entry.target.id;

              if (imgs[pg] && !imgs[pg].src.includes("data:img")) {
                load = true;
              }
            }
          }
          if (load) {
            load = false;
            loadImages(currentPage, 8, scrollDir);
          }
        }
      }
    },
    {
      root: container,
      rootMargin: `${margin}px 0px ${margin}px 0px`,
      threshold: 0,
    }
  );

  imgs.forEach((lazyImg) => {
    imgObserver.observe(lazyImg);
  });
};

export const disconnectObvrs = (container) => {
  if (container) {
    container.onmousedown = null;
    container.onmouseup = null;
  }
  pageObserver?.disconnect();
  imgObserver?.disconnect();
  pageObserver = null;
  imgObserver = null;
  currentPage = null;
};
