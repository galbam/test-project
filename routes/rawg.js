const express = require("express");
const Rawger = require("rawger");
const axios = require("axios");

const router = express.Router();

let url = "https://api.rawg.io/api/games";

router.get("/rawg", async (req, res) => {
  
  try {
    let response = await axios.get(url);
    res.render("rawg/rawg.hbs", { rawg: response.data });
  } 
  catch (error) {
    console.log(error);
  }

});

router.get("/rawg-next/:pageNumber", async (req, res) => {

  try {
    let response = await axios.get(url + "?page=" + req.params.pageNumber);
    res.render("rawg/rawg.hbs", { rawg: response.data });
  } catch (error) {
    console.log(error);
  }
});

router.get("/rawg-search", async (req, res) => {

  const gameName = req.query.gameName;

  const { games } = await Rawger({});
  const results = (await games.search(gameName)).get();

  res.render("rawg/rawg-search.hbs", { rawg: results });

});

// router.get("/rawg/:gameName", async (req, res, next) => {
//   let gameName = req.params.gameName;

//   const { games } = await Rawger({});
//   const results = (await games.search(gameName)).get();

//   res.send(results);
// });

module.exports = router;
