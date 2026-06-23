# **Documentação Técnica: Game Wishlist Tracker v3.0**
**Data Atualização:** 23 de Junho de 2026
**Status:** Em Desenvolvimento (Sprint 3)

## **1. Visão Geral do Produto**
O **Game Wishlist Tracker** é uma aplicação web full-stack desenvolvida para monitorar preços de jogos desejados pelo usuário. O sistema permite o cadastro de jogos, definição de preços-alvo e visualização em uma interface moderna. 

**Novos Requisitos (Roadmap):** A aplicação evoluirá para buscar preços de forma automatizada via APIs externas ou Web Scraping, além de categorizar os jogos por tipo de loja (Física ou Online).

## **2. Stack Tecnológica**
*   **Front-end / Back-end:** Next.js (App Router) + React
*   **Linguagem:** TypeScript
*   **Estilização:** Tailwind CSS
*   **Banco de Dados:** Supabase (PostgreSQL)
*   **Hospedagem / CI/CD:** Vercel
*   **Automação (Futuro):** CheapShark API ou Web Scraper customizado.

## **3. Estrutura de Banco de Dados Atualizada (Schema v2)**
A tabela `wishlist` passará por uma migração para acomodar a preferência de mídia/loja do usuário.
*   `id` (UUID, Primary Key)
*   `game_title` (VARCHAR)
*   `target_price` (DECIMAL)
*   `current_price` (DECIMAL, Nullable)
*   `store_type` (VARCHAR) - *Novo campo planejado: 'Física', 'Online' ou 'Ambas'.*
*   `created_at` (TIMESTAMPTZ)

## **4. Mapa de Sprints (Roadmap Ágil)**

| Sprint | Escopo | Status |
| :--- | :--- | :--- |
| **Sprint 1** | Fundamentos: Next.js, Vercel, Supabase, Variáveis de Ambiente | Concluída ✅ |
| **Sprint 2** | UI/UX: Grid com Tailwind, Componentização, Modal de Inserção | Concluída ✅ |
| **Sprint 3** | CRUD Final: Funções de Update (Editar) e Delete (Excluir) | A Iniciar ⏳ |
| **Sprint 4** | Feature: Adição do campo 'Loja' e Integração com API de Preços | Backlog 💡 |

## **5. Convenções de Código**
*   Uso estrito de `'use client'` apenas em componentes interativos (ex: Modais).
*   Requisições de leitura diretas no Server Component para melhor performance e SEO.
*   Commits padronizados (feat, fix, docs).