<script>
  import { onMount } from "svelte";
  import Axios from "axios";
  import { genUrl, getFilesPerPage, ProcessFile } from "../Utils";
  import { fileKeypress } from "../FileEvents";
  import FilesList from "../Component/FilesList.svelte";

  let pageData = { files: [], Page: 1, totalPages: 0, totalFiles: 0 };
  let filter = "";
  export let params;
  console.log(params);
  onMount(async () => {
    let items = getFilesPerPage(3);
    let url = genUrl(1, { order: "nu", items }, "", "videos");
    console.log("items:", url);
    let resp = await Axios.get(url);
    console.log(resp.data);
    pageData = resp.data;
  });

  const handleKeydown = event => {
    console.log(event.keyCode);
    fileKeypress(
      event,
      pageData.page,
      pg => {
        console.log(pg);
      },
      ProcessFile
    );
  };
  const goToPage = pg => {
    pg = parseInt(pg.detail);
    let { totalPages } = pageData;
    if (pg < 1 || pg > totalPages) return;
    pageData.page = pg < 1 ? 1 : pg > totalPages ? totalPages : pg;
    loadContent(pg, filter);
  };
  const fileFilter = event => {
    filter = event.detail;
    loadContent(1, filter);
  };
</script>

<FilesList
  type="videos"
  {...pageData}
  {filter}
  on:filter={fileFilter}
  on:gotopage={goToPage}
  on:keydown={handleKeydown} />
