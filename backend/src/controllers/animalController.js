const axios = require("axios");
const { z } = require("zod");
const Animal = require("../models/Animal");

const fallbackAnimalImage = "/pata.png";

const animalSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  age: z.string().optional(),
  location: z.string().min(1),
  city: z.string().optional(),
  state: z.string().optional(),
  image: z.string().min(1),
  description: z.string().optional(),
  origin: z.string().optional(),
  status: z.enum(["available", "adopted", "unavailable"]).optional(),
});

function formatDog(dog) {
  return {
    id: `dog-api:${dog.id}`,
    externalSource: "dog-api",
    externalId: String(dog.id),
    name: dog.name,
    type: "Cachorro",
    age: "Nao informado",
    location: "Abrigo parceiro",
    image: dog.image?.url || fallbackAnimalImage,
    description: dog.temperament || "Sem descricao disponivel.",
    origin: dog.origin || "Origem nao informada",
    status: "available",
    dataSource: "external",
  };
}

function formatCat(cat) {
  return {
    id: `cat-api:${cat.id}`,
    externalSource: "cat-api",
    externalId: String(cat.id),
    name: cat.name,
    type: "Gato",
    age: "Nao informado",
    location: "Abrigo parceiro",
    image: cat.image?.url || fallbackAnimalImage,
    description: cat.temperament || "Sem descricao disponivel.",
    origin: cat.origin || "Origem nao informada",
    status: "available",
    dataSource: "external",
  };
}

function buildQuery(query) {
  const filter = { active: true };

  if (query.name) filter.name = { $regex: query.name, $options: "i" };
  if (query.type) filter.type = query.type;
  if (query.city) filter.city = query.city;
  if (query.state) filter.state = query.state.toUpperCase();
  if (query.origin) filter.origin = query.origin;
  if (query.status) filter.status = query.status;

  return filter;
}

function buildSort(sort = "name:asc") {
  const [field, direction] = sort.split(":");
  const allowedFields = ["name", "type", "city", "createdAt", "status"];
  const safeField = allowedFields.includes(field) ? field : "name";
  return { [safeField]: direction === "desc" ? -1 : 1 };
}

function getAnimalSourceKey(animal) {
  if (animal.externalSource && animal.externalId) {
    return `${animal.externalSource}:${animal.externalId}`;
  }

  return String(animal._id || animal.id || animal.name);
}

function mergeAnimals(databaseAnimals, externalAnimals) {
  const seen = new Set();
  const merged = [];

  [...databaseAnimals, ...externalAnimals].forEach((animal) => {
    const key = getAnimalSourceKey(animal);

    if (!seen.has(key)) {
      seen.add(key);
      merged.push(animal);
    }
  });

  return merged;
}

function compareAnimals(sort = "name:asc") {
  const [field, direction] = sort.split(":");
  const allowedFields = ["name", "type", "city", "createdAt", "status"];
  const safeField = allowedFields.includes(field) ? field : "name";
  const multiplier = direction === "desc" ? -1 : 1;

  return (firstAnimal, secondAnimal) => {
    const firstValue = firstAnimal[safeField] || "";
    const secondValue = secondAnimal[safeField] || "";

    return String(firstValue).localeCompare(String(secondValue)) * multiplier;
  };
}

function matchesExternalFilters(animal, query) {
  if (query.name && !animal.name.toLowerCase().includes(String(query.name).toLowerCase())) {
    return false;
  }

  if (query.type && animal.type !== query.type) {
    return false;
  }

  if (query.city && animal.city !== query.city) {
    return false;
  }

  if (query.state && animal.state !== String(query.state).toUpperCase()) {
    return false;
  }

  if (query.origin && animal.origin !== query.origin) {
    return false;
  }

  if (query.status && animal.status !== query.status) {
    return false;
  }

  return true;
}

async function getExternalAnimals(limit) {
  const results = await Promise.allSettled([
    axios.get("https://api.thedogapi.com/v1/breeds", {
      headers: { "x-api-key": process.env.REACT_APP_DOG_API_KEY },
    }),
    axios.get("https://api.thecatapi.com/v1/breeds", {
      headers: { "x-api-key": process.env.REACT_APP_CAT_API_KEY },
    }),
  ]);

  let dogImages = [];
  try {
    const imagesRes = await axios.get(`https://dog.ceo/api/breeds/image/random/${limit}`);
    dogImages = imagesRes.data.message;
  } catch (e) {
    console.warn("Falha ao buscar imagens de fallback para caes.");
  }

  const rawDogs = results[0].status === "fulfilled" ? results[0].value.data.slice(0, limit) : [];
  const dogs = rawDogs.map((dog, index) => {
    const formattedDog = formatDog(dog);
    if (formattedDog.image === fallbackAnimalImage && dogImages[index]) {
      formattedDog.image = dogImages[index];
    }
    return formattedDog;
  });

  const cats =
    results[1].status === "fulfilled"
      ? results[1].value.data
          .filter((cat) => cat.image?.url)
          .slice(0, limit)
          .map(formatCat)
      : [];

  return [...dogs, ...cats];
}

