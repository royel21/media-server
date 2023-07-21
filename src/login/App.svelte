<script>
  import { onMount } from "svelte";
  import Login from "../Login.svelte";

  let error = "";

  const getUrl = ({ role }) => `/${/admin/gi.test(role) ? "admin" : ""}`;

  const onError = (err) => {
    console.log(err);
    error = `Server ${/Network Error/i.test(err.toString()) ? "offilne" : "error"}`;
  };

  const onlogin = async (user) => {
    try {
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
        error = data.info.message;
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
  <Login {onlogin} />
</div>
