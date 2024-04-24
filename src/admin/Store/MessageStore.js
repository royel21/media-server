import { writable } from "svelte/store";

const MessageStore = writable("");

const setMessage = (message) => MessageStore.set(message);

export { MessageStore, setMessage };
