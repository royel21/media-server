<script>
  import { createEventDispatcher } from "svelte";
  import apiUtils from "src/apiUtils";
  import Icons from "src/icons/Icons.svelte";
  import Input from "../Component/Input.svelte";
  import Select from "src/ShareComponent/Select.svelte";
  import Dialog from "src/ShareComponent/Dialog.svelte";
  import CheckBox from "../Component/CheckBox.svelte";

  export let foundUser = { AdultPass: false, Password: "", State: "Active" };
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
      console.log(result.msg);
      return (errors = [result.msg]);
    }
  };

  const closeModal = () => {
    dispatch("closeModal");
  };
  const color = "black";
  console.log(errors);
</script>

<Dialog id="user-modal" cancel={closeModal} confirm={submit} btnOk={Action} {errors}>
  <div slot="modal-header">
    <h3>{Title}</h3>
  </div>
  <div slot="modal-body">
    <Input key="Name" item={foundUser}>
      <span slot="icon">
        <Icons name="user" {color} />
      </span>
    </Input>
    <Input key="Password" item={foundUser}>
      <span slot="icon">
        <Icons name="key" {color} />
      </span>
    </Input>
    <Select key="Role" item={foundUser} options={roles} />
    <div class="input-control-group">
      <Select key="State" item={foundUser} options={status} />
      <CheckBox label="Adult" key="AdultPass" item={foundUser} />
    </div>
  </div>
</Dialog>

<style>
  :global(#user-modal) {
    max-width: 350px;
  }
  :global(#user-modal .input-label) {
    min-width: 60px;
    max-width: 60px;
  }
</style>
