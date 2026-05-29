const mongoose = require("mongoose");

const animalSnapshotSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    type: String,
    city: String,
    state: String,
    image: String,
    origin: String,
  },
  { _id: false }
);

const adoptionRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: null,
      index: true,
    },
    animalId: {
      type: String,
      required: true,
      index: true,
    },
    animalSnapshot: animalSnapshotSchema,
    applicantName: {
      type: String,
      required: true,
      trim: true,
    },
    applicantEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    applicantPhone: {
      type: String,
      required: true,
      trim: true,
    },
    applicantAge: {
      type: Number,
      required: true,
      min: 18,
    },
    state: {
      type: String,
      required: true,
      uppercase: true,
    },
    city: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
      index: true,
    },
    adminNotes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdoptionRequest", adoptionRequestSchema);
