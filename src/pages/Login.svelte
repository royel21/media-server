<script>
  import Axios from "Axios";
  import { navigate } from "svelte-routing";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  let user = {
    Name: "",
    Password: ""
  };
  let error = { name: "", password: "" };
  const onSubmit = event => {
    event.preventDefault();
    Axios.post("/api/users/login", user).then(({ data }) => {
      if (data.isAutenticated) {
        dispatch("login", { Name: data.Name });
      } else {
        if (name) {
          error.name = "User can't be empty";
        } else {
          error.password = "Password can't be empty";
        }
      }
    });
  };
</script>

<style>
  #login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    user-select: none;
  }

  #login-container form {
    text-align: center;
    border-radius: 0.25rem;
    border: 1px solid;
    min-width: 320px;
  }

  #login-container label {
    padding: 0 15px;
    min-width: 60px;
  }

  #login-container label i {
    font-size: 26px;
  }

  #login-container .error {
    padding: 8px 0;
  }

  h3 {
    font-size: 1.7rem;
    margin-bottom: 1.5rem;
  }
</style>

<div id="login-container">
  <form method="post" class="card bg-dark p-3" on:submit={onSubmit}>
    <h3 class="mb-4">Login</h3>
    <div class="input-group">
      <div class="input-group-prepend">
        <label htmlFor="" class="input-group-text">
          <i class="fas fa-user" />
        </label>
      </div>
      <input
        id="name"
        type="text"
        class="form-control"
        name="username"
        placeholder="Name"
        bind:value={user.Name}
        tabindex="0" />
    </div>
    <div id="name-errors" class="error text-left text-danger">{error.name}</div>
    <div class="input-group">
      <div class="input-group-prepend">
        <label htmlFor="" class="input-group-text">
          <i class="fas fa-key" />
        </label>
      </div>
      <input
        id="password"
        type="password"
        class="form-control"
        name="Password"
        placeholder="Password"
        bind:value={user.Password}
        autocomplete="on"
        tabindex="0" />
    </div>

    <div id="pasword-errors" class="error text-left text-danger">
      {error.password}
    </div>
    <div class="form-footer">
      <button class="btn" tabindex="0">Submit</button>
    </div>
  </form>
</div>
