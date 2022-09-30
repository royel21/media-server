<script>
  export let label;
  export let tabindex;
</script>

<button on:click {tabindex}>{label}</button>

<style>
  button {
    display: inline-block;
    font-weight: 400;
    text-align: center;
    vertical-align: middle;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
    border: 1px solid transparent;
    padding: 0.25rem 0.35rem;
    font-size: 1rem;
    line-height: 1.5;
    border-radius: 0.25rem;
    color: white;
    transition: 0.3s all;
    background-color: grey;
    background-image: linear-gradient(-120deg, #888888, #555555, #888888);
  }
  button:hover {
    background-image: linear-gradient(-160deg, #888888, #555555, #444444);
  }
</style>
