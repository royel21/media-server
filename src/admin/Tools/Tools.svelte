<script>
  import apiUtils from "src/apiUtils";
  import { onMount, getContext } from "svelte";
  import Input from "../Component/Input.svelte";
  import { setMessage } from "../Store/MessageStore";
  import { formatDate } from "../Downloader/utils";
  const socket = getContext("socket");
  //clean-images
  let config = {};
  let defConfig = {};
  let errors = [];

  const onUpdateServer = () => {
    socket.emit("update-server", {});
  };
  const rebuildAndReload = () => {
    socket.emit("update-server", { reload: true });
  };

  const saveConfig = async () => {
    errors = [];
    console.log("save config", config);
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

    const result = await apiUtils.post("/admin/app-config/save", config);

    if (result.valid) {
      return setMessage({ msg: `${formatDate(new Date())} App Config Save` });
    }
  };
  const handler = ({ target: { name, value } }) => {
    config[name] = value;
  };

  const onReset = () => {
    config = { ...defConfig };
  };

  onMount(async () => {
    const result = await apiUtils.get(["admin", "app-config"]);
    if (result.config) {
      config = { ...result.config };
      defConfig = { ...result.config };
    }
  });

  document.title = "Tools";
</script>

<div class="t-container">
  <div class="button-bar">
    <button class="btn" on:click={onUpdateServer}>Build App</button>
    <button class="btn" on:click={rebuildAndReload}>Reload Server</button>
  </div>
  <div class="app-content">
    <div class="app-config">
      <div class="ctl-title">
        <button class="btn btn2" on:click={onReset}>Reset</button>
        <button class="btn" on:click={saveConfig}>Save</button>
        <span>App Default Config</span>
      </div>
      <Input label="Admin Def Password" key="AdminPassword" item={config} onChange={handler} />
      <Input label="User Def Password" key="UserPassword" item={config} onChange={handler} />
      <Input label="Time Out" key="LoginTimeout" item={config} onChange={handler} />
      <Input label="Lock Count" key="LoginLockCount" item={config} onChange={handler} />
      {#each errors as error}
        <div class="error">{error}</div>
      {/each}
    </div>
  </div>
</div>

<style>
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
    height: calc(100% - 55px);
  }
  .app-config {
    text-align: center;
    max-width: 600px;
    margin: 0 auto;
    border: 1px solid white;
    border-radius: 0.25rem;
    padding: 5px;
    height: 100%;
    padding-bottom: 15px;
    overflow-y: auto;
  }
  .app-config :global(.input-label) {
    width: 180px;
  }
</style>
