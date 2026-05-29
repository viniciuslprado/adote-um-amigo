const mongoose = require("mongoose");

const animalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    age: {
      type: String,
      default: "Nao informado",
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
      index: true,
    },
    state: {
      type: String,
      trim: true,
      uppercase: true,
      index: true,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "Sem descricao disponivel.",
    },
    origin: {
      type: String,
      default: "Origem nao informada",
      index: true,
    },
    status: {
      type: String,
      enum: ["available", "adopted", "unavailable"],
      default: "available",
      index: true,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    externalSource: {
      type: String,
      enum: ["dog-api", "cat-api", "local", null],
      default: "local",
    },
    externalId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Animal", animalSchema);
