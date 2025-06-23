<script>
  import apiUtils from "src/apiUtils";
  import { onMount, getContext } from "svelte";
  import Input from "../Component/Input.svelte";

  import { setMessage } from "../Store/MessageStore";
  import { formatDate } from "../Downloader/utils";
  import ChoosePath from "./ChoosePath.svelte";
  import TextAreaInput from "src/ShareComponent/TextAreaInput.svelte";
  const socket = getContext("socket");
  //clean-images
  let config = {};
  let defConfig = {};
  let errors = [];
  let showChoosePath = false;

  const onUpdateServer = () => {
    socket.emit("update-server", {});
  };
  const rebuildAndReload = () => {
    socket.emit("update-server", { reload: true });
  };

  const hideChooser = () => {
    showChoosePath = false;
  };

  const onShowChoosePath = ({ currentTarget }) => {
    const key = currentTarget.id;
    const label = currentTarget.querySelector(".input-label").textContent;
    showChoosePath = {
      key,
      label,
      hide: hideChooser,
    };
  };

  const saveConfig = async () => {
    errors = [];
    if (!config.AdminPassword) {
      errors.push("Admin Default Password can't be empty");
    }
    if (!config.UserPassword) {
      errors.push("User Default Password can't be empty");
    }
    if (!config.LoginTimeout) {
      errors.push("Login Time Out can't be empty");
    }
    if (!config.LoginLockCount) {
      errors.push("Login Lock Count can't be empty");
    }

    if (errors.length) return (errors = errors);

    const { UserPassword, AdminPassword } = config;
    const cfg = { ...config, UserPassword: btoa(UserPassword), AdminPassword: btoa(AdminPassword) };

    const result = await apiUtils.post("admin/app-config/save", cfg);

    if (result.valid) {
      return setMessage({ msg: `${formatDate(new Date())} App Config Save` });
    }
  };
  const handler = ({ target: { name, value } }) => {
    config[name] = value;
  };

  const HandleRemoveInName = ({ target: { value } }) => {
    config.RemoveInName = [...new Set(value.split("|"))].join("|");
  };

  const onReset = () => {
    config = { ...defConfig };
  };

  onMount(async () => {
    const result = await apiUtils.get(["admin", "app-config"]);
    if (result.config) {
      const { UserPassword, AdminPassword } = result.config;
      config = { ...result.config, UserPassword: atob(UserPassword), AdminPassword: atob(AdminPassword) };
      defConfig = { ...config };
    }
  });

  document.title = "Tools";
  const textAreaProp = { label: "Remove Text In Folder Name ~ Using RegExp", key: "RemoveInName", rows: "3" };
</script>

{#if showChoosePath}
  <ChoosePath props={showChoosePath} bind:config />
{/if}

<div class="t-container">
  <div class="button-bar">
    <button class="btn" on:click={onUpdateServer}>Build App</button>
    <button class="btn" on:click={rebuildAndReload}>Reload Server</button>
  </div>
  <div class="app-content">
    <h4>App Default Config</h4>
    <div class="app-config">
      <div class="app-inputs">
        <Input label="Admin Def Password" key="AdminPassword" item={config} onChange={handler} />
        <Input label="User Def Password" key="UserPassword" item={config} onChange={handler} />
        <Input label="Time Out" key="LoginTimeout" item={config} onChange={handler} />
        <Input label="Lock Count" key="LoginLockCount" item={config} onChange={handler} />
        <TextAreaInput {...textAreaProp} item={config} onChange={HandleRemoveInName} paste={true} sept=";" />
        <div class="input-control" id="CoverPath" on:click={onShowChoosePath}>
          <span class="input-label">Cover Path</span>
          <input class="input" value={config.CoverPath || "Click to Choose"} disabled />
        </div>
        <div class="input-control" id="MangaPath" on:click={onShowChoosePath}>
          <span class="input-label">Manga Path</span>
          <input class="input" value={config.MangaPath || "Click to Choose"} disabled />
        </div>
        <div class="input-control" id="AdultPath" on:click={onShowChoosePath}>
          <span class="input-label">Adult Path</span>
          <input class="input" value={config.AdultPath || "Click to Choose"} disabled />
        </div>
        {#each errors as error}
          <div class="error">{error}</div>
        {/each}
      </div>
      <div class="ctl-title">
        <button class="btn btn2" on:click={onReset}>Reset</button>
        <button class="btn" on:click={saveConfig}>Save</button>
      </div>
    </div>
  </div>
</div>

<style>
  h4 {
    text-align: center;
    margin-bottom: 5px;
  }
  .t-container {
    height: calc(100% - 6px);
    overflow: hidden;
  }
  .ctl-title {
    position: relative;
    padding: 5px 0;
    display: flex;
    justify-content: center;
  }
  .ctl-title .btn:nth-child(2) {
    margin: 0 8px;
  }
  .button-bar {
    padding-bottom: 10px;
    margin-bottom: 10px;
    border-bottom: 1px solid;
  }
  .app-content {
    height: calc(100% - 95px);
  }

  .app-config {
    text-align: center;
    max-width: 650px;
    margin: 0 auto;
    border: 1px solid white;
    border-radius: 0.25rem;
    padding: 5px;
    height: 100%;
    overflow: hidden;
    padding-bottom: 15px;
  }
  .app-inputs {
    height: calc(100% - 30px);
    overflow-y: auto;
  }

  .app-config :global(.input-label) {
    width: 130px;
    text-align: right;
  }
  .input-control {
    cursor: pointer;
  }
  .input {
    pointer-events: none;
  }
</style>
