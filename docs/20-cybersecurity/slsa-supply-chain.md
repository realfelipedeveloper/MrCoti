# SLSA e supply chain

## Controles planejados

- lockfile controlado quando houver dependências;
- dependency audit em CI;
- secret scanning;
- GitHub Actions fixadas por versão/sha quando possível;
- permissões mínimas para tokens de CI;
- separação entre PR não confiável e jobs com secrets;
- SBOM e provenance em releases futuros;
- imagens Docker assináveis/varridas quando existirem.

Produção comercial exige trilha de build reproduzível o suficiente para auditoria e
resposta a incidente.
