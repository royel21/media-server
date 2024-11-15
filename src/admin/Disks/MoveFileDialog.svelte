<script>
  import { onMount } from "svelte";
  import Dialog from "./Dialog.svelte";
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

  const onConfirm = () => {
    errors = [];
    if (!item.Path) {
      return errors.push("Path can't be empty");
    }

    if (!/^(\/|[d-z]\:\\)/i.test(item.Path)) {
      return errors.push("Path must be a valid Path");
    }

    if (!/(\\|\/)$/.test(item.Path)) {
      return errors.push('Path must end with "\\" or "/"');
    }

    if (!/^\/(mnt|media)\/.*\/|^[d-z]\:\\|\/home\/.*\/|^c:\\Users\\.*\\/i.test(item.Path)) {
      return errors.push("Path must be on User Space");
    }

    return acept({ files, ...item });
  };

  const loadDirs = async (dir, next, back) => {
    const result = await apiUtils.post("admin/directories/get-dirs", { dir, next, back });
    console.log(result, content);
    if (result.dirs) {
      item.Path = result.Path;
      dirs = result.dirs;
    }
  };

  const onChange = ({ target: { value } }) => loadDirs(value);

  const loadPath = ({ target }) => {
    const next = target.textContent;
    loadDirs(item.Path, next);
  };

  const goBack = () => loadDirs(item.Path, "", true);

  onMount(() => {
    loadDirs(content[0].Path);
  });
</script>

<Dialog cancel={hide} confirm={onConfirm} {errors}>
  <h4 slot="modal-header">Move <span>{files.length}</span> {files.length > 1 ? "Files" : "File"} to Path</h4>
  <div class="dir-list" slot="modal-body">
    <CheckBox key="Override" {item} />
    <Select {item} label="Root" key="Path" options={content.map((d) => ({ Id: d.Path, ...d }))} {onChange} />
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
    width: 100%;
  }
  li {
    padding: 3px 8px;
  }
  li {
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
