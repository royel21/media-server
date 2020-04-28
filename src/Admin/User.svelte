<script>
  import { onMount } from "svelte";
  import Axios from "Axios";

  import ModalUser from "./Component/ModalUser.svelte";

  let users = [];
  let foundUser = {};
  let error = "";
  let showModal = false;

  const saveEdit = e => {
    let tr = e.target.closest("tr");
    if (tr) {
      foundUser = usersData.users.find(u => u.Id === tr.id) || {};
    }
    showModal = true;
  };

  const removeUser = e => {
    let tr = e.target.closest("tr");
    let Role = tr.children[1].innerText;
    if (tr) {
      Axios.delete("/api/admin/users/remove", {
        data: { Id: tr.id, Role }
      }).then(({ data }) => {
        if (data.removed) {
          users = data;
        } else {
          error = data.msg;
        }
      });
    }
  };

  onMount(async () => {
    Axios.get("/api/admin/users").then(({ data }) => {
      if (data.users) {
        users = data.users;
      }
    });
  });
  const hideModal = () => (showModal = false);
</script>

<style>

</style>

{#if showModal}
  <ModalUser {users} {foundUser} on:closeModal={hideModal} />
{/if}
<div id="u-manager" class="card bg-dark manager">
  <div class="remove-error">{error}</div>
  <div class="controls">
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
              <span class="u-edit" onClick={saveEdit}>
                <i class="fas fa-edit" />
              </span>
              <span class="u-remove ml-2" onClick={removeUser}>
                <i class="fas fa-trash-alt" />
              </span>
            </td>
            <td>{user.Name}</td>
            <td>{user.Role}</td>
            <td>{user.State}</td>
            <td>{user.AdultPass ? 'true' : 'false'}</td>
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
