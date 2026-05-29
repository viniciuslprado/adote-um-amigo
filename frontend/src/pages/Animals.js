import { useEffect, useMemo, useState } from "react";
import AnimalCard from "../components/AnimalCard";
import { getAllAnimals } from "../services/api";

function Animals() {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [speciesFilter, setSpeciesFilter] = useState("Todos");
  const [cityFilter, setCityFilter] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("name-asc");

  useEffect(() => {
    async function loadAnimals() {
      try {
        setError("");
        const allAnimals = await getAllAnimals();
        setAnimals(allAnimals);
      } catch (err) {
        console.error("Erro ao carregar animais:", err);
        setError(err.message || "Nao foi possivel carregar os animais.");
      } finally {
        setLoading(false);
      }
    }

    loadAnimals();
  }, []);

  const speciesOptions = useMemo(() => {
    const species = animals.map((animal) => animal.type);
    return ["Todos", ...new Set(species)];
  }, [animals]);

  const cityOptions = useMemo(() => {
    const cities = animals.map((animal) => animal.location);
    return ["Todas", ...new Set(cities)];
  }, [animals]);

  const filteredAnimals = useMemo(() => {
    const result = animals.filter((animal) => {
      const matchesSpecies = speciesFilter === "Todos" || animal.type === speciesFilter;
      const matchesCity = cityFilter === "Todas" || animal.location === cityFilter;
      const normalizedSearch = searchTerm.toLowerCase();
      const matchesSearch =
        animal.name.toLowerCase().includes(normalizedSearch) ||
        animal.type.toLowerCase().includes(normalizedSearch) ||
        animal.description.toLowerCase().includes(normalizedSearch);

      return matchesSpecies && matchesCity && matchesSearch;
    });

    const sorted = [...result];

    if (sortOption === "name-asc") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === "name-desc") {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortOption === "species") {
      sorted.sort((a, b) => a.type.localeCompare(b.type));
    }

    return sorted;
  }, [animals, speciesFilter, cityFilter, searchTerm, sortOption]);

  function clearFilters() {
    setSpeciesFilter("Todos");
    setCityFilter("Todas");
    setSearchTerm("");
    setSortOption("name-asc");
  }

  if (loading) {
    return <h2 className="status-message">Carregando animais...</h2>;
  }

  if (error) {
    return (
      <section className="status-panel">
        <h1>Nao foi possivel carregar a vitrine</h1>
        <p>{error}</p>
        <button type="button" className="clear-filters-button" onClick={() => window.location.reload()}>
          Tentar novamente
        </button>
      </section>
    );
  }

  return (
    <section>
      <h1>Animais para adocao</h1>
      <p>
        Conheca caes, gatos e outros animais especiais que estao esperando um
        novo lar.
      </p>

      <div className="filters-bar">
        <div className="filter-group">
          <label htmlFor="search">Buscar</label>
          <input
            id="search"
            type="text"
            placeholder="Digite nome, especie ou descricao"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="species">Especie</label>
          <select
            id="species"
            value={speciesFilter}
            onChange={(event) => setSpeciesFilter(event.target.value)}
          >
            {speciesOptions.map((species) => (
              <option key={species} value={species}>
                {species}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="city">Cidade</label>
          <select
            id="city"
            value={cityFilter}
            onChange={(event) => setCityFilter(event.target.value)}
          >
            {cityOptions.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="sort">Ordenar por</label>
          <select
            id="sort"
            value={sortOption}
            onChange={(event) => setSortOption(event.target.value)}
          >
            <option value="name-asc">Nome A-Z</option>
            <option value="name-desc">Nome Z-A</option>
            <option value="species">Especie</option>
          </select>
        </div>
      </div>

      <div className="filters-actions">
        <button type="button" className="clear-filters-button" onClick={clearFilters}>
          Limpar filtros
        </button>
      </div>

      <p className="results-count">
        {filteredAnimals.length} animal(is) encontrado(s)
      </p>

      <div className="grid">
        {filteredAnimals.length > 0 ? (
          filteredAnimals.map((animal) => (
            <AnimalCard key={animal.id} animal={animal} />
          ))
        ) : (
          <p className="status-message">Nenhum animal encontrado com esses filtros.</p>
        )}
      </div>
    </section>
  );
}

export default Animals;
