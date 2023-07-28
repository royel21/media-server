<script>
  import { onMount } from "svelte";
  //Pages
  import AdminRoutes from "./admin/AdminRoutes.svelte";
  import UserRoutes from "./user/UserRoutes.svelte";
  import Login from "./Login.svelte";
  import apiUtils from "./apiUtils";
  import ConfigPage from "./ConfigPage.svelte";
  import { navigate } from "svelte-routing";

  let user = { username: "" };
  let error = "";

  const getUrl = ({ role }) => `/${/admin/gi.test(role) ? "admin" : ""}`;

  onMount(async () => {
    let data = await apiUtils.get(["users"]);
    if (data.isAutenticated) {
      user = data;
    }
  });

  const logIn = async (userData) => {
    try {
      const data = await apiUtils.post("users/login", userData);
      if (data.isAutenticated) {
        user = data;
        navigate(getUrl(user));
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
  <div id="root">
    <Login {logIn} {error} />
  </div>
{/if}
