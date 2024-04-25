<script>
  import Input from "./ShareComponent/Input.svelte";
  import Icons from "./icons/Icons2.svelte";

  export let error = "";
  export let logIn;
  let showPass = false;

  let user = { username: "", password: "" };

  const onSubmit = () => {
    if (!user.username) return (error = "User can't be empty");
    if (!user.password) return (error = "Password can't be empty");
    logIn(user);
  };

  document.title = "Media Server";
</script>

<div id="login-container" class:more={showPass}>
  <h3 class="mb-4"><Icons name="signin" /> Login</h3>
  <form on:submit|preventDefault={onSubmit}>
    <Input width="65px" name="username" bind:value={user.username} placeholder="Name">
      <Icons name="user" slot="label" />
    </Input>
    <Input width="65px" name="password" type="password" bind:value={user.password} placeholder="Password">
      <Icons name="key" slot="label" />
    </Input>
    <div class="cp-label">
      <label for="toggle-pass">
        Change Password
        <input type="checkbox" id="toggle-pass" bind:checked={showPass} />
      </label>
      {#if showPass}
        <Input width="65px" name="newpassword" type="password" bind:value={user.newpassword} placeholder="New Password">
          <Icons name="key" slot="label" />
        </Input>
      {/if}
    </div>

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
  :global(*),
  :global(*::before),
  :global(*::after) {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }

  :global(#root) {
    display: flex;
    height: 100%;
    justify-content: center;
    align-items: center;
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

  #login-container {
    display: flex;
    flex-direction: column;
    width: 380px;
    height: fit-content;
    user-select: none;
    background-color: #343a40;
    border-radius: 0.25rem;
    border: 1px solid white;
    padding: 0 20px;
    color: white;
    text-align: center;
  }
  #login-container.more {
    height: 312px;
  }

  .cp-label {
    display: flex;
    justify-content: right;
    flex-direction: column;
    position: relative;
    right: 0;
  }
  .cp-label label {
    cursor: pointer;
    flex-basis: content;
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

  h3 {
    font-size: 1.7rem;
    margin: 15px;
  }
  .form-footer {
    padding: 15px;
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

  #login-container :global(.input-control) {
    margin: 10px 0;
  }

  #login-container :global(.input-control > input),
  #login-container :global(.input-control > span) {
    height: 36px;
  }
  @media screen and (max-width: 600px) {
    #login-container {
      width: 300px;
    }
  }
</style>
