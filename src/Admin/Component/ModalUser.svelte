<script>
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";
  import Axios from "Axios";

  export let foundUser = { AdultPass: false, Password: "" };

  const dispatch = createEventDispatcher();
  let error = "";

  const submit = e => {
    if (!foundUser.Name) return (error = "Name Can't be empty");

    Axios.post("/api/admin/users/add-edit", foundUser).then(({ data }) => {
      if (!data.fail) {
        dispatch("updateusers", data.user);
      } else {
        error = data.msg;
        console.log(data);
      }
    });
  };

  const closeModal = () => {
    dispatch("closeModal");
  };
</script>

<style>
  .input-grouping {
    display: flex;
    justify-content: space-evenly;
  }
  .input-grouping .input-group {
    width: 100%;
  }
  .modal .second-ctrl input {
    display: none;
  }
  .modal .checkadult {
    text-align: center;
    cursor: pointer;
  }
  .second-ctrl input:checked + label i:before {
    content: "\f00c";
  }
  .input-grouping .second-ctrl {
    margin-left: 5px;
  }
</style>

<div class="modal-container">
  <div class="modal card" transition:fade={{ duration: 200 }}>
    <div class="modal-header">
      <h3>{foundUser.Id ? 'Edit' : 'Create'}</h3>
    </div>
    <div class="modal-body">
      <input type="hidden" name="Id" bind:value={foundUser.Id} />
      <div class="input-group">
        <div class="input-group-prepend">
          <label for="Name" class="input-group-text">
            <i class="fas fa-user" />
          </label>
        </div>
        <input
          class="form-control"
          type="text"
          name="Name"
          bind:value={foundUser.Name} />
      </div>
      <div class="input-group">
        <div class="input-group-prepend">
          <label for="Password" class="input-group-text">
            <i class="fas fa-key" />
          </label>
        </div>
        <input
          class="form-control"
          type="password"
          bind:value={foundUser.Password}
          autoComplete="new-password" />
      </div>
      <div class="input-group">
        <div class="input-group-prepend">
          <label for="Role" class="input-group-text">Role</label>
        </div>
        <select class="form-control" name="Role" bind:value={foundUser.Role}>
          <option value="User">User</option>
          <option value="Administrator">Administrator</option>
          <option value="Manager">Manager</option>
        </select>
      </div>
      <div class="input-grouping">
        <div class="first-ctrl input-group">
          <div class="input-group-prepend">
            <label for="State" class="input-group-text">Status</label>
          </div>
          <select
            class="form-control"
            name="State"
            bind:value={foundUser.Status}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div class="second-ctrl input-group">
          <div class="input-group-prepend">
            <label class="input-group-text">Adult</label>
          </div>
          <input
            id="Adult"
            type="checkbox"
            bind:checked={foundUser.AdultPass} />
          <label for="Adult" class="form-control checkadult">
            <i class="fas fa-times" />
          </label>
        </div>
      </div>
      <div class="errors">{error}</div>
    </div>
    <div class="modal-footer">
      <button class="btn" on:click={closeModal}>Cancel</button>
      <button class="btn" on:click={submit}>
        {foundUser.Id ? 'Update' : 'Save'}
      </button>
    </div>
  </div>
</div>
