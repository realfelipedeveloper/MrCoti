# Manifesto de evidências para aprovação

**Produto:** Mr Coti  
**Feature:** `001-saas-platform-foundation` + `002-mvp-local-first-slice`  
**Gerado em:** 2026-07-11  
**Algoritmo:** SHA-256  
**Escopo:** artefatos documentais, contratos, UML, ADRs, AGENTS, decisões e perfis Codex usados na fundação SaaS e na primeira spec local.

Este manifesto apoia a rastreabilidade das aprovações. Ele permite que os papéis
de governança aprovem uma versão identificável do pacote documental. A presença de
hash NÃO significa aprovação; as decisões válidas estão no approval record, nos
documentos raiz de decisão e nos checklists de cada spec.

O próprio manifesto é excluído da lista para evitar auto-referência. Se qualquer
arquivo listado mudar, a pessoa aprovadora deve solicitar novo manifesto ou registrar
explicitamente a diferença revisada.

## Como verificar

No PowerShell, a partir da raiz do repositório:

```powershell
Get-FileHash -Algorithm SHA256 -LiteralPath "caminho/do/arquivo"
```

Compare o valor produzido com a coluna `SHA-256`.

## Resumo de escopo

| Grupo | Evidência |
| --- | --- |
| Constituição e templates | `.specify/` |
| Specs | `specs/001-saas-platform-foundation/` e `specs/002-mvp-local-first-slice/` |
| Documentação de produto, arquitetura, segurança, dados, operação e cybersecurity | `docs/` |
| ADRs | `docs/11-adr/ADR-0001`–`ADR-0019` |
| Complemento SaaS | `docs/12-billing`–`docs/20-cybersecurity` |
| Governança por papéis | `docs/18-governance/governance-roles.md`, `approval-record.md` e `filtered-decisions-2026-06-26.md` |
| Guias raiz | `DECISOES_PARA_VALIDACAO.md`, `DECISOES_SPEC_002_PARA_VALIDACAO.md`, `AGENTES_E_SUBAGENTES_LOOP_ENGINEERING.md`, `AGENTS.md` e `README.md` |
| Coordenação de agentes | `.codex/config.toml`, `.codex/agents/*.toml` |

## Arquivos e hashes

