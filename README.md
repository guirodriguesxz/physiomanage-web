# PhysioManage Web

Front-end do [PhysioManage](https://github.com/guirodriguesxz/physiomanage), um SaaS multi-tenant para clínicas de fisioterapia.

**Stack:** React 19, TypeScript, Vite, TanStack Query, React Router, Tailwind CSS 4.

## Funcionalidades

| Papel | Telas |
|---|---|
| Administrador | Painel (consultas por status, taxa de faltas/cancelamento, produtividade por profissional), agenda, pacientes, profissionais |
| Recepção | Agenda com horários livres por profissional, cadastro e prontuário de pacientes |
| Fisioterapeuta | Minha agenda, mudança de status, registro de evolução |

- Autenticação JWT com **refresh token rotativo**: um 401 dispara um único refresh compartilhado entre as requisições em andamento, porque o backend invalida o token antigo a cada rotação.
- Rotas protegidas por papel, espelhando o `@PreAuthorize` da API.
- Transições de status da consulta seguem a mesma máquina de estados do backend.
- Erros de validação da API aparecem no campo correspondente.

## Rodando localmente

```bash
# 1. API (no repositório physiomanage)
docker compose up -d

# 2. Front
cp .env.example .env
npm install
npm run dev

# 3. (opcional) dados de demonstração
./scripts/seed-demo.sh
```

As credenciais de demonstração estão no cabeçalho de `scripts/seed-demo.sh`.

## Deploy

Pronto para Vercel (`vercel.json` já faz o fallback de SPA). Configure `VITE_API_URL` apontando para a API e inclua o domínio do front em `CORS_ALLOWED_ORIGINS` no backend.
