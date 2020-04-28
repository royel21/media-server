<script>
  import Axios from "Axios";
  import { createEventDispatcher } from "svelte";
  export let foundUser;
  export let users;

  const dispatch = createEventDispatcher();
  let error = "";

  const submit = e => {
    if (!foundUser.Name) return (error = "Name Can't be empty");

    Axios.post("/api/admin/users/add-edit", foundUser).then(({ data }) => {
      if (!data.fail) {
        let tusers = [...users.filter(u => u.Id !== foundUser.Id), data.user];

        tusers.sort((a, b) => {
          return a.Name.localeCompare(b.Name);
        });

        dispatch("updateuser", tusers);
      } else {
        error = data.msg;
      }
    });
  };

  const closeModal = () => {
    dispatch("closemodal");
  };
</script>

<style>
  .modal {
    display: block;
    position: fixed;
    top: calc(50% - 150px);
    left: calc(50% - 175px);
    z-index: 99;
    min-height: initial;
    min-width: initial;
    height: max-content;
    width: 350px;
    background-color: cadetblue;
  }
  .modal .errors {
    color: rgb(226, 35, 35);
    font-size: 20px;
  }
  .modal label,
  .modal .form-control {
    padding: 5px;
    margin: 4px 0;
  }

  .modal label {
    width: 55px;
    justify-content: space-evenly;
    user-select: none;
    font-weight: 600;
  }

  .modal .second-ctrl input {
    display: none;
  }
  .modal .checkadult {
    text-align: center;
    cursor: pointer;
  }

  .modal label i {
    font-size: 20px;
  }
  .second-ctrl input:checked + label i:before {
    content: "\f00c";
  }

  .modal-header {
    display: flex;
    padding: 5px;
    justify-content: center;
    user-select: none;
  }
  .modal-header h3 {
    margin-bottom: 0;
  }

  .input-grouping {
    display: flex;
    justify-content: space-evenly;
  }
  .input-grouping .second-ctrl {
    margin-left: 5px;
  }

  .modal-footer {
    display: flex;
    justify-content: center;
    padding: 5px;
  }

  .modal-footer .btn {
    min-width: 75px;
    margin: 0 10%;
  }
</style>

<div class="modal-container">
  <div class="modal card">
    <div class="modal-header">
      <h3>{foundUser.Id ? 'Edit' : 'Create'}</h3>
    </div>
    <div class="modal-body">
      <input type="hidden" name="Id" bind:value={foundUser.Id} />
      <div class="input-group">
        <div class="input-group-prepend">
          <label htmlFor="Name" class="input-group-text">
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
          <label htmlFor="Password" class="input-group-text">
            <i class="fas fa-key" />
          </label>
        </div>
        <input
          class="form-control"
          type="password"
          name="Password"
          autoComplete="new-password" />
      </div>
      <div class="input-group">
        <div class="input-group-prepend">
          <label htmlFor="Role" class="input-group-text">Role</label>
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
            <label htmlFor="State" class="input-group-text">Status</label>
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
          <input id="Adult" type="checkbox" checked={foundUser.AdultPass} />
          <label htmlFor="Adult" class="form-control checkadult">
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
