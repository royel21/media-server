<script>
  import { createEventDispatcher } from "svelte";
  import apiUtils from "src/apiUtils";
  import FavoriteAction from "./FavoriteAction.svelte";
  import Icons from "src/icons/Icons.svelte";

  export let type;
  export let isFav;
  export let favClicked;
  export let favId;

  const dispath = createEventDispatcher();
  let thisEl = "";

  const removeFile = async (FolderId) => {
    socket.emit("file-work", { action: "renameFolder", data: { id: favId, fid: FolderId } });

    if (data.removed) {
      dispath("removeFile", FolderId);
    }
  };

  $: if (favClicked === thisEl) {
    if (thisEl.classList.contains("trash")) {
      removeFile(thisEl.closest(".file").id);
    }
  }
</script>

<span class="fav-icon">
  {#if type.startsWith("favorites")}
    <span class="trash" bind:this={thisEl}>
      <Icons name="trash" height="22px" color="rgba(252, 1, 1, 0.856)" />
    </span>
  {:else}
    <FavoriteAction {favClicked} {isFav} />
  {/if}
</span>

<style>
  .trash :global(svg:active) {
    pointer-events: none;
  }
</style>
