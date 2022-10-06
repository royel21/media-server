<script>
  export let tabindex;
  export let type = "button";
  export let clazz;
  export let height;
  export let width;
  export let mr = 0;
  export let ml = 0;
  export let mt = 0;
  export let mb = 0;
  export let mx = 0;
  export let my = 0;
  export let pr = 0;
  export let pl = 0;
  export let pt = 0;
  export let pb = 0;
  export let px;
  export let py;

  function typeAction(node) {
    node.type = type;
  }

  let style = ``;
  if (width) {
    style += `width: ${width ? width + "px" : "initial"};`;
  }
  if (height) {
    style += `height:  ${height ? height + "px" : "initial"}`;
  }
  if (px || py || pt || pb || pr || pl) {
    style += `padding: ${pt || py} ${pr || px} ${pb || py} ${pl || px};`;
  }
  if (mx || my || mt || mb || mr || ml) {
    style += `margin: ${mt || my} ${mr || mx} ${mb || my} ${ml || mx};`;
  }
</script>

<button {style} class={"usn " + clazz} use:typeAction on:click {tabindex}><slot /></button>

<style>
  button {
    display: inline-block;
    font-weight: 400;
    text-align: center;
    vertical-align: middle;
    cursor: pointer;
    padding: 0.25rem 0.35rem;
    font-size: 1rem;
    line-height: 1.5;
    border-radius: 0.25rem;
    color: #fff;
    transition: 0.3s all;
    background-color: #5a6268;
    border: 1px solid transparent;
    transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out,
      box-shadow 0.15s ease-in-out;
  }

  button:hover {
    color: #fff;
    background-color: gray;
    border-color: #545b62;
  }

  button:active {
    transform: scale(1.2);
    transition: 0.25s;
  }
  button:not(:last-child) {
    margin-right: 10px;
  }
</style>
