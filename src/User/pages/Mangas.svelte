<script>
  import FilesList from "../Component/FilesList.svelte";
  export let page = 1;
  export let filter = "";
  let isClicked;
</script>

<FilesList title={'Mangas'} type="mangas" {filter} {page} />
