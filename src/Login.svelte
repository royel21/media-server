<script>
  import Input from "./ShareComponent/Input.svelte";
  import Icons from "./icons/Icons2.svelte";

  export let error = "";
  export let logIn;

  let user = { username: "", password: "" };

  const onSubmit = () => {
    if (!user.username) return (error = "User can't be empty");
    if (!user.password) return (error = "Password can't be empty");
    logIn(user);
  };

  document.title = "Media Server";
</script>

<div id="login-container">
  <h3 class="mb-4"><Icons name="signin" /> Login</h3>
  <form on:submit|preventDefault={onSubmit}>
    <Input width="65px" name="username" bind:value={user.username} placeholder="Name" {error}>
      <Icons name="user" slot="label" />
    </Input>
    <Input width="65px" name="password" type="password" bind:value={user.password} placeholder="Password" {error}>
      <Icons name="key" slot="label" />
    </Input>
    <div class="error">{error}</div>
    <div class="form-footer">
      <button type="submit">Submit</button>
    </div>
  </form>
</div>

<style>
  :global(html, body) {
    width: 100%;
    height: 100%;
    margin: 0;
    background: radial-gradient(ellipse at center, #14243d 0, #030611 100%);
  }
  .error {
    display: none;
  }
  .error:not(:empty) {
    display: block;
    margin: 10px 0;
    color: firebrick;
    font-weight: 600;
  }

  #login-container :global(.icon-signin) {
    height: 32px;
    width: 40px;
    top: 7px;
    fill: white;
  }
  #login-container form :global(svg) {
    fill: #000;
    width: 30px;
    height: 30px;
    top: 2px;
  }

  #login-container {
    position: absolute;
    top: calc(50% - 150px);
    left: calc(50% - 150px);
    width: 300px;
    user-select: none;
    background-color: #343a40;
    border-radius: 0.25rem;
    border: 1px solid white;
    padding: 5px;
    color: white;
    text-align: center;
  }

  h3 {
    font-size: 1.7rem;
    margin: 10px;
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
    color: white;
    background-color: #5a6268;
    border: 1px solid transparent;
    transition: 0.15s all ease-in-out;
  }

  button:hover {
    background-color: gray;
    border-color: #545b62;
  }

  :global(.input-control) {
    margin: 10px 0;
  }
</style>
