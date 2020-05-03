<script>
  import FilesList from "../Component/FilesList.svelte";
  export let page = 1;
  export let filter = "";
</script>

<FilesList title={'Videos'} type="videos" {filter} {page} />
