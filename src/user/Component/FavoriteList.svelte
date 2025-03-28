<script>
  import { createEventDispatcher } from "svelte";
  import apiUtils from "src/apiUtils";
  import FavoriteAction from "./FavoriteAction.svelte";
  import Icons from "src/icons/Icons.svelte";

  export let type;
  export let isFav;
  export let favId;

  const dispath = createEventDispatcher();
  let thisEl = "";

  const removeFile = async ({ target }) => {
    const FolderId = target.closest(".file").id;
    let data = await apiUtils.postFav("remove-folder", { id: favId, fid: FolderId });

    if (data.removed) {
      dispath("removeFile", FolderId);
    }
  };
</script>

{#if type.startsWith("favorites")}
  <span class="trash" bind:this={thisEl} on:click={removeFile}>
    <Icons name="trash" height="22px" color="rgba(252, 1, 1, 0.856)" />
  </span>
{:else}
  <FavoriteAction {isFav} />
{/if}

<style>
  .trash :global(svg:active) {
    pointer-events: none;
  }
</style>
