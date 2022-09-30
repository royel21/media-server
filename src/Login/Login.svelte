<script>
  import Button from "../ShareComponent/Button.svelte";
  import Input from "../ShareComponent/Input.svelte";

  let user = {
    username: "",
    password: "",
  };
  let width = "65px";
  let error = { name: "", password: "" };
  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      console.log(JSON.stringify(user));
      const data = await await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      }).then((res) => res.json());

      if (data.isAutenticated) {
        if (data.role.includes("Admin")) {
          location.href = "/admin/";
        } else {
          location.href = "/";
        }
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

<div id="root">
  <div id="login-container">
    <form method="post" on:submit={onSubmit}>
      <h3 class="mb-4">Login</h3>
      <Input {width} icon="fas fa-user" name="username" bind:value={user.username} placeholder="Name" />
      <Input
        {width}
        my="10px"
        icon="fas fa-key"
        name="password"
        type="password"
        bind:value={user.password}
        placeholder="Password"
      />
      <div class="form-footer">
        <Button label="Submit" tabindex="0" />
      </div>
    </form>
  </div>
</div>

<style>
  :global(html, body) {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    background: radial-gradient(ellipse at center, #14243d 0, #030611 100%);
  }
  #root {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100%;
  }
  form {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    background-color: #343a40;
    background-clip: border-box;
    border-radius: 0.25rem;
    border: 1px solid white;
    padding: 5px;
    color: white;
  }

  h3 {
    font-size: 1.7rem;
    margin: 1rem 0;
  }

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
</style>
