import { Link } from "react-router-dom";
import { createAnimalSlug } from "../services/api";
import { FALLBACK_ANIMAL_IMAGE, useFallbackImage } from "../utils/images";

function AnimalCard({ animal }) {
  const animalPath = `/animals/${createAnimalSlug(animal.name)}`;

  return (
    <div className="card">
      <img
        src={animal.image || FALLBACK_ANIMAL_IMAGE}
        alt={animal.name}
        className="card-image"
        onError={useFallbackImage}
      />

      <h3>{animal.name}</h3>
      <p><strong>Especie:</strong> {animal.type}</p>
      <p><strong>Idade:</strong> {animal.age}</p>
      <p className="card-description">{animal.description}</p>
      <p><strong>Local:</strong> {animal.location}</p>

      <Link to={animalPath} className="button-link">
        Ver detalhes
      </Link>
    </div>
  );
}

export default AnimalCard;
