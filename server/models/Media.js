
import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ["movie", "series"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    posterUrl: {
      type: String,
      required: true,
    },
    backdropUrl: String,
    releaseYear: Number,
    genres: [String],
    rating: Number,

    rights: {
      status: {
        type: String,
        enum: ["public-domain", "licensed", "permission"],
        required: true,
      },
      licenseName: String,
      licenseUrl: String,
      verifiedAt: Date,
    },

    featured: {
      type: Boolean,
      default: false,
    },
    published: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Media", mediaSchema);
