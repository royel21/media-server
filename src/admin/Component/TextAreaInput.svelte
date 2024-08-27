<script>
  import { onMount } from "svelte";
  import { handlerPaste } from "./util";

  export let file;
  export let key;
  export let label = "";
  export let style = "";
  export let rows;
  export let ref = null;
  export let focus = false;
  export let sept = "";
  export let onChange = () => {};

  onMount(() => {
    if (ref && focus) ref.focus();
  });

  const handler = async () => handlerPaste(file, key, sept, ref);
</script>

<div class="input-control" {style}>
  <div id="t-label" for="Name" class="input-label" on:click={handler}>{label || key}</div>
  <textarea
    bind:this={ref}
    name={key}
    class="input"
    {rows}
    bind:value={file[key]}
    on:change={onChange}
    on:blur={onChange}
  />
</div>

<style>
  .input-control {
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
  .input::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  .input-control .input {
    height: initial;
    border-top-right-radius: 0;
    border-bottom-left-radius: 0.25rem;
  }
  textarea {
    resize: vertical;
  }
</style>
