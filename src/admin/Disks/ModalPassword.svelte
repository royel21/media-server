<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import Input from "../Component/Input.svelte";
  export let hide;
  export let acept;
  export let data = "";
  let item = { pass: "" };
  let ref;

  onMount(async () => {
    ref?.focus();
  });

  const onConfirm = () => {
    return acept({ folder: data, ...item });
  };
</script>

<div bind:this={ref} class="modal-container" tabindex="-1">
  <div class="modal card" transition:fade={{ duration: 200 }}>
    <div class="modal-header">
      <h4>Password if needed or left empty</h4>
    </div>

    <div class="modal-body">
      <span class="dir-list">
        <Input label="Password" key="pass" {item} />
      </span>
    </div>
    <div class="modal-footer">
      <button type="submit" class="btn" on:click={onConfirm}>Ok</button>
      <button type="button" class="btn" on:click={hide}>Cancel</button>
    </div>
  </div>
</div>

<style>
  .modal {
    width: 395px;
    outline: none;
  }
  .modal-body {
    padding: 15px 5px;
    border-top: 1px solid;
  }
  .modal-footer {
    border-top: 1px solid;
  }
</style>
