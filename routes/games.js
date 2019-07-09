const express = require("express");
const axios = require("axios");
const hbs = require("hbs");
const go = require("gojs");
const router = express.Router();

const IGDB = require("igdb-api-node").default;
const apiKey = "39fb8cac0ae4190e1d2d564985023e7d";

//HBS HELPERS
hbs.registerHelper("toDate", UNIX_timestamp => {
  return formatUnixDate(UNIX_timestamp);
});

hbs.registerHelper("youtube", videoId => {
  return `https://www.youtube.com/watch?v=${videoId}`;
});

hbs.registerHelper("t_cover_big", coverUrl => {
  return getCoverBig(coverUrl);

});

hbs.registerHelper("sortTimeLine", collection => {
  return collection.sort(compare);
});

hbs.registerHelper("json", context => {
  return JSON.stringify(context);
});

//ROUTERS
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

  res.render("games/games.hbs", { games: response });
  ////res.render("games/game-search.hbs", { gameInfo: response });
});

router.get("/games/:gameId", async (req, res) => {
  let gameId = req.params.gameId;

  const response = await gameDetails(gameId);

  let formatedResponse = mapCollection(response[0].game.collection.games);
  
  res.render("games/game-details.hbs", {
    games: response,
    formatedResponse: formatedResponse
  });
});


//ASYNC
async function getGames(offset = 0, limit = 50) {
  try {
    // Example using all methods.
    const response = await IGDB(apiKey)
      .fields("name,cover.url,first_release_date,summary")
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
      .fields("name,cover.url,screenshots.url,first_release_date,summary")
      // age_ratings,aggregated_rating,aggregated_rating_count,alternative_names,artworks,bundles,category,collection,cover,created_at,dlcs,expansions,external_games,first_release_date,follows,franchise,franchises,game_engines,game_modes,genres,hypes,involved_companies,keywords,multiplayer_modes,name,parent_game,platforms,player_perspectives,popularity,pulse_count,rating,rating_count,release_dates,screenshots,similar_games,slug,standalone_expansions,status,storyline,summary,tags,themes,time_to_beat,total_rating,total_rating_count,updated_at,url,version_parent,version_title,videos,websites

      //.fields("name, screenshots") // same as above
      .offset(offset) // offset results by 10
      .limit(limit) // limit to 50 results

      //.sort("name") // default sort direction is 'asc' (ascending)
      //.sort("name", "desc") // sorts by name, descending
      //.sort("first_release_date")
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
      .fields(
        "game, game.name, game.genres.name, game.cover.url, game.first_release_date, game.platforms.slug, game.popularity, game.total_rating, game.videos.video_id, game.involved_companies.company.name, game.involved_companies.company.country, game.involved_companies.company.logo.url, game.summary, game.screenshots.url, game.collection.games.name, game.collection.games.first_release_date, game.collection.games.cover.url"
      )
      //.sort("game.first_release_date")
      .where(`game=${gameId}`)
      .request("/search");

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

async function gameTimeLine(gameName, offset = 0, limit = 50) {
  try {
    // Example using all methods.
    const response = await IGDB(apiKey)
      .fields(
        "name,cover.url,franchises.games.name, franchises.games.first_release_date, franchises.games.cover.url"
      )
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


//JS HELPERS
function getYearsAgo(year1) {
  const date2 = new Date();
  return date2.getFullYear() - year1;
}

function compare(a, b) {
  const genreA = a.first_release_date;
  const genreB = b.first_release_date;

  let comparison = 0;
  if (genreA > genreB) {
    comparison = 1;
  } else if (genreA < genreB) {
    comparison = -1;
  }
  return comparison;
}

function formatUnixDate(unixDate){
  var a = new Date(unixDate * 1000);
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
}

function getCoverBig(coverUrlToBig){
  return coverUrlToBig.replace("t_thumb", "t_cover_big");
}

function mapCollection(collection){

  collection.sort(compare);

  let result = [];
  result.push({
    key: 0,
    name: collection[0].name,
    first_release_date: formatUnixDate(collection[0].first_release_date),
    url: getCoverBig(collection[0].cover.url)
  });

  for (let i = 0; i < collection.length; i++) {

    result.push({
      key: i + 1,
      name: collection[i].name,
      first_release_date: formatUnixDate(collection[i].first_release_date),
      parent: i,
      url: getCoverBig(collection[i].cover.url)
    });
  
  }

  return result;
}


module.exports = router;