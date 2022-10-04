<script>
  export let label;
  export let tabindex;
  export let type = "button";

  function typeAction(node) {
    node.type = type;
  }
</script>

<button use:typeAction on:click {tabindex}>{label}</button>

<style>
  button {
    display: inline-block;
    font-weight: 400;
    text-align: center;
    vertical-align: middle;
    cursor: pointer;
    -webkit-user-select: none;
    user-select: none;
    padding: 0.25rem 0.35rem;
    font-size: 1rem;
    line-height: 1.5;
    border-radius: 0.25rem;
    color: #fff;
    transition: 0.3s all;
    background-color: gray;
    border: 1px solid transparent;
    transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out,
      box-shadow 0.15s ease-in-out;
  }
  button:hover {
    color: #fff;
    background-color: #5a6268;
    border-color: #545b62;
  }
</style>
