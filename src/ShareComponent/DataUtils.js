export const getProps = ({ location, href }) => {
  if (href.split("/")[1] === location.pathname.split("/")[1]) {
    return { class: "active" };
  }

  return {};
};
