<script>
  import { sortByName } from "@share/utils";
  import { onMount } from "svelte";
  import apiUtils from "src/apiUtils";
  import ModalUser from "./ModalUser.svelte";
  import Icons from "src/icons/Icons.svelte";
  import ModalUserConfig from "./ModalUserConfig.svelte";

  let users = [];
  let foundUser;
  let error = "";
  let showConfig = false;

  const hideModal = () => (foundUser = false);

  const saveEdit = ({ target }) => {
    foundUser = { ...users.find((u) => u.Id === target.closest("tr")?.id) } || {};
  };

  const removeUser = async ({ target }) => {
    let user = users.find((u) => u.Id === target.closest("tr")?.id);
    const data = await apiUtils.post("admin/users/remove", user);
    if (data.removed) {
      users = users.filter((u) => u.Id !== user.Id);
    } else {
      error = data.msg;
    }
  };

  const updateUsers = ({ detail: user }) => {
    //Filter users
    let filteredUsers = users.filter((u) => u.Id !== user.Id);
    //Add and sort users
    users = [...filteredUsers, user].sort(sortByName);
    hideModal();
  };

  const onShowConfig = ({ target }) => {
    showConfig = users.find((u) => u.Id === target.closest("tr")?.id);
  };

  onMount(async () => {
    const data = await apiUtils.admin(["users"]);
    if (data.users) {
      users = data.users;
    }
  });

  $: if (error) {
    setTimeout(() => {
      error = "";
    }, 5000);
  }

  const hideCfg = () => (showConfig = false);
  document.title = "Users";
</script>

{#if foundUser}
  <ModalUser {foundUser} on:closeModal={hideModal} on:updateusers={updateUsers} />
{/if}

{#if showConfig}
  <ModalUserConfig {hideCfg} user={showConfig} />
{/if}
<div id="u-manager" class="card bg-dark manager">
  <div class="remove-error" on:click={() => (error = "")}>{error}</div>
  <div class="u-controls">
    <span class="btn" on:click={saveEdit}>
      <Icons name="userplus" />
    </span>
    <h3 class="text-center">Users Manager</h3>
  </div>
  <table class="table table-dark table-hover table-bordered">
    <thead>
      <tr>
        <th>Actions</th>
        <th>Name</th>
        <th>Role</th>
        <th>State</th>
        <th class="lo-count">Login Count</th>
        <th>Adult</th>
      </tr>
    </thead>
    <tbody>
      {#each users as user}
        <tr id={user.Id} key={user.Name}>
          <td>
            <span class="u-edit" on:click={saveEdit}>
              <Icons name="edit" color="rgb(37, 140, 209)" />
            </span>
            <span class="u-remove ml-2" on:click={onShowConfig}>
              <Icons name="cog" color="lightgray" />
            </span>
            <span class="u-remove ml-2" on:click={removeUser}>
              <Icons name="trash" color="rgba(252, 1, 1, 0.856)" />
            </span>
          </td>
          <td>{user.Name}</td>
          <td>{user.Role}</td>
          <td>{user.State}</td>
          <td class="lo-count">{user.LoginCount}</td>
          <td>{user.AdultPass ? "true" : "false"}</td>
        </tr>
      {/each}
      <tr class="only">
        <td colSpan="5">Loading Data From Server</td>
      </tr>
    </tbody>
  </table>
</div>

<style>
  .remove-error {
    position: absolute;
    top: 10px;
    left: calc(50% - 100px);
    z-index: 99;
    font-weight: 600;
    color: firebrick;
    background-color: #dfc507;
    padding: 5px;
    border-radius: 0.25rem;
    opacity: 1;
    cursor: pointer;
    transition: 0.5s opacity;
  }

  .remove-error:empty {
    transition: 0s opacity;
    opacity: 0;
  }

  .manager {
    height: 100%;
    padding: 0;
    overflow-x: auto;
    overflow-y: hidden;
  }
  .u-controls {
    padding: 5px;
  }
  #u-manager .u-controls .btn {
    position: absolute;
    left: 10px;
    font-size: initial;
    padding: 0.4rem 0.6rem;
    line-height: 1.6;
  }
  .table td:first-child,
  .table th:first-child {
    min-width: 120px;
    padding: 0.4rem 0.8rem;
    vertical-align: middle;
    text-align: center;
  }

  .table td:last-child,
  .table th:last-child {
    text-align: center;
  }

  .lo-count {
    min-width: 110px;
    max-width: 110px;
    text-align: center;
  }
</style>
