const express = require("express");
const axios = require("axios");
const hbs = require("hbs");

const router = express.Router();

const IGDB = require("igdb-api-node").default;
const apiKey = "39fb8cac0ae4190e1d2d564985023e7d";

//HELPERS
hbs.registerHelper("toDate", UNIX_timestamp => {
  var a = new Date(UNIX_timestamp * 1000);
  var months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();

  let yearsAgo = getYearsAgo(year);
  var newDate = `${month} ${date}, ${year} (${yearsAgo} years ago)`;

  return newDate;
});

router.get("/games", async (req, res) => {
  const response = await getGames();

  res.render("games/games.hbs", { games: response });
});

router.get("/games-next/:pageNumber", async (req, res) => {
  let pageNumber = req.params.pageNumber;

  const response = await getGames((offset = pageNumber));

  res.render("games/games.hbs", { games: response });
});

router.get("/games-search", async (req, res) => {

  const gameName = req.query.gameName;

  const response = await searchGames(gameName);

  res.render("games/game-search.hbs", { gameInfo: response });
});

router.get("/games/:gameId", async (req, res) => {
  let gameId = req.params.gameId;
  const response = await gameDetails(gameId);

  res.render("games/game-details.hbs", { gameInfo: response });
});


async function getGames(offset = 0, limit = 50) {
  try {
    // Example using all methods.
    const response = await IGDB(apiKey)
      .fields("name,cover.url,first_release_date,summary,version_parent")
      // age_ratings,aggregated_rating,aggregated_rating_count,alternative_names,artworks,bundles,category,collection,cover,created_at,dlcs,expansions,external_games,first_release_date,follows,franchise,franchises,game_engines,game_modes,genres,hypes,involved_companies,keywords,multiplayer_modes,name,parent_game,platforms,player_perspectives,popularity,pulse_count,rating,rating_count,release_dates,screenshots,similar_games,slug,standalone_expansions,status,storyline,summary,tags,themes,time_to_beat,total_rating,total_rating_count,updated_at,url,version_parent,version_title,videos,websites

      //.fields("name, screenshots") // same as above
      .offset(offset) // offset results by 10
      .limit(limit) // limit to 50 results

      //.sort("name") // default sort direction is 'asc' (ascending)
      //.sort("name", "desc") // sorts by name, descending
      //.sort("name")
      //.search("Street Fighter") // search for a specific name (search implementations can vary)

      //.where(`first_release_date > ${new Date().getTime() / 1000}`) // filter the results
      ////.where(`name = "Street Fighter"`) // filter the results

      .request("/games"); // execute the query and return a response object

    return response.data;

    //res.render("games.hbs", { games });
  } catch (error) {
    console.log(error);
  }
}

async function searchGames(gameName, offset = 0, limit = 50) {
  try {
    // Example using all methods.
    const response = await IGDB(apiKey)
      .fields("name,cover.url,screenshots.url,franchises")
      // age_ratings,aggregated_rating,aggregated_rating_count,alternative_names,artworks,bundles,category,collection,cover,created_at,dlcs,expansions,external_games,first_release_date,follows,franchise,franchises,game_engines,game_modes,genres,hypes,involved_companies,keywords,multiplayer_modes,name,parent_game,platforms,player_perspectives,popularity,pulse_count,rating,rating_count,release_dates,screenshots,similar_games,slug,standalone_expansions,status,storyline,summary,tags,themes,time_to_beat,total_rating,total_rating_count,updated_at,url,version_parent,version_title,videos,websites

      //.fields("name, screenshots") // same as above
      .offset(offset) // offset results by 10
      .limit(limit) // limit to 50 results

      //.sort("name") // default sort direction is 'asc' (ascending)
      //.sort("name", "desc") // sorts by name, descending
      .sort("first_release_date")
      //.search(gameName) // search for a specific name (search implementations can vary)

      //.where(`first_release_date > ${new Date().getTime() / 1000}`) // filter the results
      ////.where(`name = "Street Fighter"`) // filter the results
      //.where(`name ~ *"${gameName}"* & franchises=[571]`) // filter the results
      .where(`name ~ *"${gameName}"*`) // filter the results

      .request("/games"); // execute the query and return a response object

    return response.data;

    //res.render("games.hbs", { games });
  } catch (error) {
    console.log(error);
  }
}

async function gameDetails(gameId) {
  try {
    const response = await IGDB(apiKey)
      .fields("game,game.name,game.cover.url,game.screenshots.url")
      .where(`game=${gameId}`)
      .request("/search");

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

function getYearsAgo(year1) {
  const date2 = new Date();
  return date2.getFullYear() - year1;
}

module.exports = router;