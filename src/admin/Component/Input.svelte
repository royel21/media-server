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
  export let paste = true;
  export let onChange = (e) => {};
  export let min = Number.MIN_SAFE_INTEGER;
  export let max = Number.MAX_SAFE_INTEGER;
  export let ref;

  const handler = async () => {
    if (paste) {
      const text = await handlerPaste(item, key, sept, ref);
      if (type === "date" && /\d+/.test(text)) {
        ref.value = `${text}-01-01`;
        ref.dispatchEvent(new Event("change"));
      }
    }
  };
  const clear = () => {
    ref.value = "";
    ref.dispatchEvent(new Event("change"));
  };

  onMount(() => {
    if (focus) ref.focus();
  });
</script>

<div class={`input-control ${key}`}>
  <span class="input-label" on:click={handler}>
    <slot name="icon">{label || key}</slot>
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
    padding: 0 0.25rem;
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
