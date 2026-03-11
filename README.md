# tree-sitter-powerscript

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Tree-sitter parser for the Appeon PowerBuilder 2022 R3 scripting language.

---

## General Information

This project provides a parser grammar for PowerBuilder scripting language (Appeon PowerBuilder 2022 R3) based on Tree-sitter. The motivation behind this work is to enable better tooling support for PowerBuilder scripts — such as syntax highlighting, code navigation, and static analysis — by providing a reliable and formal grammar specification. PowerBuilder remains widely used in legacy enterprise applications, and modernizing its development experience is critical for maintainability and productivity.

The parser grammar is designed to be lightweight and extensible, focusing on the core syntax elements that appear most commonly in real-world PowerBuilder scripts.

---

## Currently Supported Language Features

- **Basic Types**  
  Support for PowerBuilder primitive types: `integer`, `string`, `boolean`, `blob`, `decimal`, `long`, `any`, `date`, `datetime`, and more.

- **Variables**  
  Declaration with optional modifiers (`public`, `private`, `global`), support for arrays with dimensions, and optional initializers.

- **Expressions**

  - Literals: numbers, strings (with escape sequences), booleans (`true`, `false`), and `null`
  - Identifiers and member access (`object.property`)
  - Binary expressions with common operators (`+`, `-`, `*`, `/`, comparison operators, `and`, `or`)
  - Function calls with argument lists and nested expressions
  - Parenthesized expressions and array literals

- **Statements**
  - Label and `goto` statements
  - Expression statements
  - Conditional statements: `if...then...elseif...else...end if`
  - Looping constructs: `for...to...step...next/end for`, `do...while/until...loop`
  - `return` and `throw` statements
  - `try...catch...finally...end try` error handling
  - Object lifecycle: `create`, `destroy`
  - `halt` statement with optional `close`
  - `choose case` statements with `case` and `case else`
  - `call` statement to invoke ancestor scripts and controls

---

## Neovim Integration

This section describes how to integrate this Tree-sitter parser with Neovim using [nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter).

### 1. Register the parser

Add the following to your Neovim config (e.g. `init.lua`) **before** `nvim-treesitter` is set up:

```lua
local parser_config = require("nvim-treesitter.parsers").get_parser_configs()
parser_config.powerscript = {
  install_info = {
    url = "https://github.com/lmortimerl/tree-sitter-powerscript",
    files = { "src/parser.c", "src/scanner.c" },
    branch = "master",
    generate_requires_npm = false,
    requires_generate_from_grammar = false,
  },
  filetype = "powerscript",
}
```

### 2. Install the parser

Inside Neovim, run:

```
:TSInstall powerscript
```

### 3. Set up filetype detection

PowerBuilder source files use several extensions. Add this to your config so Neovim recognises them:

```lua
vim.filetype.add({
  extension = {
    sra = "powerscript",  -- Application
    sru = "powerscript",  -- User Object
    srw = "powerscript",  -- Window
    srd = "powerscript",  -- DataWindow
    srm = "powerscript",  -- Menu
    srf = "powerscript",  -- Function
    srx = "powerscript",  -- Structure
    srp = "powerscript",  -- Pipeline
    srq = "powerscript",  -- Query
  },
})
```

### 4. Copy the highlight queries

`nvim-treesitter` looks for queries under its own runtime path. You can either:

**Option A – symlink/copy manually:**

```sh
# Replace <nvim-treesitter-path> with the actual plugin location, e.g.
# ~/.local/share/nvim/lazy/nvim-treesitter
cp queries/highlights.scm <nvim-treesitter-path>/queries/powerscript/highlights.scm
cp queries/locals.scm     <nvim-treesitter-path>/queries/powerscript/locals.scm
```

**Option B – use your own runtime path (recommended):**

Place the query files under your Neovim config:

```
~/.config/nvim/queries/powerscript/highlights.scm
~/.config/nvim/queries/powerscript/locals.scm
```

Neovim will automatically pick them up from here without touching the plugin directory.

### 5. Enable highlighting

Make sure `highlight` is enabled in your `nvim-treesitter` setup:

```lua
require("nvim-treesitter.configs").setup({
  highlight = {
    enable = true,
  },
})
```

### Local development workflow

If you are modifying the grammar, you can point directly to your local clone instead of the GitHub URL:

```lua
install_info = {
  url = "/path/to/tree-sitter-powerscript",  -- absolute path to this repo
  files = { "src/parser.c", "src/scanner.c" },
},
```

Then re-run `:TSInstall powerscript` (or `:TSUpdate powerscript`) after regenerating the parser with:

```sh
npx tree-sitter generate
```

---

## Roadmap

The following features and improvements are planned for future releases:

- **Enhanced Expression Support**

  - More complex expression parsing (ternary operators, unary operators, typecasting)
  - Support for function definitions and nested functions

- **More Complete Syntax Coverage**

  - Full support for PowerBuilder events and window/control-specific syntax
  - Advanced control structures and scripting constructs

- **Semantic Analysis**

  - Type checking and symbol resolution for better error detection
  - Ancestor object hierarchy resolution for `call` statements

- **Integration**

  - Integration with popular editors and IDEs for syntax highlighting and autocomplete
  - Tooling support for refactoring and code navigation

- **Testing and Validation**
  - Extensive test suite with real-world PowerBuilder scripts
  - Performance optimizations and bug fixes

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Feel free to contribute or raise issues to help improve this parser!

---

_Author:_ Mortimer Gibbons  
_Contact:_ mkirchermeier@gmail.com  
_Repository:_ [https://github.com/lmortimerl/tree-sitter-powerscript](https://github.com/lmortimerl/tree-sitter-powerscript)
