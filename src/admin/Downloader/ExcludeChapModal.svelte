<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import Input from "src/admin/Component/Input.svelte";
  import apiUtils from "src/apiUtils";
  import Icons from "src/icons/Icons.svelte";

  export let hide;
  export let linkId = "";

  let nameList = [];
  let error = "";
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
    error = result.error;
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

<div bind:this={ref} class="modal-container r-names" on:keydown={onKeyDown} tabindex="-1">
  <div class="modal card" transition:fade={{ duration: 200 }}>
    <div class="modal-header">
      <span class="btn-add" on:click={addRename} on:keydown>
        <Icons name="squareplus" />
      </span>
      <span class="title">Chapter Exclude From Download</span>
    </div>
    <form action="#" on:submit|preventDefault={submit}>
      <div class="modal-body">
        {#each nameList as name}
          <div class="name-item" id={name.Id}>
            <Input key="Name" item={name} />
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
  .title {
    position: relative;
    display: inline-block;
    font-weight: 600;
    font-size: 20px;
    text-align: center;
    top: -11px;
  }
  .modal {
    height: calc(100% - 100px);
    max-height: 350px;
    width: 370px;
    outline: none;
  }
  .modal-header {
    border-bottom: 1px solid;
    margin-bottom: 5px;
  }
  .r-names :global(.icon-squareplus) {
    height: 35px;
    width: 45px;
    top: -1px;
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
    height: calc(100% - 85px);
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

  @media screen and (max-width: 450px) {
    .modal {
      width: 390px;
    }
  }
</style>
