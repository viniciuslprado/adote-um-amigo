import axios from "axios";

const backendApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:4000/api",
});

export function createAnimalSlug(name) {
  return String(name || "animal")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeAnimal(animal) {
  return {
    ...animal,
    id: animal.id || animal._id,
    age: animal.age || "Nao informado",
    location:
      animal.location ||
      [animal.city, animal.state].filter(Boolean).join(" - ") ||
      "Abrigo parceiro",
    description: animal.description || "Sem descricao disponivel.",
    origin: animal.origin || "Origem nao informada",
    dataSource: animal.dataSource || (animal._id ? "mongodb" : "external"),
  };
}

export async function getAllAnimals(params = {}) {
  try {
    const response = await backendApi.get("/animals", {
      params: {
        limit: 100,
        externalLimit: 12,
        ...params,
      },
    });
    const animals = Array.isArray(response.data) ? response.data : response.data.items || [];

    return animals.map(normalizeAnimal);
  } catch (error) {
    const detail = error.response?.data || error.message;
    console.warn("Nao foi possivel carregar animais.", detail);
    throw new Error("Nao foi possivel carregar os animais. Verifique se o backend e o MongoDB estao rodando.");
  }
}

export async function getAnimalById(id) {
  try {
    const response = await backendApi.get(`/animals/${id}`);
    return normalizeAnimal(response.data);
  } catch (error) {
    const animals = await getAllAnimals();
    return animals.find((animal) => animal.id === id) || null;
  }
}

export async function getAnimalBySlug(slug) {
  const animals = await getAllAnimals();
  return (
    animals.find(
      (animal) => createAnimalSlug(animal.name) === slug || animal.id === slug
    ) || null
  );
}

export async function createAdoptionRequest(data) {
  try {
    const response = await backendApi.post("/adoptions", data);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error;
    }

    console.warn("API local indisponivel. Simulando envio do cadastro.", error.message);
    return {
      id: `local-${Date.now()}`,
      status: "pending",
      localOnly: true,
      ...data,
    };
  }
}
