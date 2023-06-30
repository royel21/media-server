<script>
  import { FavoritesStores } from "../../Stores/FavoritesStores";
  import FavoriteManager from "./FavoriteManager.svelte";
  import FilesList from "../../Component/FilesList.svelte";

  export let page = 1;
  export let filter = "";
  export let id;
  let type = `favorites/${id}`;

  $: type = `favorites/${id}`;
</script>

<FilesList title="Favorites" {type} {filter} {page} {id}>
  <FavoriteManager {id} slot="controls" />
</FilesList>
