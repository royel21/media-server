<script>
  import FilesList from "src/user/Component/FilesList.svelte";

  export let dir = "";
  export let page = 1;
  export let filter = "";
</script>

<FilesList title={"Mangas"} type={`mangas/${dir}`} {filter} {page} id={dir} />
