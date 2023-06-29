<script>
  import Input from "../ShareComponent/Input.svelte";
  import { onMount } from "svelte";
  import Icons from "./icons/Icons2.svelte";

  let error = { name: "", password: "" };

  let user = { username: "", password: "" };

  const getUrl = ({ role }) => `/${/admin/gi.test(role) ? "admin" : ""}`;

  const onError = (err) => {
    if (err.toString().includes("Network Error")) {
      error.password = "Not Network Connection";
    } else {
      error.password = "Server Not Available";
    }
  };

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
          location.href = getUrl(data);
        } else {
          error.password = data.info.message;
        }
      }
    } catch (err) {
      console.log(err);
      onError(err);
    }
  };

  onMount(async () => {
    try {
      const data = await fetch("/api/users").then((response) => response.json());
      if (data.isAutenticated) {
        location.href = getUrl(data);
      }
    } catch (err) {
      onError(err);
    }
  });
  document.title = "Media Server";
</script>

<div id="root">
  <div id="login-container">
    <h3 class="mb-4"><Icons name="signin" /> Login</h3>
    <form on:submit|preventDefault={onSubmit}>
      <Input width="65px" name="username" bind:value={user.username} placeholder="Name" {error}>
        <Icons name="user" slot="label" />
      </Input>
      <Input width="65px" name="password" type="password" bind:value={user.password} placeholder="Password" {error}>
        <Icons name="key" slot="label" />
      </Input>
      <div class="form-footer">
        <button type="submit">Submit</button>
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
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif,
      "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  }
  #root {
    min-height: 100%;
  }

  #login-container :global(.icon-signin) {
    height: 32px;
    width: 40px;
    top: 7px;
    fill: white;
  }
  #login-container form :global(svg) {
    fill: black;
    fill: black;
    width: 30px;
    height: 24px;
    top: 0;
  }

  #login-container {
    position: absolute;
    top: calc(50% - 150px);
    left: calc(50% - 150px);
    width: 300px;
    -webkit-user-select: none;
    -moz-user-select: none;
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

  :global(.input-control) {
    margin-bottom: 10px;
  }
</style>
