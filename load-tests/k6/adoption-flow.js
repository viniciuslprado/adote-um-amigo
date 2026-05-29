import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 5,
  duration: "1m",
  thresholds: {
    http_req_failed: ["rate<0.10"],
    http_req_duration: ["p(95)<1000"],
  },
};

const baseUrl = __ENV.BASE_URL || "http://backend:4000";

export default function adoptionFlow() {
  const listResponse = http.get(`${baseUrl}/api/animals?page=1&limit=1`);
  const animals = listResponse.status === 200 ? listResponse.json("items") || [] : [];

  check(listResponse, {
    "lista animais": (res) => res.status === 200,
    "tem pelo menos um animal": () => animals.length > 0,
  });

  if (!animals.length) {
    sleep(1);
    return;
  }

  const animal = animals[0];
  const payload = JSON.stringify({
    animalId: animal._id,
    applicantName: `Teste k6 ${__VU}`,
    applicantEmail: `teste-${__VU}-${Date.now()}@example.com`,
    applicantPhone: "16999999999",
    applicantAge: 25,
    state: "SP",
    city: "Franca",
    message: "Tenho interesse em adotar com responsabilidade.",
  });

  const createResponse = http.post(`${baseUrl}/api/adoptions`, payload, {
    headers: { "Content-Type": "application/json" },
  });

  check(createResponse, {
    "solicitacao criada": (res) => res.status === 201,
  });

  sleep(1);
}
