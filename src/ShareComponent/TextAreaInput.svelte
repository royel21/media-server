<script>
  import { onMount } from "svelte";
  import { handlerPaste } from "../admin/Component/util";

  export let file;
  export let item = "";
  export let key;
  export let label = "";
  export let style = "";
  export let rows = "";
  export let ref = null;
  export let focus = false;
  export let sept = "";
  export let disabled = false;
  export let paste = true;
  export let onChange = () => {};
  export let textwrap = true;

  onMount(() => {
    if (ref && focus) ref.focus();
  });

  const handler = async () => {
    paste && handlerPaste(file, key, sept, ref);
  };
  $: if (item) file = item;
</script>

<div class="input-control" {style}>
  <slot name="btn-left" />
  <div id="t-label" class="input-label" on:click={handler}>{label || key}</div>
  <slot name="btn-right" />
  <textarea
    bind:this={ref}
    name={key}
    class="input"
    {rows}
    bind:value={file[key]}
    on:change={onChange}
    on:blur={onChange}
    {disabled}
    class:textwrap={!textwrap}
  />
</div>

<style>
  .input-control {
    position: relative;
    flex-wrap: wrap;
  }
  #t-label {
    width: 100%;
    text-align: center;
    border-radius: 0;
    border-top-right-radius: 0.25rem;
    border-top-left-radius: 0.25rem;
    user-select: none;
  }
  .input-control .input {
    height: initial;
    font-weight: 700;
    border-top-right-radius: 0;
    border-bottom-left-radius: 0.25rem;
  }
  textarea {
    resize: vertical;
  }

  .textwrap {
    white-space: nowrap;
  }
</style>
