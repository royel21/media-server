<script>
  import { onMount } from "svelte";
  import GameInfo from "./GameInfo.svelte";
  import GameList from "./GameList.svelte";
  import { calRows, map } from "../Utils";
  import apiUtils from "src/apiUtils";
  import { setMessage } from "../Store/MessageStore";

  let game = {};
  let Games = [];
  let pageData = {
    page: 1,
    totalPages: 0,
    totalItems: 0,
  };
  let filter = localStorage.getItem("gamelist-filter") || "";

  const loadGames = async () => {
    const data = await apiUtils.admin(["games", pageData.page, calRows(), filter], "g-list");

    Games = data.items || [];
    pageData.totalItems = data.totalItems || 0;
    pageData.totalPages = data.totalPages || 0;
    pageData.page = data.page;
    game = Games[0] || {};
  };

  const gotopage = async (newPage) => {
    pageData.page = newPage.detail;
    await loadGames();
  };

  const filterChange = async (e) => {
    filter = e.detail;
    pageData.page = 1;
    await loadGames();
  };

  const setInfo = ({ detail }) => {
    game = detail;
  };

  const updateGame = (g) => {
    if (g.Id === "new") {
      return loadGames();
    }

    let index = Games.findIndex((g) => g.Id === game.Id);
    if (index < -1) {
      Games[index] = g;
      Games = Games;
    }
  };

  const removeGame = async (g2) => {
    const index = Games.findIndex((g) => g.Id === g2.Id);
    const data = {
      Id: game.Id,
      page: pageData.page,
      filter,
      rows: calRows(),
    };
    const result = await apiUtils.post("admin/games/remove-game", data, "up-data");

    Games = result.items || [];
    pageData.totalItems = result.totalItems || 0;
    pageData.totalPages = result.totalPages || 0;
    pageData.page = result.page || 1;

    setMessage({ msg: `Game ${game.Name} was Removed`, error: true });
    const size = Games.length - 1;
    game = Games[map(index, 0, size)] || {};
  };

  const nameRegx = /^Title(:| :|) |Romanji: |Romaji: /gi;

  const addGame = async () => {
    const d = decodeURIComponent(filter) || "";
    if (!Games.find((g) => g.Id === "new")) {
      let g = {
        Id: "new",
        Info: { Company: d.trim() },
      };

      if (/^(v|RJ|)\d+$/.test(d)) {
        g.Codes = /^\d+$/.test(d) ? "ST" + d : d;
        g.Info.Company = "";
      }
      let Title = "";
      try {
        let text = "";
        if (navigator.clipboard) {
          text = await navigator.clipboard?.readText();
          if (text) {
            const parts = text.split("\n");
            for (let p of parts) {
              let altNameRegx = /^(Japanese|Original) Title(:| :|) /i;

              if (nameRegx.test(p)) {
                Title = p.replace(nameRegx, "");
                g.Name = Title.split(", ")[0].trim();
              }

              if (altNameRegx.test(p)) {
                g.Info.AltName = p.replace(altNameRegx, "").trim();
                if (Title.trim()) {
                  g.Info.AltName +=
                    "\n" +
                    Title.replace(g.Name, "")
                      .split(", ")
                      .map((n) => n.trim())
                      .filter((n) => n)
                      .join(", ")
                      .trim();
                }
              }
              let devRegex = /^Developer( :|) /;
              if (devRegex.test(p)) {
                g.Info.Company = p.replace(devRegex, "").split(", ")[0].trim();
              }

              if (/VNDB: /gi.test(p)) {
                g.Codes = p.split("/").pop().trim();
              }

              if (/Language( :|) /gi.test(p)) {
                g.Info.Lang = p
                  .split(":")
                  .pop()
                  .replace(/ \(Official\)/gi, "")
                  .trim();
              }
              if (/https:/.test(p) && !g.Codes) {
                g.Codes = p.match(/(v|RJ|r)\d+/i)?.[0];
                if (/steampowered\.com/.test(p)) {
                  g.Codes = p.match(/app\/\d+/i)?.[0].replace("app/", "ST");
                }
              }
            }
          }
        }
        game = { ...g };
      } catch (error) {
        console.log(error);
      }
    }
  };

  onMount(loadGames);
  $: localStorage.setItem("gamelist-filter", filter);
</script>

<div class="admin-manager">
  <div class="rows">
    <GameList {Games} {game} {setInfo} {pageData} {filter} {gotopage} {filterChange} {addGame} />
    <GameInfo bind:game {updateGame} {removeGame} />
  </div>
</div>

<style>
  :global(.content) {
    overflow: hidden;
  }
  .admin-manager {
    height: 100%;
    padding: 0;
  }
  .rows {
    position: relative;
    display: flex;
    flex-direction: row;
    height: 100%;
  }
</style>
