# Deskly (VulnApp) — Aplicação Vulnerável para TCC

Um pequeno "helpdesk interno" (Node.js/Express + EJS) **propositalmente vulnerável**, com interface
funcional (sidebar, dashboard, formulários), criado para servir de alvo em testes de **SAST**,
**DAST** e **SCA** em um Trabalho de Conclusão de Curso. A interface é só uma casca para dar
contexto realista às rotas.

> ⚠️ **NÃO** exponha esta aplicação na internet pública. Rode apenas em ambiente isolado
> (container local, rede sem acesso externo, máquina virtual de estudo).

## Como rodar localmente (sem Docker)

```bash
npm install
node app.js
# app disponível em http://localhost:3000
```

## Rodando com segurança

- Rode em `localhost` apenas; não faça bind em `0.0.0.0` numa rede compartilhada.
- Se for usar Docker, publique a porta só para sua máquina: `docker run -p 127.0.0.1:3000:3000 vulnapp:1.0`.
- Não monte volumes do seu disco real (`-v`) — mantenha o filesystem do container isolado.
- Não exponha esta aplicação na internet pública em nenhuma hipótese.

## Como rodar com Docker

```bash
docker build -t vulnapp:1.0 .
docker run -p 3000:3000 vulnapp:1.0
```

## Credenciais de teste (seed em memória)

| usuário | senha | role |
|---|---|---|
| admin | admin123 | admin |
| alice | senha123 | user |
| bob | qwerty | user |

## Aviso legal

Este projeto foi criado exclusivamente para fins educacionais em ambiente controlado, como parte
de um Trabalho de Conclusão de Curso sobre DevSecOps. Não utilize este código como
base para aplicações reais, nem o exponha em ambientes de produção ou acessíveis publicamente.
