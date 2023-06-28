<script>
  import { createEventDispatcher } from "svelte";
  import { post } from "./apiUtils.js";
  import Icons from "./icons/Icons.svelte";

  const dispatch = createEventDispatcher();

  let user = {
    username: "",
    password: "",
  };
  let error = { name: "", password: "" };
  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      const data = await post("users/login", user);
      if (data.isAutenticated) {
        dispatch("login", { ...data });
      } else if (user.username) {
        error.name = "User can't be empty";
      } else {
        error.password = "Password can't be empty";
      }
    } catch (err) {
      console.log(err);
      if (err.toString().includes("Network Error")) {
        error.password = "server offline";
      } else {
        error.password = "Server Error";
      }
    }
  };
  document.title = "Media Server";
</script>

<div id="login-container">
  <form method="post" class="card bg-dark p-3" on:submit={onSubmit}>
    <h3 class="mb-4"><Icons name="signin" /> Login</h3>
    <div class="input-group">
      <div class="input-group-prepend">
        <label for="name" class="input-group-text">
          <Icons name="user" />
        </label>
      </div>
      <input
        id="name"
        type="text"
        class="form-control"
        name="username"
        placeholder="Name"
        bind:value={user.username}
        tabindex="0"
      />
    </div>
    <div id="name-errors" class="error text-left text-danger">{error.name}</div>
    <div class="input-group">
      <div class="input-group-prepend">
        <label for="password" class="input-group-text">
          <Icons name="key" />
        </label>
      </div>
      <input
        id="password"
        type="password"
        class="form-control"
        name="Password"
        placeholder="Password"
        bind:value={user.password}
        autocomplete="on"
        tabindex="0"
      />
    </div>

    <div id="pasword-errors" class="error text-left text-danger">
      {error.password}
    </div>
    <div class="form-footer"><button class="btn" type="submit" tabindex="0">Submit</button></div>
  </form>
</div>

<style>
  #login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
  }

  #login-container :global(.icon-signin) {
    height: 32px;
    width: 40px;
    top: 7px;
    fill: white;
  }

  #login-container form {
    text-align: center;
    border-radius: 0.25rem;
    border: 1px solid;
    min-width: 320px;
  }
  #login-container label :global(svg) {
    fill: black;
    fill: black;
    width: 30px;
    height: 24px;
    top: 0;
  }

  #login-container label {
    padding: 0 15px;
    min-width: 60px;
  }

  #login-container .error {
    padding: 8px 0;
    color: firebrick;
    font-weight: 600;
  }

  h3 {
    font-size: 1.7rem;
    margin-bottom: 1.5rem;
  }
</style>
