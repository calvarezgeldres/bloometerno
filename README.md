# Bloom Eterno

Tienda online de insumos para bisutería artesanal en Chile: piedras naturales, mostacillas, cristales y herramientas. Incluye panel de administración en `/admin`.

**Stack:** React 18 + Vite + TypeScript · Vercel Serverless Functions · Neon (Postgres) · Vercel Blob · Mercado Pago.

## Documentación

- [docs/NEGOCIO.md](docs/NEGOCIO.md): de qué se trata el negocio, flujo de compra y operación.
- [CLAUDE.md](CLAUDE.md): arquitectura, modelo de datos, flujos y reglas técnicas.
- [AGENTS.md](AGENTS.md): punto de entrada para asistentes de IA (Claude Code, Cursor, Codex, Copilot…).

## Correr en local

```bash
npm install
cp .env.example .env   # completa las variables (ver comentarios del archivo)
npm run dev            # solo frontend; para las funciones /api usa `vercel dev`
```

Diseño original en Figma: https://www.figma.com/design/80Ruv2mYLeOUTmck0B7CEk/Dise%C3%B1o-tienda-online-Bloom-Eterno
