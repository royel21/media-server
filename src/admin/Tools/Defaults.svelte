<script>
  import { onMount } from "svelte";
  import Input from "../Component/Input.svelte";
  import apiUtils from "src/apiUtils";
  let defaults = {};
  const onChange = () => {};

  onMount(async () => {});
</script>

<div>
  <Input label="Download Path" key="DownloadDir" item={defaults} {onChange} />
  <Input label="Cover Path" key="ImagesDir" item={defaults} {onChange} />
  <Input label="Backup Path" key="BackupDir" item={defaults} {onChange} />
</div>
