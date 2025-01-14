<script>
  import apiUtils from "src/apiUtils";
  import { onMount } from "svelte";
  import Dialog from "../../ShareComponent/Dialog.svelte";
  import InputControl from "./InputControl.svelte";
  export let hideCfg;
  export let user;
  let keys = [];

  const save = () => {
    apiUtils.post("admin/users/update-hotkeys", { keys });
    hideCfg();
  };

  onMount(async () => {
    const result = await apiUtils.admin(["users", "user", user.Id]);
    if (result.length) keys = result;
  });
</script>

<Dialog id="mu-config" cancel={hideCfg} confirm={save}>
  <h3 slot="modal-header">Hotkeys for {user.Name}</h3>
  <div class="body" slot="modal-body">
    {#each keys as item}
      <InputControl {item} />
    {/each}
  </div>
</Dialog>

<style>
  :global(#mu-config) {
    width: 530px;
  }
  :global(#mu-config .modal-body) {
    padding: 4px 0;
  }
  .body {
    height: 350px;
    overflow: auto;
  }
</style>
