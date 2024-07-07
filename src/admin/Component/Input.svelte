<script>
  import Icons from "src/icons/Icons.svelte";
  import { handlerPaste } from "./util";

  export let item = {};
  export let key = "";
  export let label = "";
  export let sept = "";
  export let onChange = (e) => {};
  let ref;
  const handler = async () => handlerPaste(item, key, sept, ref);
  const clear = () => {
    ref.value = "";
    ref.dispatchEvent(new Event("change"));
  };
</script>

<div class={"input-control " + key}>
  <span class="input-label" on:click={handler}>{label || key}</span>
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
