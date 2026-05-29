import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { createAdoptionRequest, getAllAnimals } from "../services/api";

function Register() {
  const [searchParams] = useSearchParams();
  const selectedAnimalFromUrl = searchParams.get("animal") || "";
  const selectedAnimalIdFromUrl = searchParams.get("animalId") || "";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    state: "",
    city: "",
    animalInterest: "",
    message: "",
  });

  const [availableAnimals, setAvailableAnimals] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadAnimals() {
      try {
        const animals = await getAllAnimals();
        setAvailableAnimals(animals);

        if (selectedAnimalIdFromUrl || selectedAnimalFromUrl) {
          setFormData((prev) => ({
            ...prev,
            animalInterest: selectedAnimalIdFromUrl || selectedAnimalFromUrl,
          }));
        }
      } catch (error) {
        console.error("Erro ao carregar lista de animais:", error);
      }
    }

    loadAnimals();
  }, [selectedAnimalFromUrl, selectedAnimalIdFromUrl]);

  useEffect(() => {
    async function fetchStates() {
      try {
        const response = await fetch(
          "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
        );
        const data = await response.json();
        setStates(data);
      } catch (error) {
        console.error("Erro ao carregar estados:", error);
      }
    }

    fetchStates();
  }, []);

  useEffect(() => {
    async function fetchCities() {
      if (!formData.state) {
        setCities([]);
        return;
      }

      try {
        const response = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${formData.state}/municipios`
        );
        const data = await response.json();
        setCities(data);
      } catch (error) {
        console.error("Erro ao carregar cidades:", error);
      }
    }

    fetchCities();
  }, [formData.state]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "state" ? { city: "" } : {}),
    }));
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Informe seu nome.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Informe seu e-mail.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Informe um e-mail valido.";
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Informe seu telefone.";
    } else {
      const digitsOnly = formData.phone.replace(/\D/g, "");
      if (digitsOnly.length < 10 || digitsOnly.length > 11) {
        newErrors.phone = "Informe um telefone valido com DDD.";
      }
    }

    if (!formData.age.trim()) {
      newErrors.age = "Informe sua idade.";
    } else if (Number(formData.age) < 18) {
      newErrors.age = "A idade deve ser pelo menos 18 anos.";
    }

    if (!formData.state) {
      newErrors.state = "Selecione um estado.";
    }

    if (!formData.city) {
      newErrors.city = "Selecione uma cidade.";
    }

    if (!formData.animalInterest.trim()) {
      newErrors.animalInterest = "Selecione um animal.";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Escreva uma mensagem.";
    }

    return newErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSuccessMessage("");
      return;
    }

    try {
      await createAdoptionRequest({
        animalId: formData.animalInterest,
        applicantName: formData.name,
        applicantEmail: formData.email,
        applicantPhone: formData.phone,
        applicantAge: formData.age,
        state: formData.state,
        city: formData.city,
        message: formData.message,
      });

      setErrors({});
      setSuccessMessage("Cadastro enviado com sucesso!");

      setFormData({
        name: "",
        email: "",
        phone: "",
        age: "",
        state: "",
        city: "",
        animalInterest: "",
        message: "",
      });

      setCities([]);
    } catch (error) {
      setSuccessMessage("");
      setErrors({
        submit:
          error.response?.data?.message ||
          "Nao foi possivel enviar o cadastro. Tente novamente.",
      });
    }
  }

  const selectedAnimal = availableAnimals.find(
    (animal) =>
      animal.id === formData.animalInterest ||
      animal.name === formData.animalInterest
  );
  const selectedAnimalName =
    selectedAnimal?.name || selectedAnimalFromUrl || formData.animalInterest;

  return (
    <section className="register-page">
      <h1>Cadastro de interesse</h1>
      <p>
        Preencha seus dados para demonstrar interesse em adotar um animal.
      </p>

      {selectedAnimalName && (
        <div className="interest-highlight">
          Voce declarou interesse em adotar: <strong>{selectedAnimalName}</strong>
        </div>
      )}

      <form className="register-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            name="name"
            placeholder="Digite seu nome"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <p className="error-text">{errors.name}</p>}
        </div>

        <div className="form-group">
          <input
            type="text"
            name="email"
            placeholder="Digite seu e-mail"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>

        <div className="form-group">
          <input
            type="text"
            name="phone"
            placeholder="Digite seu telefone com DDD"
            value={formData.phone}
            onChange={handleChange}
          />
          {errors.phone && <p className="error-text">{errors.phone}</p>}
        </div>

        <div className="form-group">
          <input
            type="number"
            name="age"
            placeholder="Digite sua idade"
            value={formData.age}
            onChange={handleChange}
          />
          {errors.age && <p className="error-text">{errors.age}</p>}
        </div>

        <div className="form-group">
          <select
            name="state"
            value={formData.state}
            onChange={handleChange}
          >
            <option value="">Selecione um estado</option>
            {states.map((state) => (
              <option key={state.id} value={state.sigla}>
                {state.nome}
              </option>
            ))}
          </select>
          {errors.state && <p className="error-text">{errors.state}</p>}
        </div>

        <div className="form-group">
          <select
            name="city"
            value={formData.city}
            onChange={handleChange}
            disabled={!formData.state}
          >
            <option value="">Selecione uma cidade</option>
            {cities.map((city) => (
              <option key={city.id} value={city.nome}>
                {city.nome}
              </option>
            ))}
          </select>
          {errors.city && <p className="error-text">{errors.city}</p>}
        </div>

        <div className="form-group">
          <select
            name="animalInterest"
            value={formData.animalInterest}
            onChange={handleChange}
          >
            <option value="">Selecione um animal</option>
            {availableAnimals.map((animal) => (
              <option key={animal.id} value={animal.id}>
                {animal.name} - {animal.type}
              </option>
            ))}
          </select>
          {errors.animalInterest && (
            <p className="error-text">{errors.animalInterest}</p>
          )}
        </div>

        <div className="form-group">
          <textarea
            name="message"
            placeholder="Fale um pouco sobre por que deseja adotar"
            rows="5"
            value={formData.message}
            onChange={handleChange}
          ></textarea>
          {errors.message && <p className="error-text">{errors.message}</p>}
        </div>

        <button type="submit">Enviar cadastro</button>

        {errors.submit && <p className="error-text">{errors.submit}</p>}
        {successMessage && <p className="success-text">{successMessage}</p>}
      </form>
    </section>
  );
}

export default Register;
