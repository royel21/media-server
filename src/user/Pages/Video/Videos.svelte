<script>
  import FilesList from "src/user/Component/FilesList.svelte";
  export let page = 1;
  export let filter = "";
  export let dir = "";
</script>

<FilesList title={"Videos"} type={`videos/${dir || "0"}`} {filter} {page} id={dir} />
