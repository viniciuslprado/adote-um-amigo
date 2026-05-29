# Backend

Backend Node.js/Express da plataforma Adote um Amigo. Ele concentra a API REST, autenticacao, regras de negocio, integracao com MongoDB, painel administrativo estatico, Swagger e metricas Prometheus.

## Responsabilidades

- Inicializar o servidor HTTP na porta `4000`.
- Conectar ao MongoDB usando Mongoose.
- Criar ou atualizar automaticamente o usuario administrador inicial.
- Autenticar usuarios com JWT.
- Proteger rotas administrativas por token e `role=admin`.
- Gerenciar animais cadastrados no MongoDB.
- Consultar animais externos na Dog API e Cat API.
- Criar e consultar solicitacoes de adocao.
- Servir o painel administrativo em `/admin`.
- Expor documentacao Swagger em `/api-docs`.
- Expor metricas Prometheus em `/metrics`.

## Estrutura

```text
backend/
|-- Dockerfile
|-- package.json
|-- backend.md
`-- src/
    |-- app.js                    # Entrada da API
    |-- seedAnimals.js            # Popula animais locais para testes
    |-- config/
    |   `-- database.js           # Conexao MongoDB
    |-- controllers/              # Logica das rotas
    |-- middleware/               # Auth, autorizacao e erros
    |-- models/                   # Schemas Mongoose
    |-- public/                   # Painel admin HTML/JS
    |-- routes/                   # Definicao das rotas REST
    |-- services/                 # Bootstrap admin e servicos auxiliares
    `-- utils/                    # Swagger, metricas e async handler
```

## Como executar

Pela raiz do projeto, suba a stack completa:

```bash
docker compose up -d --build
```

Subir apenas o backend e suas dependencias:

```bash
docker compose up -d --build backend
```

Ver logs:

```bash
docker compose logs -f backend
```

Executar localmente dentro da pasta `backend`:

```bash
npm install
npm run dev
```

## Scripts

```text
npm run dev      # inicia com nodemon
npm start        # inicia com node src/app.js
npm run seed     # popula animais locais no MongoDB
```

## Variaveis de ambiente

As variaveis podem ser definidas no `.env` da raiz ou pelo `docker-compose.yml`.

```text
PORT=4000
MONGODB_URI=mongodb://mongodb:27017/adote-um-amigo
JWT_SECRET=change-me
JWT_EXPIRES_IN=1d
RATE_LIMIT_MAX=5000
ADMIN_NAME=Administrador
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@adote.local
ADMIN_PASSWORD=admin123
FRONTEND_URL=http://localhost:3000
DOG_API_KEY=
CAT_API_KEY=
```

Em producao, troque `JWT_SECRET` e a senha padrao do administrador.

## Endpoints principais

Sistema:

```text
GET /health
GET /metrics
GET /api-docs
GET /admin
```

Autenticacao:

```text
POST /auth/login
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
GET  /api/auth/users              # admin
PATCH /api/auth/users/:id/role    # admin
```

Animais:

```text
GET    /api/animals
GET    /animals
GET    /api/animals/admin/list    # admin
GET    /api/animals/external
GET    /api/animals/:id
POST   /api/animals               # admin
PUT    /api/animals/:id           # admin
PATCH  /api/animals/:id           # admin
DELETE /api/animals/:id           # admin
POST   /api/animals/import/dogs   # admin
POST   /api/animals/import/cats   # admin
```

Adocoes:

```text
POST  /api/adoptions
GET   /api/adoptions              # autenticado
GET   /api/adoptions/:id          # autenticado
PATCH /api/adoptions/:id/status   # admin
```

## Autenticacao e autorizacao

O login retorna um JWT. Rotas protegidas esperam o token no header:

```http
Authorization: Bearer <token>
```

O payload do token inclui dados como `id`, `email`, `username` e `role`. As rotas administrativas usam os middlewares de autenticacao e autorizacao por papel.

Exemplo de login:

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "username": "admin",
  "password": "admin123"
}
```

## Modelos MongoDB

`User`:

- `name`
- `email`
- `username`
- `passwordHash`
- `phone`
- `role`
- `active`

`Animal`:

- `name`
- `type`
- `age`
- `location`
- `city`
- `state`
- `image`
- `description`
- `origin`
- `status`
- `active`
- `deletedAt`
- `externalSource`
- `externalId`

`AdoptionRequest`:

- `userId`
- `animalId`
- `animalSnapshot`
- `applicantName`
- `applicantEmail`
- `applicantPhone`
- `applicantAge`
- `state`
- `city`
- `message`
- `status`
- `adminNotes`

## Regras importantes

- O delete de animal e um soft delete.
- Animais removidos recebem `active=false`, `deletedAt=<data>` e `status=unavailable`.
- `GET /api/animals` retorna animais locais e externos no mesmo formato.
- `GET /api/animals/admin/list` retorna apenas dados persistidos no MongoDB.
- Solicitacoes de adocao salvam um snapshot do animal para preservar o historico.

## Integracoes externas

O backend usa Axios para consultar dados de caes e gatos nas APIs externas. Os dados recebidos sao normalizados com campos compativeis com o modelo local e recebem identificadores de origem:

```text
externalSource
externalId
dataSource
```

Isso permite misturar dados locais e externos na vitrine publica sem duplicar registros.

## Painel administrativo

O painel fica em:

```text
http://localhost:4000/admin
```

Arquivos:

```text
src/public/admin.html
src/public/admin.js
```

Funcionalidades:

- Login admin.
- Cadastro de animal.
- Edicao de animal.
- Remocao de animal.
- Upload simples de imagem.
- Listagem dos animais do MongoDB.
- Tratamento de token invalido ou expirado.

## Swagger

A documentacao interativa da API fica em:

```text
http://localhost:4000/api-docs
```

Ela e configurada em:

```text
src/utils/swagger.js
```

## Observabilidade

O arquivo `src/utils/metrics.js` registra metricas com `prom-client`.

Endpoint:

```text
GET /metrics
```

Metricas principais:

```text
adote_um_amigo_http_requests_total
adote_um_amigo_http_request_duration_seconds
adote_um_amigo_mongodb_connection_state
```

Tambem sao expostas metricas padrao do Node.js com prefixo `adote_um_amigo_`.

## Seguranca

Recursos usados:

- `helmet` para headers de seguranca.
- `cors` restrito ao frontend configurado.
- `express-rate-limit` para limitar excesso de requisicoes.
- `bcryptjs` para hash de senha.
- `jsonwebtoken` para autenticacao.
- `zod` para validacao de dados.
- Middleware centralizado de erros.

## Verificacao rapida

```bash
curl http://localhost:4000/health
curl http://localhost:4000/metrics
```

Resposta esperada do health check:

```json
{
  "service": "backend",
  "status": "ok"
}
```
