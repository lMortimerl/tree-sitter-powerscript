# tree-sitter-powerscript

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Tree-sitter grammar for Appeon PowerBuilder 2022 R3 / PowerScript.

---

## Overview

This project provides a Tree-sitter parser grammar for PowerScript — the scripting language of Appeon PowerBuilder 2022 R3. It enables syntax highlighting, code navigation, and static analysis in editors that support Tree-sitter. PowerBuilder remains widely used in enterprise applications, and this grammar brings modern tooling support to its scripting language.

---

## Supported Language Features

- **Primitive types** — `integer`, `string`, `boolean`, `blob`, `decimal`, `long`, `date`, `datetime`, `any`, and more
- **Variables** — declarations with access modifiers (`public`, `private`, `global`), array dimensions, and initializers
- **Strings** — double-quoted (`"..."`) and single-quoted (`'...'`), with tilde escape sequences (`~"`, `~'`, `~n`, `~t`, `~r`, hex/octal)
- **Expressions** — literals, identifiers, member access, function calls, binary/unary/relational operators, array literals, enum constants (`AlignLeft!`)
- **Statements**
  - `if ... then ... elseif ... else ... end if`
  - `for ... to ... step ... next` / `end for`
  - `do while/until ... loop` (pre- and post-condition)
  - `choose case ... end choose`
  - `try ... catch ... finally ... end try`
  - `return`, `throw`, `create`, `destroy`, `halt`, `goto`, `call`
- **Top-level structures** — `forward ... end forward`, `type ... from ... end type`, `type variables`, `shared variables`, `global variables`, `forward prototypes`, `function`, `subroutine`, `event`, `on` blocks

---

## Neovim Integration

This parser can be used with [nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter) as a custom language.
The setup below follows the [official nvim-treesitter guide for adding custom languages](https://github.com/nvim-treesitter/nvim-treesitter/?tab=readme-ov-file#adding-custom-languages).

### 1. Register the parser

Call `get_parser_configs()` to register the parser into nvim-treesitter's internal parser list. Do this before calling `nvim-treesitter.configs.setup()`, somewhere that runs at startup after nvim-treesitter is loaded (e.g. your treesitter config file):

```lua
require('nvim-treesitter.parsers').get_parser_configs().powerscript = {
  install_info = {
    url    = 'https://github.com/lmortimerl/tree-sitter-powerscript',
    branch = 'master',
    files  = { 'src/parser.c', 'src/scanner.c' },
    generate = true,
  },
}

require('nvim-treesitter.configs').setup({
  highlight = { enable = true },
})
```

> **Note:** Use `get_parser_configs()`, not a direct field assignment on the module.
> nvim-treesitter's install command reads from an internal list returned by that function —
> assigning directly to the module table (e.g. `require(...).powerscript = ...`) will not work.

### 2. Detect PowerBuilder file extensions as `powerscript`

Add this to your Neovim config (e.g. `options.lua`):

```lua
vim.filetype.add({
  extension = {
    sra = 'powerscript',  -- Application
    sru = 'powerscript',  -- User Object
    srw = 'powerscript',  -- Window
    srd = 'powerscript',  -- DataWindow
    srm = 'powerscript',  -- Menu
    srf = 'powerscript',  -- Function
    srx = 'powerscript',  -- Structure
    srp = 'powerscript',  -- Pipeline
    srq = 'powerscript',  -- Query
  },
})
```

### 3. Install the parser

Inside Neovim, run:

```
:TSInstall powerscript
```

### 4. Add the query files

Place the highlight and locals queries under your Neovim config runtime directory — Neovim picks them up automatically:

```sh
mkdir -p ~/.config/nvim/queries/powerscript
cp queries/highlights.scm ~/.config/nvim/queries/powerscript/highlights.scm
cp queries/locals.scm     ~/.config/nvim/queries/powerscript/locals.scm
```

On Windows (`~/AppData/Local/nvim/`):

```powershell
New-Item -ItemType Directory -Force "$env:LOCALAPPDATA\nvim\queries\powerscript"
Copy-Item queries\highlights.scm "$env:LOCALAPPDATA\nvim\queries\powerscript\"
Copy-Item queries\locals.scm     "$env:LOCALAPPDATA\nvim\queries\powerscript\"
```

### Local development

To work against a local clone instead of the GitHub URL, use `path` instead of `url` (branch/revision are ignored for local paths):

```lua
require('nvim-treesitter.parsers').get_parser_configs().powerscript = {
  install_info = {
    path   = '/path/to/tree-sitter-powerscript',
    files  = { 'src/parser.c', 'src/scanner.c' },
    generate = true,
  },
}
```

After editing `grammar.js`, regenerate and reinstall:

```sh
npx tree-sitter generate
```

```
:TSInstall powerscript
```

---

## Roadmap

- Enhanced expression support (typecasting, more unary operators)
- Full SQL embedding (embedded `SELECT`, `INSERT`, `UPDATE`, `DELETE`)
- Semantic analysis — type checking and symbol resolution
- Extensive test suite with real-world PowerBuilder scripts

---

## License

MIT — see [LICENSE](LICENSE).

---

_Author:_ Mortimer Gibbons
_Contact:_ mkirchermeier@gmail.com
_Repository:_ [https://github.com/lmortimerl/tree-sitter-powerscript](https://github.com/lmortimerl/tree-sitter-powerscript)
