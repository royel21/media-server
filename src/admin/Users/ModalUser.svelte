<script>
  import { createEventDispatcher } from "svelte";
  import apiUtils from "src/apiUtils";
  import Icons from "src/icons/Icons.svelte";
  import Input from "../Component/Input.svelte";
  import Select from "src/ShareComponent/Select.svelte";
  import Dialog from "src/ShareComponent/Dialog.svelte";
  import CheckBox from "../Component/CheckBox.svelte";
  import { setMessage } from "../Store/MessageStore";

  export let foundUser = { AdultPass: false, State: "Active", LoginCount: 0 };
  const roles = [{ Id: "User" }, { Id: "Manager" }, { Id: "Administrator" }];
  const status = [{ Id: "Active" }, { Id: "InActive" }];

  const Action = foundUser.Id ? "Update" : "Create";
  const Title = foundUser.Id ? "Edit" : "Create";

  const dispatch = createEventDispatcher();
  let errors = [];

  const submit = async (e) => {
    errors = [];

    if (!foundUser.Name) {
      return errors.push("Name Can't be empty");
    }

    if (!foundUser.Id && !foundUser.Password) {
      return errors.push("Password Can't be empty");
    }

    const result = await apiUtils.post("admin/users/create-update", foundUser);
    if (!result.fail) {
      dispatch("updateusers", result.user);
    } else {
      return (errors = [result.msg]);
    }
  };

  const resetPassword = async () => {
    const result = await apiUtils.post("admin/users/reset-pass", { Id: foundUser.Id });
    if (result.error) {
      return (errors = result.error);
    }

    setMessage({ msg: `User ${foundUser.Name} Password was reset` });
  };

  const closeModal = () => {
    dispatch("closeModal");
  };
  const color = "black";
</script>

<Dialog id="user-modal" cancel={closeModal} confirm={submit} {errors}>
  <div slot="modal-header">
    <h3>{Title}</h3>
  </div>
  <div slot="modal-body">
    <Input key="Name" item={foundUser}>
      <span slot="icon">
        <Icons name="user" {color} />
      </span>
    </Input>
    <Select key="Role" item={foundUser} options={roles} />
    <div class="input-control-group">
      <Select key="State" item={foundUser} options={status} />
      <CheckBox label="Adult" key="AdultPass" item={foundUser} />
    </div>
    <Input label="Login Count" key="LoginCount" item={foundUser} />
  </div>
  <div class="modal-footer" slot="modal-footer" class:nuser={foundUser.Id}>
    {#if foundUser.Id}
      <button type="button" class="btn" on:click={resetPassword}>Reset Password</button>
    {/if}
    <button type="submit" class="btn">{Action}</button>
    <button type="button" class="btn" on:click={closeModal}>Cancel</button>
  </div>
</Dialog>

<style>
  :global(#user-modal) {
    max-width: 380px;
  }
  :global(#user-modal .modal-body) {
    padding: 0px 5px;
    margin-top: 15px;
    margin-bottom: 5px;
  }
  :global(#user-modal .input-label) {
    min-width: 60px;
    max-width: 60px;
  }
  :global(#user-modal .LoginCount .input-label) {
    max-width: 110px;
    min-width: 110px;
  }
  .modal-footer {
    padding: 10px 0;
    border-top: 1px solid;
    text-align: center;
  }

  .modal-footer button {
    margin: 0 10px;
  }

  .nuser {
    display: flex;
    justify-content: space-around;
  }
  .nuser button {
    margin: 0;
  }
</style>
