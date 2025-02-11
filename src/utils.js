export const isMobile = () => matchMedia("@media (pointer:none), (pointer:coarse)").matches;

export const formatSize = (size) => {
  if (size < 10240000000) {
    return (size / 1024 / 1024).toFixed(2) + "MB";
  }

  return (size / 1024 / 1024 / 1024).toFixed(2) + "GB";
};
