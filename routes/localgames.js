const express = require("express");
const router = express.Router();
const Game = require("../models/Game");
const uploadCloud = require("../config/cloudinary.js");
const hbs = require("hbs");

//hbs.registerHelper("toDate", date => new Date(date).toDateString());
hbs.registerHelper("toDate2", date => formatDate(date));

//HELPERS
function formatDate(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}

//display all
router.get("/localgames", (req, res) => {
  Game.find({})
    .then(games => {
      res.render("localgames/localgames", { games });
    })
    .catch(err => {
      console.log("Error while retrieving the games", err);
    });
});

//add new game
router.get("/addlocalgame", async (req, res) => {

  let games = await getGames();
  res.render("localgames/addlocalgame", { games });

});

router.post("/addlocalgame", uploadCloud.single("photo"),
  async (req, res, next) => {
    //console.log("--------", req.body.genre)
    const { name, publisher, firstrelease, summary } = req.body;

    //PARENT
    let parentSerieId = req.body.parent;
    let serie = "";

    if (parentSerieId == "0") {
      serie = name;
    } else {
      let parent = await getOneGame(parentSerieId);
      serie = parent.serie + "," + name;
    }

    const genre = req.body.genre;
    const imgPath = req.file.url;
    const imgName = req.file.originalname;

    const newGame = new Game({
      name,
      genre,
      serie: serie,
      publisher,
      firstrelease,
      summary,
      imgPath,
      imgName
    });

    Game.exists({ "name": name }).then(g => {
      if (g) {
        console.log("Game already exists", g);
      } else {
        console.log("New game", g);
        //Add
        newGame
          .save()
          .then(() => {
            res.redirect("/localgames");
          })
          .catch(err => {
            console.log("Error while adding the game", err);
          });
      }
    });
  }
);

//show a game's detail
router.get("/detailslocalgame/:gameId", async (req, res) => {

  try {
    
    let gameFound = await getGameById(req.params.gameId);    
    let ltl = await getLocalGameTimeLine(gameFound.name);
    
    let formatedResponse = await mapCollection(ltl);

    res.render("localgames/detailslocalgame", {
      game: gameFound,
      formatedResponse
    });

  } catch (error) {
      console.log("Error while retrieving the game", error);
  }
  
});

//edit and update a game
router.get("/updatelocalgame/:gameId", (req, res) => {
  Game.findById(req.params.gameId)
    .then(game => {
      console.log(game.firstrelease);
      res.render("localgames/updatelocalgame", { game });
    })
    .catch(err => {
      console.log("Error while retrieving the game", err);
    });
});

//update
router.post("/updatelocalgame/:gameId",
  uploadCloud.single("photo"),
  (req, res) => {
    const { name, publisher, firstrelease, summary } = req.body;
    const genre = req.body.genre;
    const serie = req.body.serie;
    const imgPath = req.file.url;
    const imgName = req.file.originalname;
    // const newGame = new Game({
    //   name,
    //   genre,
    //   serie,
    //   publisher,
    //   firstrelease,
    //   summary,
    //   imgPath,
    //   imgName
    // });
    // newGame.save();

    Game.findByIdAndUpdate(req.params.gameId, {
      name,
      genre,
      serie,
      publisher,
      firstrelease,
      summary,
      imgPath,
      imgName
    })
      .then(() => {
        res.redirect(`/localgames`);
      })
      .catch(err => {
        console.log("Error while updating the game: ", err);
      });
  }
);

//delete an existing game
router.get("/deletelocalgame/:id", (req, res) => {
  
  const gameId = req.params.id;

  Game.deleteOne({ _id: gameId })
    .then(game => {
      console.log("deleted game", game);
      res.redirect("/localgames");
    })
    .catch(err => {
      console.log("Failed to delete the game", err);
    });
});

//search a game
 router.get("/searchlocalgame", (req, res)=>{
  const search = req.query.searchbyname;
  
  if (search) {
    Game.find({
      name: { $regex: new RegExp("^" + search.toLowerCase(), "i") }
    }).then(game => {
      //res.send(game);
      res.render("localgames/localgames", { games: game });
    });  
  }

});

async function getOneGame(gameId){
  try {
    let game = await Game.findById(gameId);
    return game;
  } catch (error) {
    console.log("Error while retrieving the games", error);
  }
}

async function getGames(){
  try {
    let games = await Game.find();
    return games;
  } catch (error) {
    console.log("Error while retrieving the games", error);
  }
}

async function getGameById(gameId) {
  try {
    let game = await Game.findById(gameId);
    return game;
  } catch (error) {
    console.log("Error while retrieving the games", error);
  }
}

async function getLocalGameTimeLine(gameName) {

  try {
    let localTimeLine = await Game.find({
      serie: { $regex: new RegExp("^" + gameName + "*") }
    });

    return localTimeLine;
  } catch (error) {
    console.log(error);
  }
}

async function mapCollection(collection) {
  
  collection.sort(compare);

  let result = [];

  for (let i = 0; i < collection.length; i++) {
    result.push({
      key: i + 1,
      name: collection[i].name,
      first_release_date: formatDate(collection[i].firstrelease),
      parent: i,
      url: collection[i].imgPath,
      link: collection[i]._id
    });
  }

  return await result;
}

function compare(a, b) {
  const genreA = a.firstrelease;
  const genreB = b.firstrelease;

  let comparison = 0;
  if (genreA > genreB) {
    comparison = 1;
  } else if (genreA < genreB) {
    comparison = -1;
  }
  return comparison;
}


module.exports = router;
