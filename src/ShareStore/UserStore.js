import { writable } from "svelte/store";

const UserStore = writable({});

const updateUser = (user) => {
  UserStore.update((old) => (old = user || {}));
  return user;
};

export { UserStore, updateUser };
