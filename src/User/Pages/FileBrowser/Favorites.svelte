<script>
  import { FavoritesStores } from "../../Stores/FavoritesStores";
  import FavoriteManager from "./FavoriteManager.svelte";
  import FilesList from "../../Component/FilesList.svelte";

  export let page = 1;
  export let filter = "";
  export let id = $FavoritesStores[0].Id;

  let type = `favorites/${id}`;
  $: type = `favorites/${id}`;
</script>

<FilesList title="Favorites" {type} {filter} {page} {id}>
  <FavoriteManager {id} />
</FilesList>
