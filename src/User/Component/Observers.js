var pageObserver;
var imgObserver;
let imgs;

export const PageObserver = (setPage, container) => {
  imgs = container.querySelectorAll("img");
  pageObserver = new IntersectionObserver(
    (entries) => {
      if (entries.length < imgs.length) {
        for (let entry of entries) {
          let img = entry.target;
          if (entry.isIntersecting) {
            setPage(parseInt(img.id));
          }
        }
      }
    },
    { root: container }
  );

  imgs.forEach((lazyImg) => {
    pageObserver.observe(lazyImg);
  });

  return pageObserver;
};

export const scrollImageLoader = (loadImages, container, page) => {
  if (!imgObserver) {
    console.log("set img observer");
    imgObserver = new IntersectionObserver(
      (entries) => {
        if (entries.length < imgs.length) {
          let pg;
          let dir;
          for (let entry of entries) {
            if (entry.isIntersecting) {
              pg = parseInt(entry.target.id);
              if (pg < page) {
                dir = -5;
              } else {
                dir = 5;
              }
              let pos = dir + pg;
              if (!imgs[pos].src) {
                console.log("empty src: ", imgs[pos].src, pos, dir, pg);
                loadImages(pos, dir);
              }
            }
          }
          //   if (pg) {
          //     if (pg < size && pg > 0 && !contentRef.current[pg + dir]) {
          //       loadImages(pg + dir, 5, dir);
          //     }
          //   }
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

export const disconnectObvrs = () => {
  pageObserver && pageObserver.disconnect();
  imgObserver && imgObserver.disconnect();
  imgs = null;
};
