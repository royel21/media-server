<script>
  import Icons from "src/icons/Icons.svelte";

  export let item = {};
  export let key;
  export let label = "";
  export let onChange = (e) => {};
</script>

<div class={"input-control " + key}>
  <span class="input-label">{label || key}</span>
  <label class="input">
    <Icons name={item[key] ? "check" : "times"} color="black" />
    <input name={key} type="checkbox" bind:checked={item[key]} on:change={onChange} />
  </label>
</div>

<style>
  .input :global(svg) {
    top: -1px;
  }
  input {
    display: none;
  }
  .input {
    text-align: center;
    flex-grow: 1;
    margin: 0;
    font-size: 18px;
    cursor: pointer;
  }
  .input-label {
    user-select: none;
  }
</style>
