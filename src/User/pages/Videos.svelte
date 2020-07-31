<script>
  import FilesList from "../Component/FilesList.svelte";
  export let page = 1;
  export let filter = "";
  export let dir = "";
</script>

<FilesList title={'Videos'} type="videos" {filter} {page} {dir} />
