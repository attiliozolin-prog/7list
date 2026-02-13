-- Script SQL para adicionar o campo 'country' à tabela profiles
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar coluna country à tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS country VARCHAR(2);

-- 2. Criar índice para melhorar performance nas buscas por país
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country);

-- 3. Comentário explicativo
COMMENT ON COLUMN profiles.country IS 'Código ISO 3166-1 alpha-2 do país do usuário (ex: BR, US, PT)';
