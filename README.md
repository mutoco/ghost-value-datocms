# Ghost Value — DatoCMS Plugin

**Ghost Value** is a simple DatoCMS field extension for **Single-line/Textarea String fields** that displays the value of another Single-line String field in the same record as a placeholder.

## How it works

1. Add the **Ghost Value** plugin to a Single-line String field.
2. In the plugin configuration, select another Single-line String field as the **source field**.
3. While editing, the value of the source field will appear as a placeholder in the current field.

## Use cases

- Suggesting titles based on another field
- Mirroring content without duplicating data
- Helping editors maintain consistency across fields

## Limitations

- Works only with **Single-line and Textarea String fields**
- The placeholder updates based on the current form state
