<script>
  import { onMount } from "svelte";
  import Axios from "axios";
  import { genUrl, getFilesPerPage } from "../Utils";
  import FilesList from "../Component/FilesList.svelte";

  let files = [];
  let page = 1;
  let totalFiles = 0;
  let totalPages = 0;
  onMount(async () => {
    let items = getFilesPerPage(3);
    let url = genUrl(1, { order: "nu", items }, "", "videos");
    console.log("items:", url);
    let resp = await Axios.get(url);
    console.log(resp.data);
    files = resp.data.files;
    totalFiles = resp.data.totalFiles;
    totalPages = resp.data.totalPages;
  });
</script>

<style>
  .files-list {
    display: flex;
    flex-wrap: wrap;
    height: calc(100% - 32px);
    overflow-y: auto;
  }
</style>

<div class="files-list">
  <FilesList type="videos" {files} />
</div>
