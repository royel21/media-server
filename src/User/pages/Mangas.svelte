<script>
    import { onDestroy } from "svelte";
    import FilesList from "../Component/FilesList.svelte";
    import { DirId } from "../Stores/DirectoryStore";
    export let dir = "";
    export let page = 1;
    export let filter = "";
</script>

<FilesList title={'Mangas'} type={`mangas/${dir}`} {filter} {page} />
