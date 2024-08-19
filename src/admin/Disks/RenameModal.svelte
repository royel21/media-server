<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import Input from "../Component/Input.svelte";
  export let hide;
  export let acept;
  export let data = "";
  let item = { ...data };
  let errors = [];
  let ref;

  onMount(async () => {
    ref?.focus();
  });

  const onConfirm = () => {
    errors = [];
    if (data.Name === item.Name) {
      return errors.push("Name Equal");
    }

    if (/:|\?|\*|<|>|\/|\\"/gi.test(item.Name)) {
      errors.push("Folder Name should't not have any of those Simbols");
      return errors.push(':  ?  * < >  / \\ " |');
    }
    return acept({ folder: data, Name: item.Name });
  };
</script>

<div bind:this={ref} class="modal-container" tabindex="-1" on:contextmenu|stopPropagation={() => {}}>
  <div class="modal card" transition:fade={{ duration: 200 }}>
    <div class="modal-header">
      <h4>Move Folder to Directory</h4>
    </div>

    <div class="modal-body">
      <span class="dir-list">
        <Input label="New Name" key="Name" {item} />
      </span>
      <p class="error">
        {#each errors as error}
          <div>{error}</div>
        {/each}
      </p>
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
    pointer-events: all;
  }
  .modal-body {
    padding: 15px 5px;
    border-top: 1px solid;
  }
  .modal-footer {
    border-top: 1px solid;
  }
</style>
