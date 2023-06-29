export const getProps = ({ location, href }) => {
  let active;
  let hrefParts = href.split("/");
  let locPart = location.pathname.split("/");

  if (!hrefParts[1] && !isNaN(+locPart[1])) {
    active = true;
  } else {
    for (let i = 0; i < hrefParts.length; i++) {
      active = locPart[i] === hrefParts[i];
    }
  }

  if (active) {
    return { class: "active" };
  }

  return {};
};
