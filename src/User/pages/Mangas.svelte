<script>
  import { onMount } from "svelte";
  import { genUrl, getFilesPerPage, ProcessFile } from "../Utils";
  import { fileKeypress } from "../FileEvents";
  import Axios from "axios";
  import FilesList from "../Component/FilesList.svelte";
  export let page = 1;
  export let filter = "";
  let pageData = { files: [], Page: page, totalPages: 0, totalFiles: 0 };

  const loadContent = async (pg = 1, flt = "") => {
    let url = genUrl(pg, { order: "nu", items: 0 }, flt, "mangas");
    let resp = await Axios.get(url);
    pageData = { ...pageData, ...resp.data };
  };

  onMount(loadContent);

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

  $: console.log("params:", page);
</script>

<FilesList
  type="videos"
  {...pageData}
  {filter}
  on:filter={fileFilter}
  on:gotopage={goToPage}
  on:keydown={handleKeydown} />
