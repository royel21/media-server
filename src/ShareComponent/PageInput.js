import { clamp } from "@share/utils";

const paginationInput = (li, page, totalPages, dispatch, min) => {
  let input = li.querySelector("input");
  if (!input) {
    li.textContent = "";

    li.innerHTML = `<input type="text" value=${page} class="form-control" min=1 
                           max=${totalPages}>`;

    let newInput = li.querySelector("input");

    newInput.on("focusout", (e) => {
      li.textContent = `${page} / ${totalPages}`;
    });

    newInput.onkeydown = (event) => {
      if (event.keyCode === 13) {
        page = clamp(+newInput.value, min || 1, totalPages);
        dispatch("gotopage", page);
        newInput = null;
      }
    };
    newInput.focus();
    newInput.setSelectionRange(newInput.value.length, newInput.value.length);
  }
};

export default paginationInput;
