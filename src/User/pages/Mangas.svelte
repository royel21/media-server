<script>
  import { onMount } from "svelte";
  import { genUrl, getFilesPerPage, ProcessFile } from "../Utils";
  import { fileKeypress } from "../FileEvents";
  import Axios from "axios";
  import FilesList from "../Component/FilesList.svelte";

  let files = [];
  let page = 1;
  let totalFiles = 0;
  let totalPages = 0;
  onMount(async () => {
    let url = genUrl(1, { order: "nu", items: 0 }, "", "mangas");
    console.log("items:", url);
    let resp = await Axios.get(url);
    files = resp.data.files;
    totalFiles = resp.data.totalFiles;
    totalPages = resp.data.totalPages;
  });

  const handleKeydown = event => {
    console.log(event.keyCode);
    fileKeypress(
      event,
      page,
      pg => {
        console.log(pg);
      },
      ProcessFile
    );
  };
</script>

<style>
  .files-list {
    display: flex;
    flex-wrap: wrap;
    height: calc(100% - 32px);
    overflow-y: auto;
  }
</style>

<div class="files-list" on:keydown={handleKeydown}>
  <FilesList type="mangas" {files} />
</div>
