<script>
  import { onMount } from "svelte";
  import Login from "../Login.svelte";

  let errors = [];

  const getUrl = ({ role }) => `/${/admin/gi.test(role) ? "admin" : ""}`;

  const onError = (err) => {
    errors = [`Server ${/Network Error/i.test(err.toString()) ? "offline" : "error"}`];
  };

  const logIn = async (userData) => {
    try {
      const data = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      }).then((res) => res.json());

      if (data.isAutenticated) {
        location.href = getUrl(data);
      } else {
        errors = data.info.message;
      }
    } catch (err) {
      onError(err);
    }
  };

  onMount(async () => {
    try {
      const data = await fetch("/api/users").then((response) => response.json());
      if (data.isAutenticated) location.href = getUrl(data);
    } catch (err) {
      onError(err);
    }
  });
</script>

<div id="root">
  <Login {logIn} {errors} />
</div>
