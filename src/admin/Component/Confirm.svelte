<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  export let text = "";
  export let cancel;
  export let acept;
  export let data = "";
  let ref;

  onMount(() => {
    ref?.focus();
  });

  const onConfirm = () => {
    acept(data);
    cancel();
  };
</script>

<div bind:this={ref} class="modal-container" tabindex="-1">
  <div class="modal card" transition:fade={{ duration: 200 }}>
    <div class="modal-header">
      <h4>Confirmation Dialog</h4>
    </div>

    <div class="modal-body">
      <p>Are you Sure want to remove this <strong>{text}</strong></p>
    </div>
    <div class="modal-footer">
      <button type="submit" class="btn" on:click={onConfirm}>Ok</button>
      <button type="button" class="btn" on:click={cancel}>Cancel</button>
    </div>
  </div>
</div>

<style>
  .modal {
    width: 400px;
    outline: none;
  }
  .modal-body {
    padding: 15px 5px;
  }
  strong {
    color: red;
  }
</style>
