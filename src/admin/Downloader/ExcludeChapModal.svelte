<script>
  import { onMount } from "svelte";
  import Input from "src/admin/Component/Input.svelte";
  import apiUtils from "src/apiUtils";
  import Icons from "src/icons/Icons.svelte";
  import Dialog from "../../ShareComponent/Dialog.svelte";

  export let hide;
  export let link;

  let nameList = [];
  let errors = [];
  let ref;
  let newNames = 0;

  const addRename = () => {
    if (!nameList.find((f) => !f.Name)) {
      nameList = [{ Id: "new-" + newNames++, Name: "", LinkName: link.Name }, ...nameList];
    }
  };

  const onRemove = async ({ target }) => {
    const id = target.closest(".name-item").id;
    let result = { valid: false };
    if (/^new-/.test(id)) result.valid = true;

    if (!result.valid && id) {
      result = await apiUtils.get(["admin", "downloader", "remove-exclude", id]);
    }
    if (result.valid) {
      nameList = nameList.filter((fn) => fn.Id.toString() !== id);
    }
  };

  const submit = async (e) => {
    const result = await apiUtils.post("admin/downloader/add-exclude", { nameList });
    if (errors) errors = [result.error];
    if (result.valid) hide(true);
  };

  const loadItems = async () => {
    const result = await apiUtils.get(["admin", "downloader", "exclude-list", link.Id]);
    if (result?.length) {
      nameList = result;
    }
  };

  onMount(async () => {
    ref?.focus();
    loadItems();
  });
</script>

<Dialog id="modal-ex" cancel={hide} confirm={submit}>
  <div class="control" slot="modal-header">
    <span class="btn-add" on:click={addRename} on:keydown>
      <Icons name="squareplus" box="0 0 512 512" />
    </span>
    <span class="title">Chapter Exclude From Download</span>
  </div>
  <span slot="modal-body">
    {#each nameList as name}
      <div class="name-item" id={name.Id}>
        <Input key="Name" item={name} />
        <span on:click={onRemove} on:keydown><Icons name="trash" /></span>
      </div>
    {/each}
  </span>
</Dialog>

<style>
  .control {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .title {
    position: relative;
    font-weight: 600;
    font-size: 18px;
    text-align: center;
  }
  :global(#modal-ex .modal-body) {
    min-height: 300px;
  }
  .btn-add {
    position: absolute;
    top: 5px;
    left: 5px;
  }

  .btn-add :global(.icon-squareplus) {
    height: 28px;
    width: 28px;
    top: -1px;
  }
  :global(#modal-ex .input-label) {
    padding-left: 0.35rem;
    text-align: left;
    width: 110px;
  }
  :global(#modal-ex .input-control) {
    margin-bottom: 2px;
  }
  :global(#modal-ex input) {
    margin: 0;
  }
  :global(#modal-ex form) {
    height: calc(100% - 85px);
  }
  :global(.modal-ex .modal-body) {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .name-item {
    display: flex;
    border: 1px solid;
    border-radius: 0.25rem;
    justify-content: space-between;
    margin-bottom: 5px;
    height: 32px;
    background-color: white;
  }

  .name-item :global(div:first-child) {
    flex-grow: 1;
    margin-right: 5px;
  }

  @media screen and (max-width: 450px) {
    :global(#modal-ex) {
      width: 390px;
    }
  }
</style>
