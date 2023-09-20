<script>
  import Icons from "src/icons/Icons.svelte";

  export let item;
  export let key;
  export let label;
  let clazz;
  export { clazz as class };
  export let onChange = (e) => {};
</script>

<div class={"input-control " + clazz}>
  <span class="input-label">{label || key}</span>
  <label class="input">
    <Icons name={item[key] ? "check" : "times"} color="black" />
    <input type="checkbox" bind:checked={item[key]} on:change={onChange} />
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
</style>
