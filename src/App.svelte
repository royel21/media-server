<script>
  import { onMount } from "svelte";
  //Pages
  import AdminRoutes from "./admin/AdminRoutes.svelte";
  import UserRoutes from "./user/UserRoutes.svelte";
  import Login from "./Login.svelte";
  import apiUtils from "./apiUtils";
  import ConfigPage from "./ConfigPage.svelte";
  import { navigate } from "svelte-routing";
  import Loading from "./ShareComponent/Loading.svelte";

  let user = { username: "" };
  let errors = [];
  let loading = true;

  const getUrl = ({ role }) => `/${/admin/gi.test(role) ? "admin/" : ""}`;

  onMount(async () => {
    let data = await apiUtils.get(["users"]);
    if (data.isAutenticated) {
      user = data;
    }
    loading = false;
  });

  const logIn = async (userData) => {
    errors = [];
    try {
      const data = await apiUtils.post("users/login", userData);

      if (data.info) {
        errors = data.info.message;
        return;
      }

      if (data.isAutenticated) {
        user = data;
        return navigate(getUrl(user));
      }
    } catch (err) {
      console.log(err);
      errors.push(`Server ${/Network Error/i.test(err.toString()) ? "offilne" : "error"}`);
    }
  };
</script>

{#if loading}
  <Loading text="Checkin User Please Wait" />
{:else if user.username}
  <ConfigPage {user}>
    {#if user.role.includes("Admin")}
      <AdminRoutes />
    {:else}
      <UserRoutes />
    {/if}
  </ConfigPage>
{:else}
  <div id="root">
    <Login {logIn} {errors} />
  </div>
{/if}

<style>
  @import "./global.css";
</style>
