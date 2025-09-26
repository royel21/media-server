<script>
  import { onMount } from "svelte";
  import Input from "src/admin/Component/Input.svelte";
  import apiUtils from "src/apiUtils";
  import Icons from "src/icons/Icons.svelte";
  import Filter from "src/ShareComponent/Filter.svelte";
  import VirtualList from "svelte-tiny-virtual-list";
  import Dialog from "src/ShareComponent/Dialog.svelte";

  export let hide;
  let nameList = [];
  let filteredList = [];
  let error = "";
  let ref;
  let filter = "";
  let newNames = 0;
  let height = 0;
  let containerRef;

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

    if (result.error) {
      return (error = result.error);
    }

    hide(true);
  };

  const loadItems = async () => {
    nameList = await apiUtils.get(["admin", "downloader", "rename-list"]);
  };

  const onChange = ({ target }) => {
    const id = target.closest(".name-item").id;
    const found = nameList.find((n) => n.Id.toString() === id);
    if (found) found.updated = true;
  };

  const onResize = () => {
    if (containerRef) {
      height = containerRef.offsetHeight;
    }
  };

  window.removeEventListener("resize", onResize);

  onMount(async () => {
    ref?.focus();
    loadItems();
    height = containerRef?.offsetHeight;
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
    };
  });

  $: {
    const regx = RegExp(RegExp.escape(filter), "ig");
    filteredList = nameList.filter((f) => regx.test(f.AltName) || regx.test(f.Name));
  }
</script>

<div class="r-names">
  <Dialog confirm={submit} errors={[error]} btnOk="Ok" cancel={hide} canDrag={true} background={false}>
    <div slot="modal-header">
      <Filter on:change={onFilter}>
        <span class="btn-add" slot="pre-btn" on:click={addRename} on:keydown>
          <Icons name="squareplus" />
        </span>
      </Filter>
    </div>
    <div class="container" slot="modal-body" bind:this={containerRef}>
      <VirtualList {height} width="auto" itemSize={70} itemCount={filteredList.length}>
        <div slot="item" let:index let:style {style} class="name-item" id={filteredList[index].Id}>
          <span>
            <Input key="Name" item={filteredList[index]} {onChange} />
            <Input key="AltName" item={filteredList[index]} {onChange} />
          </span>
          <span on:click={onRemove} on:keydown><Icons name="trash" /></span>
        </div>
      </VirtualList>
      <span class="badge count">{filteredList.length}</span>
    </div>
  </Dialog>
</div>

<style>
  .r-names :global(.modal) {
    height: calc(100% - 80px);
    max-height: 550px;
    max-width: calc(100% - 30px);
    width: 750px;
    outline: none;
  }
  .r-names :global(.modal-header) {
    padding: 6px;
    border-bottom: 1px solid;
    margin-bottom: 5px;
  }
  .r-names :global(.modal-footer) {
    border-top: 1px solid;
  }
  .r-names :global(.c-filter) {
    height: initial;
    max-width: 100%;
  }
  .container {
    height: 100%;
  }

  .r-names :global(.icon-squareplus) {
    height: 32px;
    width: 37px;
    top: 2px;
  }
  .r-names :global(.icon-timescircle) {
    top: 7px;
  }
  .r-names :global(.icon-times) {
    width: 20px;
    right: -3px;
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
    padding-right: 20px;
  }
  .r-names :global(form) {
    height: calc(100% - 105px);
  }
  .r-names :global(.modal-body) {
    padding: 0 5px;
    height: 100%;
  }
  .name-item {
    display: flex;
    border: 1px solid;
    border-radius: 0.25rem;
    justify-content: space-between;
    align-items: center;
  }
  .count {
    position: absolute;
    left: 10px;
    bottom: 5px;
    font-size: 1.25rem;
    padding: 1px 10px;
  }
  .name-item span:first-child {
    flex-grow: 1;
    margin-right: 3px;
    padding: 2px;
  }
</style>
