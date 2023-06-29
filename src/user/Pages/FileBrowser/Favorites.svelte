<script>
  import { FavoritesStores } from "../../Stores/FavoritesStores";
  import FavoriteManager from "./FavoriteManager.svelte";
  import FilesList from "../../Component/FilesList.svelte";

  export let page = 1;
  export let filter = "";
  export let id;
  let favId = id || $FavoritesStores[0].Id;
  let type = `favorites/${favId}`;

  $: favId = id || favId;
  $: type = `favorites/${favId}`;
  $: console.log("Id", id, "firstfav", $FavoritesStores[0].Id, favId);
</script>

<FilesList title="Favorites" {type} {filter} {page} id={favId}>
  <FavoriteManager id={favId} slot="controls" />
</FilesList>
