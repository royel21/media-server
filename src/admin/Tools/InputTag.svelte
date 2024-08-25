<script>
  import Icons from "src/icons/Icons.svelte";
  import { onMount } from "svelte";

  export let tag;
  export let saveTag;

  let ref;

  onMount(() => {
    ref.focus();
  });
</script>

<form on:submit|preventDefault={saveTag}>
  <input bind:this={ref} class="form-control" type="text" bind:value={tag.name} />
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
  .save-tag {
    position: absolute;
    top: 2px;
    right: 5px;
    z-index: 99;
  }
</style>
