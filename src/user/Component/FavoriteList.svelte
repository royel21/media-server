<script>
  import { createEventDispatcher } from "svelte";
  import apiUtils from "../../apiUtils";
  import FavoriteAction from "./FavoriteAction.svelte";

  export let type;
  export let isFav;
  export let favClicked;
  export let favId;

  const dispath = createEventDispatcher();
  let thisEl = "";

  const removeFile = async (FolderId) => {
    let data = await apiUtils.postFav("remove-folder", { id: favId, fid: FolderId });

    if (data.removed) {
      dispath("removeFile", FolderId);
    }
  };

  $: if (favClicked === thisEl) {
    if (thisEl.classList.contains("fa-trash-alt")) {
      removeFile(thisEl.closest(".file").id);
    }
  }
</script>

<span class="fav-icon">
  {#if type.startsWith("favorites")}
    <i class="fas fa-trash-alt text-danger" bind:this={thisEl} />
  {:else}
    <FavoriteAction {favClicked} {isFav} />
  {/if}
</span>