async function listAnimals(req, res) {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
  const skip = (page - 1) * limit;
  const externalLimit = Math.min(Math.max(Number(req.query.externalLimit) || 12, 1), 50);
  const includeExternal = req.query.includeExternal !== "false";
  const filter = buildQuery(req.query);
  const sort = buildSort(req.query.sort);

  const [databaseAnimals, externalAnimals] = await Promise.all([
    Animal.find(filter).sort(sort).lean(),
    includeExternal ? getExternalAnimals(externalLimit) : Promise.resolve([]),
  ]);
  const formattedDatabaseAnimals = databaseAnimals.map((animal) => ({
    ...animal,
    dataSource: "mongodb",
  }));
  const filteredExternalAnimals = externalAnimals.filter((animal) =>
    matchesExternalFilters(animal, req.query)
  );
  const allItems = mergeAnimals(formattedDatabaseAnimals, filteredExternalAnimals).sort(
    compareAnimals(req.query.sort)
  );
  const items = allItems.slice(skip, skip + limit);

  return res.json({
    items,
    pagination: {
      page,
      limit,
      total: allItems.length,
      pages: Math.ceil(allItems.length / limit),
    },
    sources: {
      mongodb: databaseAnimals.length,
      external: filteredExternalAnimals.length,
      returned: items.length,
    },
  });
}

async function listDatabaseAnimals(req, res) {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 100);
  const skip = (page - 1) * limit;
  const filter = buildQuery(req.query);
  const sort = buildSort(req.query.sort);

  const [items, total] = await Promise.all([
    Animal.find(filter).sort(sort).skip(skip).limit(limit),
    Animal.countDocuments(filter),
  ]);

  return res.json({
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}

async function importDogs(req, res) {
  const limit = Number(req.query.limit) || 6;
  const response = await axios.get("https://api.thedogapi.com/v1/breeds", {
    headers: { "x-api-key": process.env.REACT_APP_DOG_API_KEY },
  });

  const dogs = response.data.slice(0, limit);
  let dogImages = [];
  try {
    const imagesRes = await axios.get(`https://dog.ceo/api/breeds/image/random/${limit}`);
    dogImages = imagesRes.data.message;
  } catch (e) {
    console.warn("Falha ao buscar imagens de fallback para caes na importacao.");
  }

  const saved = [];

  for (let i = 0; i < dogs.length; i++) {
    const dog = dogs[i];
    const image = dog.image?.url || dogImages[i] || fallbackAnimalImage;

    const animal = await Animal.findOneAndUpdate(
      { externalSource: "dog-api", externalId: String(dog.id) },
      {
        name: dog.name,
        type: "Cachorro",
        age: "Nao informado",
        location: "Abrigo parceiro",
        image: image,
        description: dog.temperament || "Sem descricao disponivel.",
        origin: dog.origin || "Origem nao informada",
        active: true,
        status: "available",
        deletedAt: null,
        externalSource: "dog-api",
        externalId: String(dog.id),
      },
      { upsert: true, new: true }
    );
    saved.push(animal);
  }

  return res.status(201).json({ imported: saved.length, items: saved });
}

async function importCats(req, res) {
  const response = await axios.get("https://api.thecatapi.com/v1/breeds", {
    headers: { "x-api-key": process.env.REACT_APP_CAT_API_KEY },
  });

  const cats = response.data.filter((cat) => cat.image?.url).slice(0, Number(req.query.limit) || 6);
  const saved = [];

  for (const cat of cats) {
    const animal = await Animal.findOneAndUpdate(
      { externalSource: "cat-api", externalId: String(cat.id) },
      {
        name: cat.name,
        type: "Gato",
        age: "Nao informado",
        location: "Abrigo parceiro",
        image: cat.image.url,
        description: cat.temperament || "Sem descricao disponivel.",
        origin: cat.origin || "Origem nao informada",
        active: true,
        status: "available",
        deletedAt: null,
        externalSource: "cat-api",
        externalId: String(cat.id),
      },
      { upsert: true, new: true }
    );
    saved.push(animal);
  }

  return res.status(201).json({ imported: saved.length, items: saved });
}

async function listExternalAnimals(req, res) {
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 50);
  const items = await getExternalAnimals(limit);

  return res.json({ items });
}

async function getAnimal(req, res) {
  const animal = await Animal.findOne({ _id: req.params.id, active: true });

  if (!animal) {
    return res.status(404).json({ message: "Animal nao encontrado." });
  }

  return res.json(animal);
}

async function createAnimal(req, res) {
  const data = animalSchema.parse(req.body);
  const animal = await Animal.create(data);
  return res.status(201).json(animal);
}

async function replaceAnimal(req, res) {
  const data = animalSchema.parse(req.body);
  const animal = await Animal.findOneAndUpdate({ _id: req.params.id, active: true }, data, {
    new: true,
  });

  if (!animal) {
    return res.status(404).json({ message: "Animal nao encontrado." });
  }

  return res.json(animal);
}

async function updateAnimal(req, res) {
  const data = animalSchema.partial().parse(req.body);
  const animal = await Animal.findOneAndUpdate({ _id: req.params.id, active: true }, data, {
    new: true,
  });

  if (!animal) {
    return res.status(404).json({ message: "Animal nao encontrado." });
  }

  return res.json(animal);
}

async function deleteAnimal(req, res) {
  const animal = await Animal.findOneAndUpdate(
    { _id: req.params.id, active: true },
    { active: false, deletedAt: new Date(), status: "unavailable" },
    { new: true }
  );

  if (!animal) {
    return res.status(404).json({ message: "Animal nao encontrado." });
  }

  return res.json({ message: "Animal removido com soft delete.", animal });
}

module.exports = {
  listAnimals,
  listDatabaseAnimals,
  importDogs,
  importCats,
  listExternalAnimals,
  getAnimal,
  createAnimal,
  replaceAnimal,
  updateAnimal,
  deleteAnimal,
};
