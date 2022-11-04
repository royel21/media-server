import { scrollInView } from "./mangaUtils";

var pageObserver;
var imgObserver;
let imgs;
let currentPage;

export const PageObserver = (setPage, container) => {
  imgs = container.querySelectorAll("img");
  if (!pageObserver) {
    pageObserver = new IntersectionObserver(
      (entries) => {
        if (imgs.length) {
          for (let entry of entries) {
            let img = entry.target;
            if (entry.isIntersecting) {
              currentPage = +img.id;
              setPage(+img.id);
            }
          }
        }
      },
      { root: container }
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

const onmouseup = () => {
  const curPage = currentPage;
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
  container.onmouseup = onmouseup;
  container.onmousedown = onmousedown;

  if (!imgObserver) {
    imgObserver = new IntersectionObserver(
      (entries) => {
        if (!mDown) {
          if (entries.length < imgs.length) {
            let pg, dir;
            for (let entry of entries) {
              if (entry.isIntersecting) {
                pg = +entry.target.id;
                dir = pg < currentPage ? -1 : 1;

                const img = imgs[pg];
                if (img && !img.src.includes("data:img")) {
                  load = true;
                }
              }
            }
            if (load) {
              load = false;
              loadImages(currentPage, 8, dir);
            }
          }
        }
      },
      {
        root: container,
        rootMargin: window.innerHeight * 2 + "px",
        threshold: 0,
      }
    );
  }

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
  imgs = [];
  pageObserver = null;
  imgObserver = null;
  imgs = null;
  currentPage = null;
};
