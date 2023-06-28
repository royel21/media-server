<script>
  import Icons from "../../icons/Icons.svelte";

  export let item;
  export let key;
  export let label;
  export let labelWidth = 100;
  export let mb = 0;
  export let mt = 0;
  export let ml = 0;
  export let mr = 0;
  export let mx = 0;
  export let my = 0;
  export let onChange = (e) => {};

  let style = `margin: ${mt || my} ${mr || mx} ${mb || my} ${ml || mx};`;
</script>

<div class="check-control" {style}>
  <span class="check-label" style="width: ${labelWidth};">{label || key}</span>
  <label>
    <Icons name={item[key] ? "check" : "times"} color="black" />
    <input type="checkbox" bind:checked={item[key]} on:change={onChange} />
  </label>
</div>

<style>
  .check-control label :global(svg) {
    top: -1px;
  }
  input {
    display: none;
  }
  .check-control {
    display: flex;
    flex-direction: row;
  }
  .check-control > * {
    display: inline-block;
    height: 30px;
  }
  .check-label {
    width: 100px;
    color: #495057;
    background-color: #e9ecef;
    border-top-left-radius: 0.25rem;
    border-bottom-left-radius: 0.25rem;
    text-align: center;
    line-height: 1.8;
  }
  .check-control label {
    text-align: center;
    flex-grow: 1;
    margin: 0;
    font-size: 18px;
    cursor: pointer;
    color: black;
    background-color: white;
    border-top-right-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;
  }
</style>
