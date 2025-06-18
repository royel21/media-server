<script>
  import Icons from "src/icons/Icons.svelte";
  import { onMount } from "svelte";

  export let editing;
  export let saveTag;

  let ref;

  onMount(() => {
    ref.focus();
  });
</script>

<form on:submit|preventDefault={saveTag}>
  <input bind:this={ref} class="form-control" type="text" bind:value={editing.name} />
</form>
<span class="save-tag icon" on:click={saveTag}>
  <Icons name="save" color="black" box="0 0 512 512" />
</span>

<style>
  form {
    width: 100%;
  }
  .form-control {
    height: 38px;
    border-radius: 0;
    padding: 0 5px;
    border-left: none;
    vertical-align: middle;
  }
  .form-control:focus {
    color: #495057;
    background-color: #fff;
    border-color: transparent;
    outline: none;
    box-shadow: initial;
    border: initial;
  }
  .save-tag {
    position: absolute;
    top: 2px;
    right: 5px;
    z-index: 99;
  }
</style>
