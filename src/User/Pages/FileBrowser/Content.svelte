<script>
  import { navigate } from "svelte-routing";

  import FilesList from "../../Component/FilesList.svelte";

  export let page = 1;
  export let filter = "";
  export let id = "";

  let segment = window.location.pathname.replace(/(^\/+|\/+$)/g, "").split("/");
  let type = `${segment[0]}/${segment[1]}/${id}`;

  let { pathname, folder } = localStorage.getObject("folder");
  localStorage.setItem("fileId", folder);

  const exitFolder = () => {
    navigate(pathname, { replace: true });
  };

  const onGenres = ({ currentTarget }) => {
    const g = currentTarget.textContent;
    const part = pathname.split("/").slice(1, 3);
    navigate(`/${part[0]}/${part[1]}/1/${g}`, { replace: true });
  };
</script>

<FilesList title={"Content"} {type} {filter} {page} {id} {onGenres}>
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
