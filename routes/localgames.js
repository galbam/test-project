const express = require("express");
const router = express.Router();
const Game = require("../models/Game");
const uploadCloud = require("../config/cloudinary.js");
const hbs = require("hbs");

hbs.registerHelper("toDate", date => new Date(date).toDateString());
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
router.get("/addlocalgame", (req, res) => {
  res.render("localgames/addlocalgame");
});

router.post("/addlocalgame", uploadCloud.single("photo"), (req, res, next) => {
  //console.log("--------",req.body.genre)
  const { name, publisher, firstrelease, summary } = req.body;
  const genre = req.body.genre;
  const serie = req.body.serie;
  const imgPath = req.file.url;
  const imgName = req.file.originalname;
  const newGame = new Game({
    name,
    genre,
    serie,
    publisher,
    firstrelease,
    summary,
    imgPath,
    imgName
  });

  newGame
    .save()
    .then(() => {
      res.redirect("/localgames");
    })
    .catch(err => {
      console.log("Error while adding the game", err);
    });
});

//show a game's detail
router.get("/detailslocalgame/:gameId", (req, res) => {
  Game.findById(req.params.gameId)
    .then(game => {
      res.render("localgames/detailslocalgame", { game });
    })
    .catch(err => {
      console.log("Error while retrieving the game", err);
    });
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

module.exports = router;
