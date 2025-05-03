/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["your-image-domain.com"], // Adicione os domínios permitidos para imagens
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL, // Variável de ambiente para a URL do banco de dados
  },
};

module.exports = nextConfig;
