<script>
  import { onDestroy } from "svelte";
  import FilesList from "../Component/FilesList.svelte";
  import { DirId } from "../Stores/DirectoryStore";
  export let dir = "";
  export let page = 1;
  export let filter = "";

  let curDir = dir;
  let unSub = DirId.subscribe(val => {
    curDir = val.mangas || dir;
  });
  $: console.log(curDir);
  onDestroy(unSub);
</script>

<FilesList title={'Mangas'} type="mangas" {filter} {page} dir={curDir} />