| SHA-256 | Caminho |
| --- | --- |
| `540ceb729130ce6b9d96275ee96bcf88d776c8b2b35953469f6e42943b2a36c8` | `.codex/agents/architect.toml` |
| `84ef1b4ce329494ec4b339bc82ab8d7003402da9a7c62bdfc29d8807d64c01ca` | `.codex/agents/backend_nestjs.toml` |
| `830275df06bfc4dc6f4638bb1bdd1f68ef5eed2a318e16e7c2b06164097e2e09` | `.codex/agents/business_analyst.toml` |
| `6211709e5f0d867c0ea389b5bbea3ee74777c7f056e34766f2c12f12fde1d0fe` | `.codex/agents/code_review.toml` |
| `8573c8b6f440f5c425c95cc10d3944ba2cd99ddfdc5b607ff6527b10e492f919` | `.codex/agents/database.toml` |
| `3914fddcc0da17c4fc042e0d2ecfb8b69a65e0d350e49e858048e16dc9240cb5` | `.codex/agents/devops.toml` |
| `ba958988a5d300e84992d0d8fb4d903747a879b017c28dfedbfc9846b69ba495` | `.codex/agents/frontend_nextjs.toml` |
| `39d31c91f1b69f15b6c1b5f9b2bd5bbe783f910530b8b9fdf0faf3a6aa007b2e` | `.codex/agents/integration.toml` |
| `e0b410e5f93bb73d48996143d3aab4cdb8206437d11bd31759cb965f533d59f6` | `.codex/agents/qa.toml` |
| `eac3abb86ebe384204a302c21cc91601af016caa81a41fa5283c43895ab63107` | `.codex/agents/security.toml` |
| `cc45bd8f9810f0fdfbf989941019a6b4a2b4c57128888c965612fbfc0e200248` | `.codex/config.toml` |
| `beab2b06955c1d00e84d8df7b98879ffa0af377aac7ccb678aea20ca962af2f6` | `.specify/memory/constitution.md` |
| `c1d02452e12708562cc4977236226c428e20774badd66f007bd5e2d35e28e4b3` | `.specify/templates/checklist-template.md` |
| `7f538b7955c1bfc2ecc1d031272b5631b7e21a893b4f350aa920ba6b801d8e04` | `.specify/templates/constitution-template.md` |
| `4d68cb4882c9b40338c5f09f99909ca725e4697a6cf8eaad40d5ba15831c3902` | `.specify/templates/plan-template.md` |
| `8ea342f7d36b9ce30a115be61a9205e0cc806d93d444b773bdfd23908a4bc128` | `.specify/templates/spec-template.md` |
| `8eec4d2cd96a2365374801d446fdb50b00e37b81fcb9c44170a530101df6ea11` | `.specify/templates/tasks-template.md` |
| `782765df4c97b97fb754b3f88ec8f99bd7f33387d0b91a5f24239fe9dc56bf06` | `AGENTES_E_SUBAGENTES_LOOP_ENGINEERING.md` |
| `2c7b46a0182a4b5164c799a5ed4789767831b8005eedbd013f29dc8e859c2afb` | `AGENTS.md` |
| `7e0f5d0059a72bd7a6b731f71ce7d012a66e3827069eba216e2f64358d444861` | `DECISOES_PARA_VALIDACAO.md` |
| `0c278cc1e7d64539742ff6af54a05cc5d80fa28f2ac5e0e8b89c90d165458856` | `DECISOES_SPEC_002_PARA_VALIDACAO.md` |
| `757da4a1486cd4d8de3ffb15fceff4e30179a5c4ed00fec269bd572dc1862cc7` | `docs/00-product/module-entitlement-matrix.md` |
| `e5e59207cbb78ccc4b1f1e26a4976e790cb2e465042c1832cf9d93012f9f381d` | `docs/00-product/non-functional-requirements.md` |
| `9aeddc7c57a3dce584ffe63b6da5a940ff7299efa2bf977e5ccc60516ad9b735` | `docs/00-product/README.md` |
| `d039afce9cc01cd041d62957c348d76b6f57ec795cf64f4c4c10f44b33e2ce1f` | `docs/00-product/roadmap.md` |
| `4594d2be9e1a589cefbc3a0c8a5902a75633e83a7fff8f29ef0b06078af3d5f8` | `docs/00-product/saas-commercial-model.md` |
| `ca8da7b8f8963e8c85daa309b7c014d09269e791522a9ffcd471bee610cc1187` | `docs/00-product/vision-and-scope.md` |
| `51a3c52baa926831285b51b8a5f482ad4cb2bfcfd5ad5bbfb847f5983dc22fc5` | `docs/01-business/actors-and-permissions.md` |
| `6fbb3594eef733e6b54877b5ca6d0c181b4c639678214e4b29910b35396f85dd` | `docs/01-business/business-rules.md` |
| `c8b2e74a3283f6c40a3fafec443fe88480ce1f8d7bdbe2ae8940b9574fb0c329` | `docs/01-business/domain-overview.md` |
| `edd0e5db910f4caa4bb0df4a7c0b9690f97211296411562940f324c2cf6676cb` | `docs/01-business/glossary.md` |
| `0de9876f128e6428f809bb70f11e6cc0eb91c2df016f8d38047a3c6def3707e5` | `docs/01-business/order-and-billing-rules.md` |
| `3e45d66810642801ddb32a8c8931ede619e4c6cd7f463db3341914fba90ab936` | `docs/01-business/README.md` |
| `4dc211d4997f8920f63c5c7400d6df6ae04470d9044cf7ba7a352181276c1fd4` | `docs/01-business/traceability.md` |
| `877bc20b96e702ad748ae2eb6f01226113594324b2148c91b6c42cf93baf6d16` | `docs/02-architecture/aws-cloud-ready.md` |
| `71aaf07e9c474963f5b19d4bae68a2a26fe3b27a9877638dcbc47f57d28dfc55` | `docs/02-architecture/context-map.md` |
| `99af27e28c3f8651178bc975ebf77b17ba0cd9618e73232856446edc2ed13cfb` | `docs/02-architecture/event-driven-outbox.md` |
| `69d65a435275d3120ef151e86c98f3912c4e5719822166d49fa77bb34288041e` | `docs/02-architecture/feature-flags.md` |
| `089197250050c3d617b09342fa1a38d147a19cca78b49527c7f7eacbb0e4bfab` | `docs/02-architecture/future-capability-map.md` |
| `e23f3429f1567c2ecb85c74b7b0c4cfdd57963be8dbceb13cc3fba22c06b87ac` | `docs/02-architecture/integrations-hexagonal.md` |
| `dc61171b5e59cf97246660cc2dfe098c4b76ab13466428f982344b111bba740b` | `docs/02-architecture/modular-monolith.md` |
| `162a52b0aaec243ed410f7d4738edd8fb31e007d20b0b3cda197c84741e1aa54` | `docs/02-architecture/README.md` |
| `df3c616e4620ee73aa4d8c1d99ea825978612f9f20643747cb9fd801417c9ae7` | `docs/02-architecture/saas-multi-tenancy.md` |
| `43cf952d4fa9ef735eecd6183514d25a5d9b511292789939ef32951a1127ab07` | `docs/02-architecture/scalability.md` |
| `c87b1eb1339e2fb0d2efc23cc972d871a1ca03fe5b747ab7a400e687452b2aa7` | `docs/03-uml/bounded-contexts.puml` |
| `7c88233e6598e58aee7648623fb7d0834ddb5a9c0f2098aa85d846c8c4e1fca6` | `docs/03-uml/container.puml` |
| `080ae41692eb09c65a9167f2696f116273e50e0afd2866507a60af820a5d39e8` | `docs/03-uml/deployment-aws.puml` |
| `daddb7a450b99db88f1f5e80a8aedec4d837bdf590dd298186be4d6e2f30de51` | `docs/03-uml/integration-sequence.puml` |
| `19d4866fe62e858753d32503affacc3c653f0a7bac2fc9d31e369a4ebadbb2fa` | `docs/03-uml/order-lifecycle.puml` |
| `a84a8fbbf2beb0cc4d4af7e859d00e6970095105b6598bb77101d7d355701763` | `docs/03-uml/README.md` |
| `d66d9405267da62519d832e5b55e3d9ccfc89e2e8e80f960d43ad927cda1008f` | `docs/03-uml/system-context.puml` |
| `6cefc8ea87103d36fb7cc6775b5f5652b5f431a79aee5a64c55cb1d5cbce43f9` | `docs/03-uml/tenant-domain.puml` |
| `66bb0fd925c19eae24accf878669f35f2fa77a8ca0588c50e707ede7398890ca` | `docs/04-api/api-standards.md` |
| `c6ce94507c1d0cc5abda1619615f83b2127b661cb3ed923c238773d1b498b06b` | `docs/04-api/public-api-scope.md` |
| `be123cf061ad2b4b959ea3b05c588195b2935323ce9421ab27167e2a4ddd852d` | `docs/04-api/README.md` |
| `ea49e8d06d705b36ffe330e948f8b0f8b1ec942f2bb7cbb7ba95556d7fca566d` | `docs/04-api/webhooks.md` |
| `f3c4ddde07be00860d77beb8e087ff6b03e54005a9e8f6c49561d8c6bece5979` | `docs/05-database/continuity-and-retention.md` |
| `f07f8e7167e4538ebda9563158af03bf0f3505d803d2d46f9cdf3619dfbaecfa` | `docs/05-database/data-strategy.md` |
| `e45460ed0e557f458d4a46ffe39c6d4dd4ec16156df90fead149d7c275bcf7ed` | `docs/05-database/entity-tenancy-matrix.md` |
| `925036d6f526b76fe66599f9f5383424ae08b29872d7f1648becbeab1f346919` | `docs/05-database/README.md` |
| `bc502097cc13da3797a94761ce8c2fac340ef188ab073dc31d6e77c4805f2a09` | `docs/05-database/tenant-isolation.md` |
| `f7093c100ac72a0b0e0787a17cfc25bac85fb35d45277b0717845ae2fef726dc` | `docs/06-testing/README.md` |
| `2f635ce705039472399220296e89505d349d7a72ec90109681e182752e02c02e` | `docs/06-testing/test-strategy.md` |
| `8433674cf8063bc1bb7f86ccd288fab8b5c475b3c1082eeac17beccf714eabda` | `docs/07-devops/ci-cd.md` |
| `89de415bb8d7483baabc507a328ef837c7dda4793ae91dd411a36b31e799a5c6` | `docs/07-devops/environments.md` |
| `4b13a71ac51b12371b5603220d4de7950ac7c7cfb6bed60a6a7996975c04d39e` | `docs/07-devops/local-docker-strategy.md` |
| `c9a890e62acc7b023f4923d3efdd9b8d670dd380141f89299371cc2e09bf0d2b` | `docs/07-devops/README.md` |
| `3a6dbfc53ab2d089179ec1396b8f3d45c800ebc822568da6b0c9f685f579d5cf` | `docs/08-security/lgpd-data-governance.md` |
| `0398cc9f32b5b3aa5a95c3d63c667c7cee0be15062b74581699ed2b0717db253` | `docs/08-security/rbac-matrix.md` |
| `311ae92b55f7d8bac8958ab609ea13c98e06a5baa2dbe9dce8ddec29218d7bc1` | `docs/08-security/README.md` |
| `cfe6616a3b08024bc35d2b59fb29b3a53970f38d3ad0965ef069fd7adaf22716` | `docs/08-security/security-strategy.md` |
| `59f9eb8a0d0d863f9298ee1badd2c138a6bd4e9a3e9e18160160a1c97a29f09a` | `docs/08-security/threat-model.md` |
| `f6ecc2f1106444cfedef60bd81e39977fd37db20722ef830f177b7367f547f77` | `docs/09-observability/observability-strategy.md` |
| `f76c668654e70d5e467779004cfbac68c71d99716ddfa52a2917072b692efa5a` | `docs/09-observability/README.md` |
| `0af5ab2474f5a0ef368f975462d8441335525b88c53974cbfc278d8a5553e1f6` | `docs/09-observability/slo-sli.md` |
| `dd99b0054da485e493ee80d8e638efe05b6d0c2e1dab96b359ef98c7dad8a534` | `docs/10-agents/loops.md` |
| `f074ca8959258e6bca49ed812357e255f9cab493fe68fa9a7a95c3741a8b4197` | `docs/10-agents/README.md` |
| `331dd7b938a27b51e2919e4a3f2fdeac3b90233afada88704fb42304354c25dd` | `docs/10-agents/roles.md` |
| `3ca6ba9cccf543021c1fb99a1fac55c0d13920a05733b09b0c45c030c096071e` | `docs/11-adr/ADR-0001-architecture-style.md` |
| `c2ba7b4537f983cf4cbf1dbec739df904ceafd105ad7e47703a7afec83f11cec` | `docs/11-adr/ADR-0002-monorepo-or-multirepo.md` |
| `590bf4a47313bc64a2c4abd578ece5123e2b357fee6bc718ee58296adebf3714` | `docs/11-adr/ADR-0003-prisma-adoption.md` |
| `523a0e81f6345b08f7aea2ceafe28d7eed22bc934e3cc3d8d68b3c7ac85e76f2` | `docs/11-adr/ADR-0004-multi-tenancy-model.md` |
| `23b9aadb20a058c738e440413e09aaefdf13792e655c9cacf7029df9197f9531` | `docs/11-adr/ADR-0005-auth-strategy.md` |
| `2e7db99d0d0be90a0eca4da839f6eea7dd0e1571d64174558622a67d81f88411` | `docs/11-adr/ADR-0006-notification-strategy.md` |
| `9e5ed6470b3a61ec6d88835f391cea7dc37f0363ba47b0a8d4a82c589eabf0cd` | `docs/11-adr/ADR-0007-fake-payment-api.md` |
| `3e9a0e0c2b2083e6c20415fce58c2ab61168505e62a83954051913ac1a1c6dde` | `docs/11-adr/ADR-0008-fake-invoice-api.md` |
| `711e620cd76d8ea14801e9d4dcfa197d00d36ea54c0f5166e87cfc3a74e95ed5` | `docs/11-adr/ADR-0009-billing-domain.md` |
| `7bdb2d5c7b03fedd8c1e0c2fbafa880011b6b136151962960c3b9efd26dbbc7c` | `docs/11-adr/ADR-0010-feature-flags-vs-entitlements.md` |
| `1be92673da0a96bf60878abe7d7a55d5920a76c87b12de092ef54c5cb702bc90` | `docs/11-adr/ADR-0011-domain-events-catalog.md` |
| `1f48fb95aca1a1d8813e47e68a70b941170558f4f73e05a2af29f3958f4b8017` | `docs/11-adr/ADR-0012-disaster-recovery.md` |
| `a6930d46177a58efb1f03578079b3ca2ca4a4ea04072de40b21013295406d8a8` | `docs/11-adr/ADR-0013-finops-aws.md` |
| `2ee9d212766f000a2335c07cdf4d44aaf97facce5d0063ee6600c641f776b2a3` | `docs/11-adr/ADR-0014-rbac-mvp.md` |
| `52b0701b5c0185e5ad53443662fc36dd3bc8b2512d0f038b51ef7b49abc65c59` | `docs/11-adr/ADR-0015-data-retention-lgpd.md` |
| `acba6961eb0e77ab1b7baa10e39ffff1e89f9ccbf2347a4c99fbbfed1b6a525a` | `docs/11-adr/ADR-0016-slo-load-profile.md` |
| `eaab266d475646af2bcdda7cbeaff372f0a5cf6675ce1f6be87af7121418cb40` | `docs/11-adr/ADR-0017-portfolio-local-first-saas-ready.md` |
| `0dc403b14110fd817d995dec8fa408514f5844f087abc7b941171cdb1ec23fb9` | `docs/11-adr/ADR-0018-cybersecurity-maturity-model.md` |
| `56d050107d29c3588d968b7884b1c6c514b70afe326c6e816a3c07b30ef0820a` | `docs/11-adr/ADR-0019-dev-local-only-active-scope.md` |
| `ea0afd14ceba67bd9a771fe94bc9a00589a37118a80f014e78bed86244fc23a4` | `docs/11-adr/README.md` |
| `c3fe5bd50a2879910991c37061514fbd85939d9632d2cbde546ca76c83ad22ee` | `docs/12-billing/billing-domain.md` |
| `dcfac44789cea0b95815ad3882a76f2d6e8a23bd6bd76f0b64ad8f0fd4bd241f` | `docs/12-billing/overage-policy.md` |
| `267159bc81cc4b08f6a43164204a69e8cf29292187c8e41b88475c75caf02843` | `docs/12-billing/plan-change-policy.md` |
| `b12a67ea49652f2ed45734ae70b5c1b2bbafd0de348714fe3ecf8d8159d37350` | `docs/12-billing/plans.md` |
| `bb3bd199b7b40c9e896ba7f1640eb7787a69d89698bf19c47449cd464ca840a2` | `docs/12-billing/subscriptions.md` |
| `e34715154123acce05158b4c2adac9663c8d3c3dbebfb993bff2ccf03fa0725c` | `docs/12-billing/trials.md` |
| `bb9f354387e7a5fe9ceb517553ca30652ed3c5cdb29c2698a18a9aefa22ba325` | `docs/13-entitlements/entitlements.md` |
| `e2a7bbb8a66bcdb945149e9d093ecd6c22efb4517487eb0170954f30b249f970` | `docs/13-entitlements/feature-flags-vs-entitlements.md` |
| `d6cd413df12b511185277e043a70d1546bfa72c2450608102874c35d073cc3a5` | `docs/13-entitlements/limits-by-plan.md` |
| `6b7556baccf176ba089888fe5b522863273272129dce9baf8fa9e46c520663cc` | `docs/14-events/domain-events-catalog.md` |
| `8e1d622597bbfa006171e48c81b4fd004621ccc88a62fb56867083d619aaf186` | `docs/14-events/event-versioning.md` |
| `746f87932f0a12396a0dd93c0bb8133dd195213facbd81ed632d359bb51533f8` | `docs/14-events/outbox-governance.md` |
| `db9981d6e96143d0cce47cacacdf62d6821e42ddd4dcb8f64bba31a0623dadfe` | `docs/15-ownership/bounded-context-ownership.md` |
| `86b8fcc65a174a5da1029e89c10787a0d09227cb019222ad7b94f3b92f9ec062` | `docs/15-ownership/data-ownership.md` |
| `ef4b40e688263448826a5d78392a77d15bde5ee58d38eb5bae809fd87a39b141` | `docs/15-ownership/module-responsibility-matrix.md` |
| `44618b4221a9b8d199eb700ffff109cc84b8ea70262b831655310c8b54168191` | `docs/16-disaster-recovery/backup-restore-runbook.md` |
| `396f5e7744a332b7b37b24343161262cc8c1ee7f10b66fef4a6601827ad2872f` | `docs/16-disaster-recovery/disaster-recovery-strategy.md` |
| `6c5c2d444a2df2d1b048c5cdadc7be6d7e22b2ce610e6715f72bae7ac65c6ad6` | `docs/16-disaster-recovery/rpo-rto.md` |
| `52b11987f7b4c0997e15e8e1fe3e629cac04961ada6e2304962b381d04be8581` | `docs/17-finops/aws-cost-strategy.md` |
| `fb01ef5e8b4d7a511caad3d8c9975493b8bfb3d2717d4a87be9adc62740e0743` | `docs/17-finops/cost-alerts.md` |
| `fe3b3a7cd9350fccc7f7ae6b1026dc50c02364c6ad7b8afa072dc1dfc27950e1` | `docs/17-finops/cost-by-tenant.md` |
| `88a4727caab6aad44a688dbc76553a80af8d9005276cc464e920f4b8c3cb9827` | `docs/18-governance/anonymization-policy.md` |
| `aeb54e4a58353e74240286c9835924ba15e4e424568f3f699ca2920087655be0` | `docs/18-governance/approval-record.md` |
| `8b34cf202c0212a87470cf1d28d23ae64432e259d80f69f59342d32d15e08555` | `docs/18-governance/data-retention-policy.md` |
| `087e7526b7a7b9ad36036fcf0ea2bf28c13068aaa750ff41f3d4c876a1d49363` | `docs/18-governance/filtered-decisions-2026-06-26.md` |
| `5901d43a4de6a8b5a12fa3939a2f8828f59dfdba21560c8314360626c8c7b17e` | `docs/18-governance/governance-roles.md` |
| `488f865c9a1a9c3b098535591479435a94169ba76043242487f63a9df4ed48e3` | `docs/18-governance/legal-basis-lgpd.md` |
| `77e2aebe21fdbd7078e866d75a59175727ff72870b0d7dee04807b6734128740` | `docs/18-governance/rbac-matrix-mvp.md` |
| `0328cb7e8e1e3083f0d31680d31543898ad37fc95443e84ff898c489736e9510` | `docs/19-operations/load-profile.md` |
| `bd45a5b510335d7d70616d30dfe91bf059b6b02718d75f3bb0f226cb2e7835ae` | `docs/19-operations/local-ports-inventory.md` |
| `01bea934c6b4ade9c6708e64c5b5641a1657fd12a9b279c0af112a8ed0d6ea5a` | `docs/19-operations/slo.md` |
| `e45726cd3bd5349d64b048dea72824b7adce843ac06b5e09950e80a677ba508d` | `docs/20-cybersecurity/audit-and-logging.md` |
| `d13f5fec3d93b002a1672ab4385fb281e2603c611096a9dddc371a9368f922bf` | `docs/20-cybersecurity/incident-response.md` |
| `0410fcef99beee5fe125454f6687a53055457d02d2eb5311fa070163ecdfe8c2` | `docs/20-cybersecurity/nist-ssdf-mapping.md` |
| `35b1383992385a8197cbb29a2b97f1b12c37ca3a822579aa72a40d791665705f` | `docs/20-cybersecurity/owasp-asvs-mapping.md` |
| `9cee8163e6cc5417601e811067b606d40fa1b8f49efc0187d3c63a13d2df6471` | `docs/20-cybersecurity/owasp-samm-roadmap.md` |
| `2a1a6d878ec0418ca0d258bf682383c54b6b4e09935e8c079a76cd831898abb6` | `docs/20-cybersecurity/rbac-test-matrix.md` |
| `4894b01fe27be68d57c604f8ff4abd2d227246cc2e3a37db137305dbd9818e92` | `docs/20-cybersecurity/README.md` |
| `efc8b7d8c618123fdf13b3fc4f77147a0f2b61ff5ba9df392c6989764a690336` | `docs/20-cybersecurity/secrets-management.md` |
| `bb91eb8b3eaed42bc406fd7bd4f37d2ee20cc3aae046291f07713165c0b0c5f0` | `docs/20-cybersecurity/secure-sdlc.md` |
| `d16d07c50ef3fb15dba4911e9cc7eb51af2b3c6716cb1653bb0a6669e390a222` | `docs/20-cybersecurity/security-ci-gates.md` |
| `154bee0af8aa37f650085c5c5c9f427ef94c327dbc5a8560e5ab600cbd3809e0` | `docs/20-cybersecurity/security-roadmap.md` |
| `1e24d00f2fa40c0bd06f0f3889bb1ec72d0cc25682cd2c0be6cb30607689e2d7` | `docs/20-cybersecurity/security-test-strategy.md` |
| `c97e2ec38ab08af6ad78a7fa72cd2d53cfcf62fa193fc5d86fe2c8a04a55cb3c` | `docs/20-cybersecurity/slsa-supply-chain.md` |
| `b1cced1008a01ef3605e658410470d3a8bd06535d43c45f11a91d414e7cad5a7` | `docs/20-cybersecurity/tenant-isolation-tests.md` |
| `69152321e358a8ec052c73775d113adf626c7e10f4d83c2ef3e81520d64c3ff4` | `docs/20-cybersecurity/webhook-security.md` |
| `cb605b35890d6457e9a08e6e48cdfb3cf404f6d84527e89357ad27ccb04e5e4a` | `docs/README.md` |
| `650e2e9a28bfa6142647e91c037db983536eb4a7f22df45259095f89a6316afd` | `README.md` |
| `cb2e75765297b10c83694308e0e0a06e8157683369d05c831339afb3600c03ce` | `specs/001-saas-platform-foundation/checklists/requirements.md` |
| `a6c210ad6c15e943c838f2cf1e031a704f8e5ef3fccb1c251bcf6b1844d9571e` | `specs/001-saas-platform-foundation/contracts/openapi.json` |
| `7e0ee1552614352ee2bfd5f518e86d131ec74a9d257a846b63068e6ff38bc05e` | `specs/001-saas-platform-foundation/data-model.md` |
| `64635be6a82bb904d9f2cdf17adaaa5784cea1064dc1310fa9f1b3893b98e37a` | `specs/001-saas-platform-foundation/plan.md` |
| `27000b09fa8ba6ea2b22ab5b29e93ef6540c7a01c1ff8604c2d4eec7d6204f14` | `specs/001-saas-platform-foundation/quickstart.md` |
| `783c4f363704e08f506ed09074ffb99f979800b580dd61d84f8f3b85e5b79105` | `specs/001-saas-platform-foundation/research.md` |
| `96989b8e86054cd6d20d532c2cc4c664f3f0755943f9f35bfaa31a9200cd3e69` | `specs/001-saas-platform-foundation/review-report.md` |
| `86e1890ae82fd7f8e7496e467db9db701d2b508d5ca13b1e7c468ef92ed19683` | `specs/001-saas-platform-foundation/spec.md` |
| `2e0053154acedbf6b2c68ed35be75ca166f2cf7bdab4b887b4e9001d80b63b82` | `specs/001-saas-platform-foundation/tasks.md` |
| `ac44098261d3a307bf4426e8bf4faf73c3199eb51f5b8cbb9db65d02d2f0af05` | `specs/002-mvp-local-first-slice/approval-record.md` |
| `af5c238962eb73f66eb94c41e8637cfa5bc1ec18b38a1e6f97372fd12942243c` | `specs/002-mvp-local-first-slice/checklists/requirements.md` |
| `f851013765dd53293ecee9eb0c0988cc16b1b12188ac1d762fb78d66ea4d02f1` | `specs/002-mvp-local-first-slice/contracts/openapi.json` |
| `db999c34bad972d9868437d2f3f18717296ef993afc996798986488c021740a7` | `specs/002-mvp-local-first-slice/data-model.md` |
| `97f25b9390020f61d797c9e0a24feaa4aeaf85a9fc6d3070374d0ed87e3e257d` | `specs/002-mvp-local-first-slice/plan.md` |
| `517861545399ea053ace79903fa4024f3c8a5b128e0f5740cd8efb37c4d66565` | `specs/002-mvp-local-first-slice/quickstart.md` |
| `4a5a9eb2adc29c8149e9708327e4e71ac08494b5700b8da9d62c54e255d95779` | `specs/002-mvp-local-first-slice/research.md` |
| `495bf5aed203fc4abc97e1ea0e6c69a21a26b73e4752d4fb5f450cc865a8cf7b` | `specs/002-mvp-local-first-slice/review-report.md` |
| `a7a87a5391c12507b5309bd48d1827dbc44046a2ef9eb7ca7fa1fee7f49da52a` | `specs/002-mvp-local-first-slice/spec.md` |
| `8677c2af79ddd6ac344a3e4cd273cfa1093480df4520ba0efedab99a659a28fc` | `specs/002-mvp-local-first-slice/tasks.md` |
