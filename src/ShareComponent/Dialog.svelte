<script>
  import { fade } from "svelte/transition";
  export let cancel;
  export let confirm = () => {};
  export let errors = [];
  export let id = "";
  export let btnOk = "Ok";
  export let btnCancer = "Cancel";

  let clazz = "";
  export { clazz as class };

  const handler = ({ target, currentTarget }) => {
    if (currentTarget === target) cancel();
  };

  const onKeydown = ({ keyCode }) => {
    if (keyCode === 27) cancel();
  };
</script>

<div
  class="modal-container"
  tabindex="-1"
  on:contextmenu|stopPropagation={() => {}}
  on:keydown|stopPropagation={onKeydown}
  on:click|stopPropagation={handler}
>
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
        {#if btnOk}
          <button type="submit" class="btn">{btnOk}</button>
        {/if}
        {#if cancel}
          <button type="button" class="btn" on:click={cancel}>{btnCancer}</button>
        {/if}
      </div>
    </form>
  </div>
</div>

<style>
  .modal {
    width: 450px;
    outline: none;
    pointer-events: all;
    max-width: 93%;
    z-index: 401;
    padding: 0;
  }
  .modal-body {
    padding: 15px 5px;
    border-top: 1px solid;
  }
  .modal-footer {
    border-top: 1px solid;
    text-align: center;
  }
  .btn {
    min-width: 75px;
    margin: 5px;
  }
</style>
