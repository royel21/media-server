<script>
  import Icons from "src/icons/Icons.svelte";

  export let item = {};
  export let key;
  export let label = "";
  export let onChange = (e) => {};
  export let ref;

  const onClick = () => {
    ref.checked = !item[key];
    ref.dispatchEvent(new Event("change"));
  };
  const handlerKey = ({ keyCode }) => {
    if (keyCode === 13 || keyCode === 32) {
      onClick();
    }
  };
</script>

<div class={"check-box input-control " + key}>
  <span class="input-label" on:click={onClick}>{label || key}</span>
  <label class="input" tabindex="0" on:keydown={handlerKey}>
    <Icons name={item[key] ? "check" : "times"} color="black" />
    <input name={key} type="checkbox" bind:this={ref} bind:checked={item[key]} on:change={onChange} />
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
    padding: 0 4px;
    min-width: max-content;
    user-select: none;
    cursor: pointer;
  }
</style>
