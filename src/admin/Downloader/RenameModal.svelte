<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import Input from "src/admin/Component/Input.svelte";
  import apiUtils from "src/apiUtils";
  import Icons from "src/icons/Icons.svelte";
  import Filter from "src/ShareComponent/Filter.svelte";

  export let hide;
  let nameList = [];
  let filteredList = [];
  let error = "";
  let ref;
  let filter = "";
  let newNames = 0;

  const addRename = () => {
    if (!nameList.find((f) => !f.Name || !f.AltName)) {
      nameList = [{ Id: "new-" + newNames++, Name: "", AltName: "" }, ...nameList];
    }
  };

  const onRemove = async ({ target }) => {
    const id = target.closest(".name-item").id;
    let result = { valid: false };
    if (/^new-/.test(id)) result.valid = true;

    if (!result.valid && id) {
      result = await apiUtils.get(["admin", "downloader", "remove-altname", id]);
    }
    if (result.valid) {
      nameList = nameList.filter((fn) => fn.Id.toString() !== id);
    }
  };

  const onFilter = ({ detail }) => {
    filter = decodeURI(detail);
  };

  const submit = async (e) => {
    const result = await apiUtils.post("admin/downloader/add-altname", { nameList: nameList.filter((n) => n.updated) });
    error = result.error;
    if (result.valid) hide(true);
  };

  const loadItems = async () => {
    nameList = await apiUtils.get(["admin", "downloader", "rename-list"]);
  };

  const onChange = ({ target }) => {
    const id = target.closest(".name-item").id;
    const found = nameList.find((n) => n.Id.toString() === id);
    if (found) found.updated = true;
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

  $: filteredList = nameList.filter((f) => f.AltName.includes(filter) || f.Name.includes(filter));
</script>

<div bind:this={ref} class="modal-container r-names" on:keydown={onKeyDown} tabindex="-1">
  <div class="modal card" transition:fade={{ duration: 200 }}>
    <div class="modal-header">
      <Filter on:filter={onFilter} {filter}>
        <span class="btn-add" slot="pre-btn" on:click={addRename} on:keydown>
          <Icons name="squareplus" />
        </span>
      </Filter>
    </div>
    <form action="#" on:submit|preventDefault={submit}>
      <div class="modal-body">
        {#each filteredList as name}
          <div class="name-item" id={name.Id}>
            <span>
              <Input key="Name" item={name} {onChange} />
              <Input key="AltName" item={name} {onChange} />
            </span>
            <span on:click={onRemove} on:keydown><Icons name="trash" /></span>
          </div>
        {/each}
      </div>
      <div class="error">{error || ""}</div>
      <div class="modal-footer">
        <button type="submit" class="btn">Save</button>
        <button type="button" class="btn" on:click={hide}>Cancel</button>
      </div>
    </form>
  </div>
</div>

<style>
  .modal {
    height: calc(100% - 80px);
    max-height: 550px;
    max-width: calc(100% - 30px);
    width: 650px;
    outline: none;
  }
  .modal-header {
    padding: 6px 0;
    border-bottom: 1px solid;
    margin-bottom: 5px;
  }
  .r-names :global(.c-filter) {
    height: initial;
    max-width: 100%;
  }

  .r-names :global(.c-filter .icon-timescircle) {
    top: 7px;
  }

  .r-names :global(.icon-squareplus) {
    height: 32px;
    width: 37px;
    top: 2px;
  }
  .r-names :global(.icon-times) {
    width: 20px;
    right: -3px;
  }
  .r-names :global(.input-control .input) {
    padding-right: 18px;
  }
  .r-names :global(.input-label) {
    padding-left: 0.35rem;
    text-align: left;
    width: 110px;
  }
  .r-names :global(.input-control) {
    margin-bottom: 2px;
  }
  .r-names :global(input) {
    margin: 0;
  }
  .r-names form {
    height: calc(100% - 95px);
  }
  .r-names .modal-body {
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
</style>
