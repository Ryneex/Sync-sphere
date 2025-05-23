import mongoose, { Schema, Types } from "mongoose";
import { IRoom } from "./room.model.js";

type Source = "youtube" | "soundcloud";

export interface ISong extends Document {
  externalId: string;
  title: string;
  source: Source;
  vote: Types.ObjectId[];
  noOfVote: number;
  room: IRoom;
  artist: string;
}

const songSchema: Schema<ISong> = new Schema(
  {
    externalId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },

    artist: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      enum: ["youtube", "soundcloud"],
      required: true,
    },
    vote: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    noOfVote: {
      type: Number,
      default: 0,
    },

    room: {
      type: mongoose.Types.ObjectId,
      ref: "Stream",
    },
  },
  {
    timestamps: true,
  }
);

export const Song = mongoose.model("Song", songSchema);
