# 🎵 Como Configurar a Spotify API

## Por que você precisa disso?

A Spotify API oferece **resultados de busca muito mais relevantes** que o MusicBrainz, focando em versões oficiais e populares das músicas, sem versões estranhas, remixes indesejados, etc.

> **Nota:** A API é **100% gratuita** usando Client Credentials Flow (para busca pública de músicas).

---

## 🚀 Passo a Passo

### 1. Acesse o Spotify Developer Dashboard
Vá para: [https://developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)

### 2. Faça Login
- Use sua conta Spotify (pode ser gratuita)
- Se não tiver conta, crie uma gratuitamente

### 3. Crie uma Nova Aplicação
- Clique em **"Create app"** (Criar aplicativo)
- Preencha os dados:
  - **App name:** `7list` (ou qualquer nome)
  - **App description:** `Aplicação para busca de músicas`
  - **Redirect URIs:** `http://localhost:3000` (não será usado, mas é obrigatório)
  - **Which API/SDKs are you planning to use?** Marque **Web API**
- Aceite os termos de serviço
- Clique em **"Save"** (Salvar)

### 4. Obtenha as Credenciais
- Na página da sua aplicação, clique em **"Settings"** (Configurações)
- Você verá:
  - **Client ID** - Copie este valor
  - **Client Secret** - Clique em "View client secret" e copie

### 5. Configure no Projeto
Adicione as credenciais no arquivo `.env` (ou `.env.local`):

```bash
VITE_SPOTIFY_CLIENT_ID=seu_client_id_aqui
VITE_SPOTIFY_CLIENT_SECRET=seu_client_secret_aqui
```

**⚠️ IMPORTANTE:** Nunca compartilhe ou commite o Client Secret no Git!

---

## ✅ Pronto!

Reinicie o servidor de desenvolvimento e a busca de músicas estará funcionando com o Spotify!

```bash
npm run dev
```

---

## 🔍 Testando

Após configurar, teste buscando por músicas populares como:
- "Bohemian Rhapsody"
- "Evidências"
- "Garota de Ipanema"

Você verá resultados muito mais relevantes e organizados! 🎉

---

## 🔐 Segurança

- O Client Secret deve ser mantido em segredo
- Já está no `.gitignore` (não será commitado)
- Na Vercel, adicione as variáveis de ambiente nas configurações do projeto
