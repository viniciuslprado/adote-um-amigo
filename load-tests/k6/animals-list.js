import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 10 },
    { duration: "1m", target: 25 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<800"],
  },
};

const baseUrl = __ENV.BASE_URL || "http://backend:4000";

export default function animalsList() {
  const response = http.get(`${baseUrl}/api/animals?page=1&limit=20&sort=name:asc`);
  let body = null;

  if (response.status === 200) {
    body = response.json();
  }

  check(response, {
    "status 200": (res) => res.status === 200,
    "retorna lista": () => Array.isArray(body?.items),
  });

  sleep(1);
}
