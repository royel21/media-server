<script>
  import FavoriteManager from "./FavoriteManager.svelte";
  import FilesList from "src/user/Component/FilesList.svelte";

  export let page = 1;
  export let filter = "";
  export let id;
  let type = `favorites/${id}`;

  $: type = `favorites/${id}`;
</script>

<FilesList title="Favorites" {type} filter={filter || ""} {page} {id}>
  <FavoriteManager {id} slot="controls" />
</FilesList>
