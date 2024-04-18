<script>
  import Icons from "src/icons/Icons.svelte";

  export let item;
  export let key;
  export let label;
  let clazz;
  export { clazz as class };
  export let onChange = (e) => {};
  let ref;
  const handler = async () => {
    let text = await navigator.clipboard?.readText();
    if (text) {
      ref.value = text;
      ref.dispatchEvent(new Event("change"));
    }
  };
  const clear = () => {
    ref.value = "";
    ref.dispatchEvent(new Event("change"));
  };
</script>

<div class={"input-control " + clazz}>
  <span class="input-label" on:click={handler} on:keydown={() => {}}>{label || key}</span>
  <input bind:this={ref} name={key} class="input" bind:value={item[key]} on:change={onChange} placeholder=" " />
  <span class="clear" on:click={clear}><Icons name="times" /></span>
</div>

<style>
  .input-control {
    position: relative;
  }
  span {
    user-select: none;
  }
  .clear {
    display: none;
    position: absolute;
    right: 0;
    font-size: 14px;
  }
  input:not(:placeholder-shown) + .clear {
    display: initial;
  }
</style>
