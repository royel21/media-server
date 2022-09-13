export const getProps = ({ location, href, isPartiallyCurrent }) => {
  let isActive = false;
  if (href === "/" && location.pathname === "/") isActive = true;

  if (href !== "/" && isPartiallyCurrent) {
    isActive = true;
  }

  if (isActive) {
    return { class: "active" };
  }
  return {};
};
