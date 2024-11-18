<script>
  import { fade } from "svelte/transition";
  export let cancel;
  export let confirm;
  export let errors = [];
  export let id = "";
  export let btnOk = "Ok";

  let clazz = "";
  export { clazz as class };
</script>

<div class="modal-container" tabindex="-1" on:contextmenu|stopPropagation={() => {}} on:keydown|stopPropagation>
  <div {id} class={`modal card move-to ${clazz}`} transition:fade={{ duration: 200 }}>
    <form on:submit|preventDefault={confirm}>
      <div class="modal-header">
        <slot name="modal-header" />
      </div>
      <div class="modal-body">
        <slot name="modal-body" />
        <p class="error">
          {#each errors as error}
            <div>{error}</div>
          {/each}
        </p>
      </div>
      <div class="modal-footer">
        <button type="submit" class="btn">{btnOk}</button>
        <button type="button" class="btn" on:click={cancel}>Cancel</button>
      </div>
    </form>
  </div>
</div>

<style>
  .modal {
    width: 450px;
    outline: none;
    pointer-events: all;
    max-width: 95%;
    z-index: 401;
  }
  .modal-body {
    padding: 15px 5px;
    border-top: 1px solid;
  }
  .modal-footer {
    border-top: 1px solid;
  }
</style>
