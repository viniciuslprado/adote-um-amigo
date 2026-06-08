# Adote um Amigo

Plataforma acadêmica de adoção de animais com frontend React, backend Node.js/Express, MongoDB, Docker, JWT, painel administrativo, Swagger, testes de carga com k6 e observabilidade com Prometheus/Grafana.

## Estado Atual

O projeto roda localmente com Docker Compose e possui:

- Frontend público para visualizar animais e solicitar adoção.
- Backend Node.js com API REST.
- MongoDB para usuários, animais e solicitações de adoção.
- Login admin com JWT.
- Painel admin em HTML/JS servido pelo próprio backend.
- CRUD completo de animais protegido por JWT e role `admin`.
- Listagem pública combinando animais do MongoDB + Dog API + Cat API.
- Swagger em `/api-docs`.
- Testes de carga com k6.

## Arquitetura

```text
.
|-- backend/                  # API Node.js/Express
|   |-- src/
|   |   |-- config/           # Conexão MongoDB
|   |   |-- controllers/      # Regras das rotas
|   |   |-- middleware/       # JWT, autorização e erros
|   |   |-- models/           # Schemas Mongoose
|   |   |-- public/           # Painel admin servido pelo backend
|   |   |-- routes/           # Rotas REST
|   |   |-- services/         # Bootstrap admin e serviços
|   |   |-- utils/            # Swagger, métricas e helpers
|   |   `-- app.js            # Entrada do backend
|   |-- Dockerfile
|   `-- backend.md
|
|-- frontend/                 # Aplicação React pública
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |-- pages/
|   |   |-- services/
|   |   |-- styles/
|   |   `-- utils/
|   |-- Dockerfile
|   |-- nginx.conf
|   `-- frontend.md
|
|-- db/                       # Arquivos auxiliares de banco
|   |-- migrations/           # Scripts de migração (futuro)
|   |-- init.sql              # Estrutura inicial do banco
|   `-- db.md
|-- prints/                   # Prints e diagramas do projeto
|-- load-tests/k6/            # Testes de carga
|   `-- k6.md
|-- observability/            # Prometheus e Grafana
|   `-- observability.md
|-- docker-compose.yml
|-- .env.example
|-- package.json
`-- README.md
```

## Documentação por Pasta

- [Backend](backend/backend.md)
- [Frontend](frontend/frontend.md)
- [Banco de dados](db/db.md)
- [Observabilidade](observability/observability.md)
- [Testes de carga k6](load-tests/k6/k6.md)

## Tecnologias

- Node.js
- Express
- MongoDB
- Mongoose
- React
- Docker e Docker Compose
- JWT
- bcrypt
- Swagger/OpenAPI
- k6
- Prometheus
- Grafana

## Como Rodar

Crie o arquivo `.env` com base no `.env.example` e suba a stack:

```bash
docker compose up -d --build
```

Ou use o atalho (os logs serão exibidos no terminal):

```bash
npm start
```

Caso queira popular o banco de dados com animais iniciais (seed) após subir a stack:

```bash
npm run backend:seed
```

Verificar containers:

```bash
docker compose ps
```

Parar a stack:

```bash
docker compose down
```

## Links e Localhosts

| Recurso | URL / Conexão | Para que serve |
|---|---|---|
| Frontend público | `http://localhost:3000` | Site público para visualizar animais e solicitar adoção |
| Painel admin | `http://localhost:4000/admin` | Login admin e CRUD de animais |
| Swagger | `http://localhost:4000/api-docs` | Documentação da API |
| Health check | `http://localhost:4000/health` | Verifica se o backend está online |
| Métricas | `http://localhost:4000/metrics` | Métricas Prometheus expostas pelo backend |
| Prometheus | `http://localhost:9090` | Coleta métricas do backend |
| Grafana | `http://localhost:3001` | Dashboard visual das métricas |
| MongoDB porta padrão | `mongodb://localhost:27017` | MongoDB exposto pelo Docker |
| MongoDB Compass recomendado | `mongodb://127.0.0.1:27018/adote-um-amigo?directConnection=true` | Conexão mais estável para visualizar o banco no Compass |

