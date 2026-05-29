const axios = require("axios");
const mongoose = require("mongoose");
const Animal = require("../models/Animal");

const fallbackAnimalImage = "/pata.png";

function parseExternalAnimalId(animalId) {
  const match = String(animalId).match(/^(dog-api|cat-api):(.+)$/);

  if (!match) {
    return null;
  }

  return {
    externalSource: match[1],
    externalId: match[2],
  };
}

function formatExternalAnimal(externalSource, animal) {
  const isDog = externalSource === "dog-api";

  return {
    name: animal.name,
    type: isDog ? "Cachorro" : "Gato",
    age: "Nao informado",
    location: "Abrigo parceiro",
    image: animal.image?.url || fallbackAnimalImage,
    description: animal.temperament || "Sem descricao disponivel.",
    origin: animal.origin || "Origem nao informada",
    active: true,
    status: "available",
    deletedAt: null,
    externalSource,
    externalId: String(animal.id),
  };
}

async function findExternalAnimal({ externalSource, externalId }) {
  const url =
    externalSource === "dog-api"
      ? "https://api.thedogapi.com/v1/breeds"
      : "https://api.thecatapi.com/v1/breeds";
  const apiKey =
    externalSource === "dog-api" ? process.env.DOG_API_KEY : process.env.CAT_API_KEY;

  const response = await axios.get(url, {
    headers: { "x-api-key": apiKey },
  });
  const animal = response.data.find((item) => String(item.id) === String(externalId));

  if (!animal) {
    return null;
  }

  return formatExternalAnimal(externalSource, animal);
}

async function findAvailableAnimal(animalId) {
  const externalAnimalId = parseExternalAnimalId(animalId);

  if (externalAnimalId) {
    const existingAnimal = await Animal.findOne({
      ...externalAnimalId,
      active: true,
      status: "available",
    });

    if (existingAnimal) {
      return existingAnimal;
    }

    const externalAnimal = await findExternalAnimal(externalAnimalId);

    if (!externalAnimal) {
      return null;
    }

    return Animal.findOneAndUpdate(externalAnimalId, externalAnimal, {
      upsert: true,
      new: true,
    });
  }

  if (!mongoose.isValidObjectId(animalId)) {
    return null;
  }

  return Animal.findOne({
    _id: animalId,
    active: true,
    status: "available",
  });
}

module.exports = { findAvailableAnimal };
