const { z } = require("zod");
const AdoptionRequest = require("../models/AdoptionRequest");
const { findAvailableAnimal } = require("../services/animalService");

const createSchema = z.object({
  animalId: z.string().min(1),
  applicantName: z.string().min(2),
  applicantEmail: z.string().email(),
  applicantPhone: z.string().min(10),
  applicantAge: z.coerce.number().min(18),
  state: z.string().min(2),
  city: z.string().min(1),
  message: z.string().min(5),
});

async function createAdoptionRequest(req, res) {
  const data = createSchema.parse(req.body);
  const animal = await findAvailableAnimal(data.animalId);

  if (!animal) {
    return res.status(400).json({ message: "Animal inexistente ou indisponivel para adocao." });
  }

  const adoptionRequest = await AdoptionRequest.create({
    ...data,
    userId: req.user?.id || null,
    animalSnapshot: {
      id: animal._id,
      name: animal.name,
      type: animal.type,
      city: animal.city,
      state: animal.state,
      image: animal.image,
      origin: animal.origin,
    },
  });

  return res.status(201).json(adoptionRequest);
}

async function listAdoptionRequests(req, res) {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
  const skip = (page - 1) * limit;
  const filter = {};

  if (req.user.role !== "admin") {
    filter.userId = req.user.id;
  }

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const [items, total] = await Promise.all([
    AdoptionRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    AdoptionRequest.countDocuments(filter),
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

async function getAdoptionRequest(req, res) {
  const filter = { _id: req.params.id };

  if (req.user.role !== "admin") {
    filter.userId = req.user.id;
  }

  const adoptionRequest = await AdoptionRequest.findOne(filter);

  if (!adoptionRequest) {
    return res.status(404).json({ message: "Solicitacao nao encontrada." });
  }

  return res.json(adoptionRequest);
}

async function updateAdoptionStatus(req, res) {
  const schema = z.object({
    status: z.enum(["pending", "approved", "rejected", "cancelled"]),
    adminNotes: z.string().optional(),
  });
  const data = schema.parse(req.body);
  const adoptionRequest = await AdoptionRequest.findByIdAndUpdate(req.params.id, data, {
    new: true,
  });

  if (!adoptionRequest) {
    return res.status(404).json({ message: "Solicitacao nao encontrada." });
  }

  return res.json(adoptionRequest);
}

module.exports = {
  createAdoptionRequest,
  listAdoptionRequests,
  getAdoptionRequest,
  updateAdoptionStatus,
};