Banco no Compass:

```text
adote-um-amigo
```

Coleções:

```text
users
animals
adoptionrequests
```

Grafana local:

```text
Usuário: admin
Senha:   admin
```

## Prints do Projeto

Esta seção apresenta os principais fluxos e ferramentas do projeto em funcionamento.

### Organização e requisitos

![Diagrama de requisitos de software](prints/Requisitosdesoftware2.jpg)

O diagrama resume os requisitos e etapas principais do projeto: criação da aplicação React, desenvolvimento da interface, consumo das APIs externas de cães e gatos, formulário de cadastro de interesse e publicação da aplicação.

![Organização do frontend](prints/organiza%C3%A7%C3%A3o.png)

O diagrama mostra a organização do frontend em `App.js`, componentes reutilizáveis, páginas e serviços. Ele ajuda a visualizar como as telas de início, lista de animais, detalhes, dicas, cadastro e rodapé se conectam aos arquivos da aplicação.

### Frontend público

![Tela inicial do site](prints/print-tela-inicial.png)

A tela inicial apresenta a proposta da plataforma, com navegação superior, chamada principal para encontrar um novo companheiro e botões de acesso rápido para a listagem de animais e cadastro de interesse.

![Seção informativa da tela inicial](prints/print2-tela-inicial.png)

Esta parte da página inicial destaca os recursos oferecidos ao usuário, como perfis completos dos animais, busca facilitada e cadastro de interesse. A seção reforça o objetivo de tornar a adoção mais simples e acolhedora.

![Orientações na tela inicial](prints/print3-tela-inicial.png)

A seção final da página inicial apresenta orientações resumidas sobre adoção responsável, incluindo planejamento, saúde, bem-estar e adaptação do animal ao novo lar.

![Lista pública de animais](prints/print17.png)

A listagem pública exibe os animais disponíveis para adoção. Nela o usuário pode buscar por texto, filtrar por espécie e cidade, ordenar os resultados e acessar os cards individuais dos animais.

![Detalhes de um animal](prints/print-card-animal.png)

A página de detalhes mostra a ficha completa do animal selecionado, incluindo imagem, espécie, idade, cidade, origem e descrição. A partir dela o usuário pode voltar para a lista ou iniciar o cadastro de interesse.

![Cadastro de interesse](prints/print-cadastro-interesse.png)

O formulário de cadastro permite que uma pessoa demonstre interesse em adotar um animal. Quando o fluxo vem da página de detalhes, o animal escolhido já aparece selecionado no formulário.

![Página de orientações](prints/print-orienta%C3%A7%C3%B5es.png)

A página de orientações reúne cuidados importantes antes e depois da adoção, como alimentação, higiene, acompanhamento veterinário, adaptação em casa e responsabilidade de longo prazo.

### Painel administrativo

![Login do painel administrativo](prints/print-inicio-adm.png)

O painel administrativo inicia com a tela de login. O acesso usa as credenciais do administrador e, após a autenticação, o backend retorna um JWT usado nas rotas protegidas.

![Painel administrativo de animais](prints/print-painel-adm.png)

Depois do login, o administrador consegue cadastrar novos animais, enviar imagem, atualizar a lista, editar registros existentes e remover animais cadastrados no MongoDB.

### Documentação da API

![Swagger com rotas principais](prints/print-1-swagger.png)

O Swagger documenta a API do backend, exibindo informações gerais, servidor local e grupos de rotas como health check, autenticação e animais.

![Swagger com rotas de animais e adoção](prints/print-2-swagger.png)

Nesta parte da documentação aparecem as operações de animais e solicitações de adoção, incluindo rotas públicas, rotas administrativas e endpoints protegidos.

### Banco de dados

![MongoDB Compass com coleção de animais](prints/print-mongoDB-compass.png)

O MongoDB Compass permite visualizar os dados persistidos pela aplicação. O print mostra o banco `adote-um-amigo`, suas coleções e documentos da coleção `animals`.

### Observabilidade

![Consulta no Prometheus](prints/print-Prometheus.png)

