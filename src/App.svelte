<script>
  import { onMount } from "svelte";
  //Pages
  import AdminRoutes from "./admin/AdminRoutes.svelte";
  import UserRoutes from "./user/UserRoutes.svelte";
  import Login from "./Login.svelte";
  import apiUtils from "./apiUtils";
  import ConfigPage from "./ConfigPage.svelte";

  let user = { username: "" };
  let error = "";

  onMount(async () => {
    let data = await apiUtils.get(["users"]);
    if (data.isAutenticated) {
      user = data;
    }
  });

  const onLogin = async (loginData) => {
    try {
      const data = await apiUtils.post("users/login", loginData);
      if (data.isAutenticated) {
        user = data;
      }

      if (data.info) {
        error = data.info.message;
      }
    } catch (err) {
      console.log(err);
      error = `Server ${/Network Error/i.test(err.toString()) ? "offilne" : "error"}`;
    }
  };
</script>

{#if user.username}
  <ConfigPage {user}>
    {#if user.role.includes("Admin")}
      <AdminRoutes />
    {:else}
      <UserRoutes />
    {/if}
  </ConfigPage>
{:else}
  <Login {onLogin} {error} />
{/if}
