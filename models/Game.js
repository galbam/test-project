const mongoose = require('mongoose');
const {Schema}   = mongoose;

const gameSchema = new Schema({
  name:String,
  genre:String,
  serie:String,
  publisher:String,
  firstrelease:Date,
  summary: String,
  imgName:String,
  imgPath:String,
});

const Game = mongoose.model('Game', gameSchema);
module.exports = Game;

