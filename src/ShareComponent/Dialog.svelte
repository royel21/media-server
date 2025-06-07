<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  export let cancel;
  export let confirm = () => {};
  export let errors = [];
  export let id = "";
  export let btnOk = "Ok";
  export let btnCancer = "Cancel";
  export let keydown = () => {};
  export let canDrag = false;
  export let background = true;

  let ref;

  let draState = { x: 0, y: 0 };

  let clazz = "";
  export { clazz as class };

  const handler = ({ target, currentTarget }) => {
    if (currentTarget === target) cancel();
  };

  const onKeydown = (e) => {
    if (e.keyCode === 27) cancel();
    keydown(e);
  };

  const startDrag = (e) => {
    if (!draState.drag) {
      const { clientX, clientY } = e;
      const { x, y, width, height } = ref.getClientRects()[0];
      draState = { cX: clientX - x, cY: clientY - y, drag: true, w: width, h: height };
    }
  };

  const stopDrag = () => {
    draState.drag = false;
  };

  const move = (e) => {
    const { cX, cY, w, h, drag } = draState;
    if (drag) {
      const { clientX, clientY } = e;
      let left = clientX - cX;
      let top = clientY - cY;

      left = left + w > window.innerWidth ? window.innerWidth - w - 2 : left;

      left = left < 0 ? 2 : left;
      if (document.webkitIsFullScreen) {
        top = top + h > window.innerHeight ? window.innerHeight - h - 2 : top;
        top = top < 0 ? 2 : top;
      } else {
        top = top + h > window.innerHeight - 39 ? window.innerHeight - h - 2 - 39 : top;
        top = top < 43 ? 45 : top;
      }

      ref.style.left = left + "px";

      ref.style.top = top + "px";
    }
  };

  onMount(() => {
    if (canDrag) {
      document.addEventListener("mouseleave", stopDrag);
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", stopDrag);
    }
    return () => {
      if (canDrag) {
        document.removeEventListener("mouseleave", stopDrag);
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", startDrag);
      }
    };
  });
</script>

<div
  class="modal-container"
  class:no-background={!background}
  tabindex="-1"
  on:contextmenu|stopPropagation={() => {}}
  on:keydown|stopPropagation={onKeydown}
  on:mousedown|stopPropagation={handler}
>
  <div bind:this={ref} {id} class={`modal card move-to ${clazz}`} transition:fade={{ duration: 200 }}>
    <form on:submit|preventDefault={confirm}>
      <div class="modal-header" class:drap={canDrag} on:mousedown={startDrag}>
        <slot name="modal-header" />
      </div>
      <div class="modal-body">
        <slot />
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
        {#if cancel && btnCancer}
          <button type="button" class="btn" on:click={cancel}>{btnCancer}</button>
        {/if}
      </div>
    </form>
  </div>
</div>

<style>
  .no-background {
    background-color: transparent;
    pointer-events: none;
  }
  .modal {
    position: absolute;
    width: 450px;
    outline: none;
    pointer-events: all;
    max-width: 93%;
    z-index: 401;
    padding: 0;
  }
  .modal-header {
    padding: 4px 0;
    text-align: center;
    border-bottom: 1px solid;
    user-select: none;
  }
  .modal-header.drap {
    cursor: grab;
  }
  .modal-body {
    padding: 15px 5px;
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
