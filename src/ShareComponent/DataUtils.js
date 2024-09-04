export const getProps = ({ location, href }) => {
  let hrefParts = href.split("/");
  let locPart = location.pathname.split("/");

  if (!hrefParts[1] && !isNaN(+locPart[1])) {
    return { class: "active" };
  }

  for (let i = 0; i < hrefParts.length; i++) {
    if (locPart[i] !== hrefParts[i]) {
      return {};
    }
  }
  return { class: "active" };
};
