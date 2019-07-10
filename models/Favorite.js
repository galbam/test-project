const mongoose = require("mongoose");
const { Schema } = mongoose;

const favoriteSchema = new Schema(
  {
    game_id: Number,
    name: String,
    cover_url: String,
    first_release_date: Date,
    summary: String
  },
  {
    //game created or updated
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
);

const Favorite = mongoose.model("favorite", favoriteSchema);
module.exports = Favorite;
