# Agent Guidance

## Documentación

Agents working on this project **must**:

- Look for **work instructions and rules** in the directory:  
  `./.agents/rules`

- Look for available **agent skills** in the directory:  
  `./.agents/skills`

- Look for the **project memory bank** in:  
  `./memory-bank`  
  _(if the directory exists)_

Before taking action (analyzing code, modifying files, or generating outputs), always review the latest files in these locations to ensure compliance with project conventions, context, and operational constraints.

## Guías del proyecto

- [Arquitectura](./.agents/rules/architecture.md): contrato de datos, proxy, gráficas y riesgos de fechas.
- [Nomenclatura](./.agents/rules/naming.md): campos de entrada y salida, y alias de imports.
- [Testing](./.agents/rules/testing.md): pruebas automatizadas y comprobaciones HTTP y visuales.
- [Operación](./.agents/rules/operations.md): arranque con Compose y diagnóstico de servicios.

Los hallazgos de cada guía se mantienen junto a sus enlaces al código; este archivo solo los indexa.
