<script>
  import { getContext, onMount } from "svelte";
  import Dialog from "src/ShareComponent/Dialog.svelte";
  import apiUtils from "src/apiUtils";
  import Icons from "src/icons/Icons.svelte";
  import Input from "../Component/Input.svelte";
  import Select from "src/ShareComponent/Select.svelte";
  import TextAreaInput from "src/ShareComponent/TextAreaInput.svelte";

  export let props = {};
  export let config;

  const socket = getContext("socket");
  let errors = [];
  let dirs = [];
  let ditem = { Filter: "" };
  let filtered = [];
  let content = [];
  const dDir = "dDir";
  const dPath = "dPath";
  let item = { Path: config[props.key] };
  const onConfirm = async () => {
    errors = [];
    if (!item.Path) {
      return errors.push("Path can't be empty");
    }

    if (!/homedir|^\/(mnt|media)\/.*\/|^[c-z]\:\\|\/home\/.*\//i.test(item.Path)) {
      return errors.push("Path must be on User Space");
    }

    if (item.NewFolder) {
      if (item.NewFolder.match(/\:|\||\?|"|\*|\/|\\/)) {
        errors.push("Folder Name Must not have those symbols");
        return errors.push('/ \\ : | ? " *');
      }
      const result = await apiUtils.post("admin/directories/create-path", item);
      item.Path = result.Path;
    }

    config[props.key] = item.Path;
    return props.hide();
  };

  const loadDirs = async (dir, next, back) => {
    const result = await apiUtils.post("admin/directories/get-dirs", { dir, next, back });

    if (result.dirs) {
      item.Path = result.Path;
      localStorage.setItem(dPath, result.Path);
      dirs = result.dirs;
      ditem.Filter = "";
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

  const onDiskdata = (data) => {
    content = data;
    const start = item.Path?.match(/^(\/.*\/|[A-Z]+\:\\)/);
    console.log(content);
    if (start) {
      const found = content.find((c) => c.Path.startsWith(start[0]));
      ditem.Path = found.Path;
    } else {
      ditem.Path = content[0].Path;
      item.Path = ditem.Path;
    }
    loadDirs(item.Path);
  };

  const onFilter = (e) => {
    const value = e?.target.value || "";
    const regx = RegExp(value, "i");
    filtered = dirs.filter((f) => regx.test(f));
  };

  onMount(() => {
    socket.on("disk-loaded", onDiskdata);
    socket.emit("load-disks");

    return () => {
      socket.off("disk-loaded", onDiskdata);
    };
  });
</script>

<Dialog id="def-folder" cancel={props.hide} confirm={onConfirm} {errors} btnOk="Acept">
  <h4 slot="modal-header">Choose {props.label} Path</h4>
  <div class="dir-list" slot="modal-body">
    <Select item={ditem} label="Root" key="Path" options={content.map((d) => ({ ...d, Id: d.Path }))} {onChange} />
    <Input label="New Folder" key="NewFolder" {item} />
    <Input key="Filter" item={ditem} on:keydown={onKeydown} on:input={onFilter} onChange={onFilter} focus={true} />
    <TextAreaInput focus={true} label={props.label} key="Path" {item} disabled={true} paste={false}>
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
  :global(#def-folder .modal-body) {
    padding: 4px;
  }

  .folder-list {
    height: 135px;
    overflow-y: auto;
  }
  .dir-list :global(.input-label) {
    width: 135px;
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
