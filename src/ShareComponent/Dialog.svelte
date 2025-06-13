<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { getEvent } from "./utils";

  const func = () => {};

  export let confirm = func;
  export let cancel = func;
  export let keydown = func;
  export let errors = [];
  export let id = "";
  export let btnOk = "Ok";
  export let btnCancer = "Cancel";
  export let canDrag = false;
  export let background = true;
  export let ref;

  let footerRef;

  let dragState = { x: 0, y: 0 };

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
    if (!dragState.drag) {
      const { clientX, clientY } = getEvent(e);
      const { x, y, width, height } = ref.getClientRects()[0];
      dragState = { cX: clientX - x, cY: clientY - y, drag: true, w: width, h: height };
    }
  };

  const stopDrag = () => {
    dragState.drag = false;
  };

  const move = (e) => {
    const { cX, cY, w, h, drag } = dragState;
    if (drag) {
      const { clientX, clientY } = getEvent(e);
      let left = clientX - cX;
      let top = clientY - cY;

      left = left + w > window.innerWidth ? window.innerWidth - w - 0 : left;

      left = left < 0 ? 0 : left;

      top = top + h > window.innerHeight ? window.innerHeight - h - 0 : top;
      top = top < 0 ? 0 : top;

      ref.style.left = left + "px";

      ref.style.top = top + "px";
    }
  };

  const onResize = () => {
    const bounds = ref.getBoundingClientRect();
    const leftPos = bounds.x + bounds.width;
    let dist = leftPos - window.innerWidth;
    if (dist > 0) {
      ref.style.left = Math.max(bounds.x - dist, 0) + "px";
    }
    const topPos = bounds.y + bounds.height;
    dist = topPos - window.innerHeight;
    if (dist > 0) {
      ref.style.top = Math.max(bounds.y - dist, 0) + "px";
    }
  };

  const listeners = [
    ["mouseleave", stopDrag],
    ["mousemove", move],
    ["mouseup", stopDrag],
    ["touchmove", move],
    ["touchend", stopDrag],
  ];

  onMount(() => {
    if (canDrag) {
      listeners.forEach((event) => document.addEventListener(event[0], event[1]));
    }
    if (!footerRef.textContent.trim()) {
      footerRef.textContent = "";
    }
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (canDrag) {
        listeners.forEach((event) => document.removeEventListener(event[0], event[1]));
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
  <div bind:this={ref} {id} class={`modal move-to ${clazz}`} transition:fade={{ duration: 200 }}>
    <form on:submit|preventDefault={confirm}>
      <div class="modal-header" class:drap={canDrag} on:mousedown={startDrag} on:touchstart|passive={startDrag}>
        <slot name="modal-header" />
      </div>
      <div class="modal-body"><slot /><slot name="modal-body" /></div>
      <p class="error">
        {#each errors as error}
          <div>{error}</div>
        {/each}
      </p>
      <slot name="modal-footer">
        <div class="modal-footer" bind:this={footerRef}>
          {#if btnOk}
            <button type="submit" class="btn">{btnOk}</button>
          {/if}
          {#if cancel && btnCancer}
            <button type="button" class="btn" on:click={cancel}>{btnCancer}</button>
          {/if}
        </div>
      </slot>
    </form>
  </div>
</div>

<style>
  .modal-container {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    min-height: 100%;
    height: 100%;
    width: 100%;
    z-index: 999;
    background-color: rgba(0, 0, 0, 0.3);
    overflow-y: auto;
  }
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
    min-width: 0;
    background-color: #343a40;
    background-clip: border-box;
    border-radius: 0.25rem;
    border: 1px solid white;
  }
  form {
    height: 100%;
  }
  .modal-header {
    padding: 4px 0;
    text-align: center;
    border-bottom: 1px solid;
    user-select: none;
  }
  .modal-footer:empty,
  .modal-body:empty,
  .modal-header:empty {
    display: none;
  }
  .modal-header.drap {
    cursor: grab;
  }
  .modal-body {
    padding: 15px 5px;
  }
  .modal-footer {
    display: flex;
    justify-content: center;
    border-top: 1px solid;
    text-align: center;
  }
  .btn {
    min-width: 75px;
    margin: 5px;
  }
</style>
