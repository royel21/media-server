<script>
  import Input from "../ShareComponent/Input.svelte";
  import UserIcon from "../icons/user-solid.svelte";
  import KeyIcon from "../icons/key-solid.svelte";
  import { onMount } from "svelte";

  let error = { name: "", password: "" };

  let user = { username: "", password: "" };

  const onSubmit = async () => {
    error = { username: "", password: "" };
    try {
      if (!user.username) {
        error.username = "User can't be empty";
      } else if (!user.password) {
        error.password = "Password can't be empty";
      } else {
        const data = await fetch("/api/users/login", {
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
        }
      }
    } catch (err) {
      if (err.toString().includes("Network Error")) {
        error.password = "Not Network Connection";
      } else {
        error.password = "Server Error";
      }
    }
  };

  onMount(async () => {
    let data = await fetch("/api/users").then((response) => response.json());
    if (data.isAutenticated) {
      location.href = `/${data.role.includes("Admin") ? "admin" : ""}`;
    }
  });
  document.title = "Media Server";
</script>

<div id="root">
  <div id="login-container">
    <h3 class="mb-4">Login</h3>
    <Input width="65px" icon="fas fa-user" name="username" bind:value={user.username} placeholder="Name" {error}>
      <UserIcon slot="label" />
    </Input>
    <Input
      width="65px"
      icon="fas fa-key"
      name="password"
      type="password"
      bind:value={user.password}
      placeholder="Password"
      {error}
    >
      <KeyIcon slot="label" />
    </Input>
    <div class="form-footer">
      <button on:click={onSubmit}>Submit</button>
    </div>
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
    min-height: 100%;
  }

  #login-container {
    position: absolute;
    top: calc(50% - 150px);
    left: calc(50% - 150px);
    width: 300px;
    user-select: none;
    background-color: #343a40;
    background-clip: border-box;
    border-radius: 0.25rem;
    border: 1px solid white;
    padding: 5px;
    color: white;
    text-align: center;
  }

  h3 {
    font-size: 1.7rem;
    margin: 1rem 0;
  }
  .form-footer {
    margin-top: 10px;
  }

  button {
    display: inline-block;
    font-weight: 400;
    text-align: center;
    vertical-align: middle;
    cursor: pointer;
    -webkit-user-select: none;
    user-select: none;
    padding: 0.25rem 0.35rem;
    font-size: 1rem;
    line-height: 1.5;
    border-radius: 0.25rem;
    color: #fff;
    background-color: #5a6268;
    border: 1px solid transparent;
    transition: 0.15s all ease-in-out;
  }

  button:hover {
    color: #fff;
    background-color: gray;
    border-color: #545b62;
  }

  button:active {
    transform: scale(1.2);
    transition: 0.25s;
  }
  button:not(:last-child) {
    margin-right: 10px;
  }

  :global(svg) {
    fill: #495057;
    height: 27px;
    padding-top: 5px;
  }
  :global(.input-control) {
    margin-bottom: 10px;
  }
</style>
