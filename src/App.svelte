<script>
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";
  //Pages
  import AdminRoutes from "./admin/AdminRoutes.svelte";
  import UserRoutes from "./user/UserRoutes.svelte";
  import Login from "./Login.svelte";
  import apiUtils from "./apiUtils";
  import ConfigPage from "./ConfigPage.svelte";

  let user = { username: "" };
  onMount(async () => {
    let data = await apiUtils.get(["users"]);
    if (data.isAutenticated) {
      user = data;
    }
  });

  const logIn = (_user) => {
    user = _user.detail;
  };
</script>

{#if user.username}
  <ConfigPage>
    {#if user.role.includes("Admin")}
      <AdminRoutes />
    {:else}
      <UserRoutes />
    {/if}
  </ConfigPage>
{:else}
  <Login on:login={logIn} />
{/if}
