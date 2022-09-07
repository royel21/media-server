<script>
  import { navigate } from "svelte-routing";

  import FilesList from "../../Component/FilesList.svelte";

  export let page = 1;
  export let filter = "";
  export let id = "";

  let segment = window.location.pathname.replace(/(^\/+|\/+$)/g, "").split("/");
  let type = `${segment[0]}/${segment[1]}/${id}`;

  const exitFolder = () => {
    let folder = localStorage.getObject("folder");
    localStorage.setItem("fileId", folder.folder);
    navigate(folder.pathname, { replace: true });
  };
</script>

<FilesList title={"Content"} {type} {filter} {page} {id}>
  <div class="first-controls" slot="controls" on:click={exitFolder}>
    <i class="fas fa-arrow-circle-up" />
  </div>
</FilesList>

<style>
  div {
    pointer-events: all;
  }

  i {
    background-color: black;
    border-radius: 50%;
  }
</style>
