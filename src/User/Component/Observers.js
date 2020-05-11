var pageObserver;
var imgObserver;
let imgs;
let currentPage;
import { scrollInView } from "./Utils";
export const PageObserver = (setPage, container, loadImages) => {
  imgs = container.querySelectorAll("img");
  if (!pageObserver) {
    pageObserver = new IntersectionObserver(
      (entries) => {
        if (entries.length < imgs.length) {
          for (let entry of entries) {
            let img = entry.target;
            if (entry.isIntersecting) {
              setPage(parseInt(img.id));
              currentPage = img.id;
              let timg = imgs[currentPage];
              if (timg && !timg.src.includes("data:img")) {
                loadImages(currentPage - 3, 6, 1);
              }
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
    loadImages(curPage - 1, 2);
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
                pg = parseInt(entry.target.id);
                dir = pg < currentPage ? -1 : 1;

                const img = imgs[dir + pg];
                if (img && !img.src.includes("data:img")) {
                  load = true;
                }
              }
            }
            if (load) {
              load = false;
              if (tout) clearTimeout(tout);
              tout = setTimeout(() => {
                loadImages(pg, 4, dir);
                clearTimeout(tout);
              }, 50);
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
  container.onmousedown = null;
  container.onmouseup = null;
  pageObserver && pageObserver.disconnect();
  imgObserver && imgObserver.disconnect();
  imgs = [];
  pageObserver = null;
  imgObserver = null;
  imgs = null;
  currentPage = null;
};
