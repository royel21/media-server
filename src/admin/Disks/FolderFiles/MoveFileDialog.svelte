<script>
  import { onMount } from "svelte";
  import TextAreaInput from "src/ShareComponent/TextAreaInput.svelte";
  import Dialog from "src/ShareComponent/Dialog.svelte";
  import Select from "src/ShareComponent/Select.svelte";
  import Icons from "src/icons/Icons.svelte";
  import apiUtils from "src/apiUtils";

  import CheckBox from "../../Component/CheckBox.svelte";
  import Input from "../../Component/Input.svelte";

  export let hide;
  export let files;
  export let acept;
  export let content;

  let item = { Path: "homedir", overwrite: false };
  let errors = [];
  let dirs = [];
  let ditem = { Filter: "" };
  let filtered = [];
  const dDir = "dDir";
  const dPath = "dPath";

  const onConfirm = () => {
    errors = [];
    if (!item.Path) {
      return errors.push("Path can't be empty");
    }

    if (!/homedir|^(\/|[d-z]\:\\)/i.test(item.Path)) {
      return errors.push("Path must be a valid Path");
    }

    if (!/homedir|^\/(mnt|media)\/.*\/|^[d-z]\:\\/i.test(item.Path)) {
      return errors.push("Path must be on User Space");
    }

    loadDirs(item.Path, item.NewFolder);
    return acept({ files, ...item });
  };

  const loadDirs = async (dir, next, back) => {
    const result = await apiUtils.post("admin/directories/get-dirs", { dir, next, back });

    if (result.dirs) {
      item.Path = result.Path;
      localStorage.setItem(dPath, result.Path);
      dirs = result.dirs;
      onFilter();
    }
  };

  const onChange = ({ target: { value } }) => {
    localStorage.setItem(dDir, value);
    ditem.Path = value;
    loadDirs(value);
  };

  const loadPath = ({ target }) => {
    const next = target.textContent;
    loadDirs(item.Path, next);
  };

  const goBack = () => loadDirs(item.Path, "", true);

  const onKeydown = (e) => {
    if (e.keyCode === 13) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const onFilter = (e) => {
    const value = e?.target.value || "";
    const regx = RegExp(value, "i");
    filtered = dirs.filter((f) => regx.test(f));
  };

  onMount(() => {
    ditem.Path = localStorage.getItem(dDir) || content[0].Path;
    item.Path = localStorage.getItem(dPath) || ditem.Path;
    loadDirs(item.Path);
  });
</script>

<Dialog cancel={hide} confirm={onConfirm} {errors} canDrag={true}>
  <h4 slot="modal-header">Move <span>{files.length}</span> {files.length > 1 ? "Files" : "File"} to Path</h4>
  <div class="dir-list" slot="modal-body">
    <CheckBox label="Overwrite" key="overwrite" {item} />
    <Select item={ditem} label="Root" key="Path" options={content.map((d) => ({ ...d, Id: d.Path }))} {onChange} />
    <Input label="New Folder" key="NewFolder" {item} />
    <Input key="Filter" item={ditem} on:keydown={onKeydown} on:input={onFilter} onChange={onFilter} focus={true} />
    <TextAreaInput focus={true} label="Path" key="Path" {item} disabled={true} paste={false}>
      <span class="pre-paste" slot="btn-left" on:click={goBack} title="Copy Name">
        <Icons name="reply" color="#045cba" />
      </span>
    </TextAreaInput>
    <div class="folder-list">
      <ul class="list" on:click={loadPath}>
        {#each filtered as dir}
          <li class="list-item">{dir}</li>
        {/each}
      </ul>
    </div>
  </div>
</Dialog>

<style>
  .folder-list {
    height: 220px;
    overflow-y: auto;
  }
  .dir-list :global(.input-label) {
    width: 135px;
  }
  h4 span {
    color: firebrick;
  }

  ul {
    height: 5;
    width: 100%;
    overflow: auto;
    margin: 0;
    padding-bottom: 5px;
  }
  li {
    font-size: 0.9rem;
    padding: 3px 8px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  li:hover {
    cursor: pointer;
    text-decoration: underline;
    background-color: rgba(0, 0, 0, 0.1);
  }
  .pre-paste {
    position: absolute;
    left: 5px;
  }
</style>
