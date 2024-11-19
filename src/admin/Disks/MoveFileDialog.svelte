<script>
  import { onMount } from "svelte";
  import Dialog from "../Component/Dialog.svelte";
  import Icons from "src/icons/Icons.svelte";
  import Select from "../Component/Select.svelte";
  import CheckBox from "../Component/CheckBox.svelte";
  import TextAreaInput from "../Component/TextAreaInput.svelte";
  import apiUtils from "src/apiUtils";

  export let hide;
  export let files;
  export let acept;
  export let content;

  let item = { Path: "/mnt/", overwrite: false };
  let errors = [];
  let dirs = [];
  let ditem = {};
  const dDir = "dDir";
  const dPath = "dPath";

  const onConfirm = () => {
    errors = [];
    if (!item.Path) {
      return errors.push("Path can't be empty");
    }

    if (!/^(\/|[d-z]\:\\)/i.test(item.Path)) {
      return errors.push("Path must be a valid Path");
    }

    if (!/^\/(mnt|media)\/.*\/|^[d-z]\:\\|\/home\/.*\/|^c:\\Users\\.*\\/i.test(item.Path)) {
      return errors.push("Path must be on User Space");
    }
    console.log(item);
    return acept({ files, ...item });
  };

  const loadDirs = async (dir, next, back) => {
    const result = await apiUtils.post("admin/directories/get-dirs", { dir, next, back });

    if (result.dirs) {
      item.Path = result.Path;
      localStorage.setItem(dPath, result.Path);
      dirs = result.dirs;
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

  onMount(() => {
    ditem.Path = localStorage.getItem(dDir) || content[0].Path;
    item.Path = localStorage.getItem(dPath) || ditem.Path;
    loadDirs(item.Path);
  });
</script>

<Dialog cancel={hide} confirm={onConfirm} {errors}>
  <h4 slot="modal-header">Move <span>{files.length}</span> {files.length > 1 ? "Files" : "File"} to Path</h4>
  <div class="dir-list" slot="modal-body">
    <CheckBox label="Overwrite" key="overwrite" {item} />
    <Select item={ditem} label="Root" key="Path" options={content.map((d) => ({ ...d, Id: d.Path }))} {onChange} />
    <TextAreaInput focus={true} label="Path" key="Path" {item} disabled={true} paste={false}>
      <span class="pre-paste" slot="btn-left" on:click={goBack} title="Copy Name">
        <Icons name="reply" color="#045cba" />
      </span>
    </TextAreaInput>
    <div class="folder-list">
      <ul class="list" on:click={loadPath}>
        {#each dirs as dir}
          <li class="list-item">{dir}</li>
        {/each}
      </ul>
    </div>
  </div>
</Dialog>

<style>
  .folder-list {
    height: 350px;
    overflow-y: auto;
  }
  .dir-list :global(.input-label) {
    width: 100px;
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