O Prometheus coleta as métricas expostas pelo backend em `/metrics`. O print mostra uma consulta da métrica `adote_um_amigo_http_requests_total`, usada para acompanhar requisições por rota, método e status HTTP.

![Dashboard no Grafana](prints/print-grafano.png)

O Grafana consome os dados do Prometheus e apresenta um dashboard visual com estado da conexão MongoDB, requisições HTTP por segundo e latência HTTP p95.

## Admin JWT

O backend cria/atualiza automaticamente o usuário admin ao iniciar:

```text
Usuário: admin
Senha:   admin123
Email:   admin@adote.local
Role:    admin
```

Login:

```http
POST /auth/login
POST /api/auth/login
```

Body:

```json
{
  "username": "admin",
  "password": "admin123"
}
```

Resposta: token JWT. O painel admin salva esse token no `localStorage` e envia nas ações protegidas:

```http
Authorization: Bearer <token>
```

## Painel Admin

Acesse:

```text
http://localhost:4000/admin
```

Funcionalidades:

- Login com admin.
- Listagem de animais cadastrados no MongoDB.
- Cadastro de animal com imagem por clique ou arrastar/soltar.
- Edição de animal.
- Remoção com modal de confirmação.
- Mensagens de sucesso e erro.
- Estados de loading em botões.
- Tratamento de token inválido ou expirado.

As rotas do painel usam JWT e role `admin`.



## API de Animais

A listagem pública combina dados do MongoDB com dados externos:

```http
GET /api/animals
GET /animals
```

Exemplo de resposta:

```json
{
  "items": [],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 29,
    "pages": 1
  },
  "sources": {
    "mongodb": 18,
    "external": 24,
    "returned": 29
  }
}
```

Como funciona:

- Busca animais ativos no MongoDB.
- Busca raças/animais na Dog API e Cat API.
- Normaliza os dados para um formato único.
- Remove duplicados usando `externalSource + externalId`.
- Retorna um JSON consistente para o frontend.

Listar somente MongoDB no painel admin:

```http
GET /api/animals/admin/list
```

Essa rota exige JWT admin.

## Rotas Principais

Autenticação:

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

Adoção:

```text
POST  /api/adoptions
GET   /api/adoptions              # autenticado
GET   /api/adoptions/:id          # autenticado
PATCH /api/adoptions/:id/status   # admin
```

## Observabilidade

O backend expõe métricas Prometheus:

```text
http://localhost:4000/metrics
```

Prometheus coleta as métricas do backend e Grafana já vem com datasource e dashboard provisionados:

```text
Prometheus: http://localhost:9090
Grafana:    http://localhost:3001
```

Métricas incluídas:

- métricas padrão do Node.js;
- duração de requisições HTTP;
- total de requisições HTTP;
- estado da conexão MongoDB.

## Testes de Carga

Scripts k6:

```bash
npm run load:animals
npm run load:adoption
```

Arquivos:

```text
load-tests/k6/animals-list.js
load-tests/k6/adoption-flow.js
```

## Observações Sobre Microserviços

O projeto usa containers separados para frontend, backend, MongoDB, Prometheus e Grafana. A aplicação de domínio, porém, ainda está em um único backend Express. Portanto, ele está modularizado, mas não é uma arquitetura de microserviços completa.

Para evoluir para microserviços reais, uma sugestão seria separar:

- `auth-service`
- `animals-service`
- `adoptions-service`

cada um com container, porta, banco/coleções ou contratos próprios.

## Últimas Melhorias Incluídas

- Login admin `admin/admin123`.
- Senha com hash bcrypt.
- JWT com `role=admin`.
- Painel admin em `http://localhost:4000/admin`.
- CRUD completo de animais no painel.
- Upload simples de imagem com clique ou arrastar/soltar.
- Compressão de imagem no navegador antes do envio.
- Mensagens de sucesso, erro e loading.
- Modal de confirmação para remover animal.
- Listagem pública compactada e responsiva.
- `GET /api/animals` combinando MongoDB + APIs externas.
- Porta MongoDB alternativa `27018` para uso no Compass.
- Prometheus e Grafana adicionados ao Docker Compose.
