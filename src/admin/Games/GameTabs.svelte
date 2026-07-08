<script>
  import { onMount } from "svelte";
  import GameInfo from "./GameInfo.svelte";
  import GameList from "./GameList.svelte";
  import { calRows, map } from "../Utils";
  import apiUtils from "src/apiUtils";
  import { setMessage } from "../Store/MessageStore";
  import { getInfo } from "./infoUtil";

  let game = {};
  let Games = [];
  let pageData = {
    page: 1,
    totalPages: 0,
    totalItems: 0,
  };
  let filter = localStorage.getItem("gamelist-filter") || "";

  const loadGames = async () => {
    const data = await apiUtils.admin(
      ["games", pageData.page, calRows(), filter],
      "g-list",
    );

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
    const result = await apiUtils.post(
      "admin/games/remove-game",
      data,
      "up-data",
    );

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
    const d = decodeURIComponent(filter)?.trim() || "";
    if (!Games.find((g) => g.Id === "new")) {
      let g = {
        Id: "new",
        Info: { Company: d },
      };

      if (/^(v|IG|RJ|)\d+$/.test(d)) {
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
            parts.forEach((p) => {
              if (nameRegx.test(p)) {
                Title = p.replace(nameRegx, "");
                g.Name = Title.split(/ ~|, /)[0].trim();
              }
            });

            let result = getInfo(text, g.Info, g.Name);
            g.Info = result;
            g.Codes = result.Codes || g.Codes;
            g.Info.Company = result.Company || g.Info.Company;
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
    <GameList
      {Games}
      {game}
      {setInfo}
      {pageData}
      {filter}
      {gotopage}
      {filterChange}
      {addGame}
    />
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
