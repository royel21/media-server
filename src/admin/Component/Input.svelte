<script>
  import Icons from "src/icons/Icons.svelte";
  import { handlerPaste } from "./util";
  import { onMount } from "svelte";

  export let item = {};
  export let key = "";
  export let label = "";
  export let sept = "";
  export let placeholder = " ";
  export let focus = false;
  export let type = "text";
  export let onChange = (e) => {};
  export let min = Number.MIN_SAFE_INTEGER;
  export let max = Number.MAX_SAFE_INTEGER;
  let ref;
  const handler = async () => {
    handlerPaste(item, key, sept, ref);
  };
  const clear = () => {
    ref.value = "";
    ref.dispatchEvent(new Event("change"));
  };

  onMount(() => {
    if (focus) ref.focus();
  });
</script>

<div class={"input-control " + key}>
  <span class="input-label" on:click={handler}>
    {label || key}
    <slot name="icon" />
  </span>
  {#if type === "date"}
    <input
      bind:this={ref}
      name={key}
      type="date"
      class="input"
      bind:value={item[key]}
      on:change={onChange}
      on:input
      {placeholder}
      on:keydown
    />
  {/if}
  {#if type === "number"}
    <input
      bind:this={ref}
      name={key}
      type="number"
      {min}
      {max}
      class="input"
      bind:value={item[key]}
      on:change={onChange}
      on:input
      {placeholder}
      on:keydown
    />
  {/if}
  {#if type === "text"}
    <input
      bind:this={ref}
      name={key}
      class="input"
      bind:value={item[key]}
      on:change={onChange}
      on:input
      {placeholder}
      on:keydown
    />
    <span class="clear" on:click={clear}><Icons name="times" /></span>
  {/if}
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
  input {
    padding: 0.2rem 1.2rem 0.2rem 0.2rem;
  }
</style>
