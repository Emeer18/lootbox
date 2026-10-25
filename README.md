# LootBox

Portfólio em HTML, CSS e JavaScript puros. Não precisa de build: o que está na pasta é o que vai ao ar.

## Preencher

- **Contato:** em `assets/js/main.js`, no topo, preencha `CONTATO` (`whatsapp` com DDI e DDD, `email` e `github`). Enquanto estiver vazio, a seção de contato fica escondida.
- **Prints:** coloque as imagens em `prints/flashsplash`, `prints/markett` e `prints/texflow`, com os nomes `01.png`, `02.png`, `03.png` e assim por diante (também vale `.jpg`, `.jpeg` e `.webp`, até 8 por pasta). Sem print, aparece um celular vazio.
- **Textos:** estão em `index.html`.

## Ver no computador

Abra `index.html` direto no navegador, ou, com o Java instalado:

```
jwebserver -p 5600
```

e acesse http://localhost:5600

## Publicar no GitHub Pages

1. Crie um repositório (por exemplo `lootbox`) e envie o conteúdo desta pasta para a branch `main`.
2. Em **Settings > Pages**, em **Source** escolha **Deploy from a branch**, branch `main` e pasta `/ (root)`.
3. O endereço será `https://<seu-usuario>.github.io/lootbox/`. Se o repositório se chamar `<seu-usuario>.github.io`, o endereço é `https://<seu-usuario>.github.io/`.

Os caminhos são relativos, então funcionam em qualquer um dos dois casos.
