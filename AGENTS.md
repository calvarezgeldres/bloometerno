# Instrucciones para agentes de IA

Este repo es **Bloom Eterno**, una tienda online chilena de insumos para bisutería (React + Vite + Vercel Functions + Neon + Mercado Pago).

Antes de hacer cualquier cambio, lee:

1. **[CLAUDE.md](CLAUDE.md)**: contexto técnico (stack, estructura, modelo de datos, flujos y reglas obligatorias).
2. **[docs/NEGOCIO.md](docs/NEGOCIO.md)**: contexto de negocio (qué se vende, cómo compra el cliente, operación del admin y pendientes).

Las tres reglas que más daño hacen si se ignoran:

- Los archivos de `/api` no pueden importar otros archivos locales (rompe el deploy en Vercel).
- Los secretos nunca llevan prefijo `VITE_`.
- Los cambios de esquema SQL se corren a mano en Neon **antes** del push a `main`, porque cada push despliega a producción.
