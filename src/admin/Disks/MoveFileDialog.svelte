<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import Input from "../Component/Input.svelte";
  import CheckBox from "../Component/CheckBox.svelte";
  export let hide;
  export let files;
  export let acept;
  let item = { Path: "", overwrite: false };
  let errors = [];
  let ref;

  onMount(async () => {
    ref?.focus();
  });

  const onConfirm = () => {
    errors = [];
    if (!item.Path) {
      return errors.push("Path can't be empty");
    }

    if (!/^(\/|[d-z]\:\\)/i.test(item.Path)) {
      return errors.push("Path must be a valid Path");
    }

    if (!/(\\|\/)$/.test(item.Path)) {
      return errors.push('Path must end with "\\" or "/"');
    }

    if (!/^\/(mnt|media)\/.*\/|^[d-z]\:\\|\/home\/.*\/|^c:\\Users\\.*\\/i.test(item.Path)) {
      return errors.push("Path must be on User Space");
    }

    return acept({ files, ...item });
  };
</script>

<div bind:this={ref} class="modal-container" tabindex="-1" on:contextmenu|stopPropagation={() => {}}>
  <div class="modal card move-to" transition:fade={{ duration: 200 }}>
    <div class="modal-header">
      <h4>Move {files.length > 1 ? "Files" : "File"} to Path</h4>
    </div>

    <div class="modal-body">
      <span class="dir-list">
        <Input label="Path" key="Path" {item} />
        <CheckBox key="Override" {item} />
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
    width: 450px;
    outline: none;
    pointer-events: all;
    max-width: 95%;
  }
  .modal-body {
    padding: 15px 5px;
    border-top: 1px solid;
  }
  .modal-footer {
    border-top: 1px solid;
  }
  .move-to :global(.input-label) {
    width: 100px;
  }
</style>
