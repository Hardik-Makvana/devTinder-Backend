const mongoose = require("mongoose");

const connectionRequestSchema = mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref : "User", //reference to the user collection 
      required: true,
    },

    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
       ref : "User", //reference to the user collection 
      required: true,
    },

    status: {
      type: String,
      required: true,
      enum: ["ignored", "interested", "accepted", "rejected"],
    },                     
  },
  {
    timestamps: true,
  },
);

const connectionRequestModel = mongoose.model(
  "connectionRequest",
  connectionRequestSchema,
);

module.exports = connectionRequestModel;
