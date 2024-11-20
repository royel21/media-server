<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import Input from "src/admin/Component/Input.svelte";
  import apiUtils from "src/apiUtils";
  import Icons from "src/icons/Icons.svelte";
  import Dialog from "../Component/Dialog.svelte";

  export let hide;
  export let linkId = "";

  let nameList = [];
  let errors = [];
  let ref;
  let newNames = 0;

  const addRename = () => {
    if (!nameList.find((f) => !f.Name)) {
      nameList = [{ Id: "new-" + newNames++, Name: "", LinkName: linkId }, ...nameList];
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
    nameList = await apiUtils.get(["admin", "downloader", "exclude-list", linkId]);
  };

  const onKeyDown = (e) => {
    if (e.keyCode === 13 && e.ctrlKey) {
      submit(e);
      e.preventDefault();
      e.stopPropagation();
    }
    if (e.keyCode === 27) hide();
  };

  onMount(async () => {
    ref?.focus();
    loadItems();
  });
</script>

<Dialog id="modal-ex" cancel={hide} confirm={submit}>
  <h4 slot="modal-header">
    <span class="btn-add" on:click={addRename} on:keydown>
      <Icons name="squareplus" />
    </span>
    <span class="title">Chapter Exclude From Download</span>
  </h4>
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
  .title {
    position: relative;
    display: inline-block;
    font-weight: 600;
    font-size: 20px;
    text-align: center;
    top: -11px;
  }
  :global(#modal-ex .modal-body) {
    min-height: 300px;
  }
  :global(#modal-ex .icon-squareplus) {
    height: 35px;
    width: 45px;
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
    align-items: center;
  }

  .name-item span:first-child {
    flex-grow: 1;
    margin-right: 3px;
    padding: 2px;
  }

  @media screen and (max-width: 450px) {
    :global(#modal-ex) {
      width: 390px;
    }
  }
</style>
