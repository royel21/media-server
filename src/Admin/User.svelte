<script>
  import { onMount } from "svelte";
  import apiUtils from "../apiUtils";
  import ModalUser from "./Component/ModalUser.svelte";

  let users = [];
  let foundUser = { AdultPass: false };
  let error = "";
  let showModal = false;

  const hideModal = () => {
    showModal = false;
    foundUser = { AdultPass: false };
  };

  const saveEdit = (e) => {
    let tr = e.target.closest("tr");
    if (tr) {
      foundUser = { ...users.find((u) => u.Id === tr.id) } || {};
    }
    showModal = true;
  };

  const removeUser = async (e) => {
    let tr = e.target.closest("tr");
    let Role = tr.children[1].innerText;
    if (tr) {
      const data = await apiUtils.post("admin/users/remove", { Id: tr.id, Role });
      if (data.removed) {
        users = users.filter((u) => u.Id !== tr.id);
      } else {
        error = data.msg;
      }
    }
  };

  const updateUsers = (event) => {
    let user = event.detail;
    //Filter users
    let filteredUsers = users.filter((u) => u.Id !== user.Id);
    //Add and sort users
    users = [...filteredUsers, user].sort((a, b) => {
      return a.Name.localeCompare(b.Name);
    });
    user.Password = "";
    hideModal();
  };

  onMount(async () => {
    const data = await apiUtils.admin(["users"]);
    if (data.users) {
      users = data.users;
    }
  });
</script>

{#if showModal}
  <ModalUser {foundUser} on:closeModal={hideModal} on:updateusers={updateUsers} />
{/if}
<div id="u-manager" class="card bg-dark manager">
  <div class="remove-error">{error}</div>
  <div class="u-controls">
    <span class="btn" on:click={saveEdit}>
      <i class="fas fa-user-plus" />
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
        <th>Adult</th>
      </tr>
    </thead>
    <tbody>
      {#if users.length}
        {#each users as user}
          <tr id={user.Id} key={user.Name}>
            <td>
              <span class="u-edit" on:click={saveEdit}>
                <i class="fas fa-edit" />
              </span>
              <span class="u-remove ml-2" on:click={removeUser}>
                <i class="fas fa-trash-alt" />
              </span>
            </td>
            <td>{user.Name}</td>
            <td>{user.Role}</td>
            <td>{user.State}</td>
            <td>{user.AdultPass ? "true" : "false"}</td>
          </tr>
        {/each}
      {:else}
        <tr>
          <td colSpan="5">Loading Data From Server</td>
        </tr>
      {/if}
    </tbody>
  </table>
</div>

<style>
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

  #u-manager .u-controls .btn i {
    font-size: 20px;
  }

  .table td:first-child,
  .table th:first-child {
    width: 100px;
    padding: 0.4rem 0.8rem;
    vertical-align: middle;
    text-align: center;
  }
</style>
