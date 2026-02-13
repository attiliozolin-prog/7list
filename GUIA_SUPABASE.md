# 🎯 Guia Passo a Passo: Atualizar Supabase para Rede Social

## ⚡ O que você vai fazer:
Adicionar o campo "país" no banco de dados para permitir rankings por país e filtros na página Explorar.

---

## 📋 Passo a Passo Completo

### **Passo 1: Acessar o Supabase**
1. Abra o navegador
2. Acesse: https://supabase.com/dashboard
3. Faça login se necessário

---

### **Passo 2: Selecionar o Projeto 7list**
1. Na página de projetos, procure por **"7list"**
2. Clique no card do projeto 7list
3. Aguarde o dashboard carregar

---

### **Passo 3: Abrir o SQL Editor**
1. No menu lateral esquerdo, procure por **"SQL Editor"**
2. Clique em **"SQL Editor"**
3. Você verá uma tela com um editor de código

---

### **Passo 4: Criar Nova Query**
1. Clique no botão **"New query"** (geralmente no canto superior direito)
2. Uma nova aba de query será aberta

---

### **Passo 5: Copiar e Colar o SQL**

**COPIE ESTE CÓDIGO EXATAMENTE:**

```sql
-- Adicionar coluna country à tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS country VARCHAR(2);

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country);

-- Comentário explicativo
COMMENT ON COLUMN profiles.country IS 'Código ISO 3166-1 alpha-2 do país do usuário (ex: BR, US, PT)';
```

**COLE NO EDITOR SQL**

---

### **Passo 6: Executar o SQL**
1. Com o código colado, clique no botão **"Run"** (geralmente no canto superior direito)
   - Pode ser um botão verde
   - Ou um ícone de "play" ▶️
2. Aguarde alguns segundos

---

### **Passo 7: Verificar Sucesso**
Você verá uma mensagem de sucesso, algo como:
- ✅ "Success. No rows returned"
- ✅ "Query executed successfully"
- ✅ Uma mensagem verde confirmando

**Se aparecer erro:**
- Verifique se copiou o código corretamente
- Certifique-se de que está no projeto correto (7list)
- Tente novamente

---

### **Passo 8: Confirmar a Coluna Foi Criada**
1. No menu lateral, clique em **"Table Editor"**
2. Selecione a tabela **"profiles"**
3. Role as colunas para a direita
4. Você deve ver uma nova coluna chamada **"country"**

---

## ✅ Pronto!

Agora o banco de dados está atualizado e as novas funcionalidades vão funcionar:
- ✅ Campo de país no perfil
- ✅ Filtro por país na página Explorar
- ✅ Rankings por país

---

## 🎨 Referência Visual

### Como deve ficar o SQL Editor:
```
┌─────────────────────────────────────────────┐
│  SQL Editor                    [New query]  │
├─────────────────────────────────────────────┤
│                                             │
│  ALTER TABLE profiles                       │
│  ADD COLUMN IF NOT EXISTS country...        │
│                                             │
│  [▶️ Run]                                   │
└─────────────────────────────────────────────┘
```

### Mensagem de Sucesso:
```
✅ Success. No rows returned
   Query executed in 0.2s
```

---

## 🚨 Troubleshooting

### Problema: "permission denied"
**Solução:** Certifique-se de que está logado com a conta correta que tem acesso ao projeto 7list

### Problema: "relation profiles does not exist"
**Solução:** Você está no projeto errado. Volte e selecione o projeto 7list

### Problema: "column already exists"
**Solução:** Tudo bem! Isso significa que a coluna já foi criada. Pode prosseguir normalmente.

---

## 🎯 Próximo Passo

Depois de executar o SQL, você pode:
1. Acessar https://7list.vercel.app
2. Fazer login
3. Editar seu perfil
4. Selecionar seu país
5. Explorar as novas funcionalidades!

---

## 📞 Precisa de Ajuda?

Se tiver qualquer dúvida ou problema:
1. Tire um print da tela do erro
2. Me avise e eu te ajudo!

**Boa sorte! 🚀**
