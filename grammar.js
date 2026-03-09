/**
 * @file A parser for the Appeon PowerBuilder 2022 R3 scripting language 'PowerScript'
 * @author Mortimer Gibbons <mkirchermeier@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "powerscript",

  externals: ($) => [$.block_comment],

  conflicts: ($) => [
    [$._expression, $.case_expression],
    [$.binary_expression, $.relational_expression],
    // call arg vs parenthesized expression: f(expr) vs (expr)
    [$.parenthesized_expression, $._call_arg],
  ],

  extras: ($) => [
    /\s/,
    $.block_comment,
    $.line_comment,
    token(seq("&", /\r?\n/)),
  ],

  rules: {
    source_file: ($) =>
      repeat(
        choice(
          $.pbexport_header,
          $.forward_block,
          $.type_declaration,
          $.type_variables_block,
          $.shared_variables_block,
          $.global_variables_block,
          $.forward_prototypes_block,
          $.function_definition,
          $.subroutine_definition,
          $.event_definition,
          $.on_block,
          $._statement,
        ),
      ),

    // $PBExportHeader$foo.sru  /  $PBExportComments$...
    pbexport_header: (_) => token(/\$PBExport[^\n]*/),

    /* ---- Comments ---- */
    line_comment: (_) => token(seq("//", /[^\n]*/)),

    /* ---- Identifiers ---- */
    identifier: (_) =>
      token(/[a-zA-Z_][a-zA-Z0-9_\-\$#%]{0,39}/),

    /* ---- Literals ---- */
    number: (_) => /\d+(\.\d+)?/,
    string: ($) =>
      seq('"', repeat(choice($.string_fragment, $.escape_sequence)), '"'),
    string_fragment: (_) => token.immediate(/[^"~\n]+/),
    escape_sequence: (_) =>
      token.immediate(
        seq(
          "~",
          choice(
            /[ntvrfb"'~]/,
            /[0-9]{3}/,
            /h[0-9A-Fa-f]{2}/,
            /o[0-7]{3}/,
          ),
        ),
      ),
    boolean: (_) => choice("true", "false"),
    null: (_) => "null",
    array_literal: ($) =>
      seq(
        "{",
        optional(seq($._expression, repeat(seq(",", $._expression)))),
        "}",
      ),

    /* ---- Types ---- */
    _type: ($) => choice($.primitive_type, $.user_type),
    user_type: ($) => $.identifier,
    primitive_type: (_) =>
      choice(
        "any",
        "blob",
        "boolean",
        "byte",
        "char",
        "character",
        "date",
        "datetime",
        "decimal",
        "dec",
        "double",
        "integer",
        "int",
        "longlong",
        "long",
        "longptr",
        "real",
        "string",
        "time",
        "unsignedinteger",
        "unsignedint",
        "uint",
        "unsignedlong",
        "ulong",
      ),

    /* ---- Access Modifiers ---- */
    access_modifier: (_) =>
      choice(
        "public",
        "private",
        "protected",
        "protectedread",
        "protectedwrite",
        "privateread",
        "privatewrite",
        "systemread",
        "systemwrite",
      ),

    /* ---- Expressions ---- */
    _expression: ($) =>
      choice(
        $.binary_expression,
        $.unary_expression,
        $.not_expression,
        $.call_expression,
        $.member_expression,
        $.index_expression,
        $.super_call_expression,
        $.enum_constant,
        $.this_expression,
        $.identifier,
        $.number,
        $.string,
        $.boolean,
        $.null,
        $.parenthesized_expression,
        $.array_literal,
        $.assignment_expression,
      ),

    binary_expression: ($) =>
      choice(
        ...[
          ["+", 10],
          ["-", 10],
          ["*", 20],
          ["/", 20],
          ["<", 5],
          [">", 5],
          ["<=", 5],
          [">=", 5],
          ["<>", 5],
          ["=", 5],
          ["and", 3],
          ["or", 1],
        ].map(([operator, precedence]) =>
          prec.left(
            precedence,
            seq(
              field("left", $._expression),
              field("operator", operator),
              field("right", $._expression),
            ),
          ),
        ),
      ),

    unary_expression: ($) =>
      prec(
        15,
        seq(
          field("operator", choice("-", "+")),
          field("operand", $._expression),
        ),
      ),

    not_expression: ($) =>
      prec.right(4, seq("not", field("operand", $._expression))),

    relational_expression: ($) =>
      prec.left(
        5,
        seq(
          field("left", $._expression),
          field("operator", choice("<", "<=", ">", ">=", "=", "<>")),
          field("right", $._expression),
        ),
      ),

    partial_relational_expression: ($) =>
      seq(
        field("operator", choice("<", "<=", ">", ">=", "=", "<>")),
        $._expression,
      ),

    parenthesized_expression: ($) => seq("(", $._expression, ")"),

    member_expression: ($) =>
      prec.left(
        18,
        seq(
          field("object", $._expression),
          ".",
          field("property", $.identifier),
        ),
      ),

    index_expression: ($) =>
      prec.left(
        20,
        seq(
          field("object", $._expression),
          "[",
          field("index", $._expression),
          "]",
        ),
      ),

    call_expression: ($) =>
      prec.left(
        21,
        seq(
          field("function", $._expression),
          "(",
          optional(
            field(
              "arguments",
              seq($._call_arg, repeat(seq(",", $._call_arg))),
            ),
          ),
          ")",
        ),
      ),

    _call_arg: ($) => choice(seq("ref", $._expression), $._expression),

    // ancestor::eventname  (super call expression)
    super_call_expression: ($) =>
      seq(
        field("ancestor", $.identifier),
        "::",
        field("event", $.identifier),
      ),

    // Enumerated constant: AlignCenter!
    enum_constant: (_) =>
      token(/[a-zA-Z_][a-zA-Z0-9_\-\$#%]{0,39}!/),

    // this / super / parent as expressions
    this_expression: (_) => choice("this", "super", "parent"),

    assignment_expression: ($) =>
      prec.right(
        -1,
        seq(
          field("left", $.identifier),
          "=",
          field("right", $._expression),
        ),
      ),

    /* ---- Statements ---- */
    _statement: ($) =>
      seq(
        choice(
          $.label_statement,
          $.goto_statement,
          $.expression_statement,
          $.variable_declaration,
          $.if_statement,
          $.for_statement,
          $.loop_statement,
          $.return_statement,
          $.continue_statement,
          $.exit_statement,
          $.try_statement,
          $.throw_statement,
          $.create_statement,
          $.destroy_statement,
          $.halt_statement,
          $.choose_statement,
          $.call_statement,
        ),
        choice("\n", ";"),
      ),

    label_statement: ($) => seq(field("name", $.identifier), ":"),
    goto_statement: ($) => seq("goto", field("label", $.identifier)),
    expression_statement: ($) => $._expression,

    variable_declaration: ($) =>
      seq(
        optional($.access_modifier),
        optional("constant"),
        $._type,
        $.variable_declarator,
        repeat(seq(",", $.variable_declarator)),
      ),

    if_statement: ($) =>
      choice(
        seq(
          "if",
          field("condition", $._expression),
          "then",
          field("consequence", $._statement),
        ),
        seq(
          "if",
          field("condition", $._expression),
          "then",
          repeat($._statement),
          repeat($.elseif_clause),
          optional($.else_clause),
          "end",
          "if",
        ),
      ),

    elseif_clause: ($) =>
      seq(
        "elseif",
        field("condition", $._expression),
        "then",
        repeat($._statement),
      ),
    else_clause: ($) => seq("else", repeat($._statement)),

    for_statement: ($) =>
      seq(
        "for",
        field("start", $.assignment_expression),
        "to",
        field("end", $._expression),
        optional(field("step", seq("step", $._expression))),
        field("body", repeat($._statement)),
        choice("next", seq("end", "for")),
      ),

    loop_statement: ($) =>
      seq(
        "do",
        choice(
          seq(
            "until",
            field("condition", $._expression),
            field("body", repeat($._statement)),
            "loop",
          ),
          seq(
            "while",
            field("condition", $._expression),
            field("body", repeat($._statement)),
            "loop",
          ),
          seq(
            field("body", repeat($._statement)),
            "loop",
            choice(
              seq("while", field("condition", $._expression)),
              seq("until", field("condition", $._expression)),
            ),
          ),
        ),
      ),

    return_statement: ($) => prec.right(seq("return", optional($._expression))),
    continue_statement: (_) => "continue",
    exit_statement: (_) => "exit",
    throw_statement: ($) => seq("throw", field("expression", $._expression)),

    try_statement: ($) =>
      seq(
        "try",
        repeat($._statement),
        repeat($.catch_clause),
        optional($.finally_clause),
        "end",
        "try",
      ),
    catch_clause: ($) =>
      seq(
        "catch",
        "(",
        field("exception_type", $.identifier),
        field("exception_name", $.identifier),
        ")",
        repeat($._statement),
      ),
    finally_clause: ($) => seq("finally", repeat($._statement)),

    create_statement: ($) => seq("create", optional("using"), $.identifier),
    destroy_statement: ($) => seq("destroy", $.identifier),
    halt_statement: (_) => seq("halt", optional("close")),

    choose_statement: ($) =>
      seq(
        "choose",
        "case",
        field("value", $._expression),
        repeat($.case_clause),
        optional($.case_else_clause),
        "end",
        "choose",
      ),
    case_clause: ($) =>
      seq(
        "case",
        field("conditions", $.case_expression_list),
        repeat($._statement),
      ),
    case_else_clause: ($) => seq("case", "else", repeat($._statement)),
    case_expression_list: ($) =>
      seq($.case_expression, repeat(seq(",", $.case_expression))),
    case_expression: ($) =>
      seq(
        optional("is"),
        choice(
          $.range_expression,
          $.relational_expression,
          $.binary_expression,
          $.partial_relational_expression,
          $.number,
          $.identifier,
          $.string,
        ),
      ),
    range_expression: ($) => seq($.number, "to", $.number),

    call_statement: ($) =>
      seq(
        "call",
        field("ancestor_object", $.identifier),
        optional(seq("`", field("control_name", $.identifier))),
        "::",
        field("event", $.identifier),
      ),

    /* ---- Variable Declarator ---- */
    // Kept for backward compatibility in variable_declaration
    modifiers: () => choice("public", "private", "global"),

    variable_declarator: ($) =>
      seq(
        field("name", $.identifier),
        optional($.array_dimensions),
        optional(seq("=", field("value", $._expression))),
      ),

    array_dimensions: ($) =>
      seq(
        "[",
        optional(seq($._expression, repeat(seq(",", $._expression)))),
        "]",
      ),

    /* ---- Top-Level Structures ---- */

    // forward ... end forward
    forward_block: ($) =>
      seq(
        "forward",
        repeat($.forward_type_declaration),
        "end",
        "forward",
      ),

    // Type declaration inside a forward block (can omit global/local)
    forward_type_declaration: ($) =>
      seq(
        optional(choice("global", "local")),
        "type",
        field("name", $.identifier),
        "from",
        field("ancestor", $._type_ref),
        optional(seq("within", field("parent", $.identifier))),
        optional("autoinstantiate"),
        repeat($.type_member),
        "end",
        "type",
      ),

    // global type Name from Ancestor ... end type
    type_declaration: ($) =>
      seq(
        choice("global", "local"),
        "type",
        field("name", $.identifier),
        "from",
        field("ancestor", $._type_ref),
        optional(seq("within", field("parent", $.identifier))),
        optional("autoinstantiate"),
        repeat($.type_member),
        "end",
        "type",
      ),

    _type_ref: ($) => choice($.primitive_type, $.identifier),

    // A member inside a type block: variable, function prototype, or event prototype
    type_member: ($) =>
      choice(
        $.type_variable_member,
        $.type_function_member,
        $.type_event_member,
      ),

    type_variable_member: ($) =>
      seq(
        optional($.access_modifier),
        optional("constant"),
        $._type,
        $.variable_declarator,
        repeat(seq(",", $.variable_declarator)),
        choice("\n", ";"),
      ),

    type_function_member: ($) =>
      seq(
        optional($.access_modifier),
        choice("function", "subroutine"),
        optional(field("return_type", $._type)),
        field("name", $.identifier),
        "(",
        optional($.parameter_list),
        ")",
        choice("\n", ";"),
      ),

    type_event_member: ($) =>
      seq(
        optional($.access_modifier),
        "event",
        field("name", $.identifier),
        optional(seq("(", optional($.parameter_list), ")")),
        choice("\n", ";"),
      ),

    // type variables ... end variables
    type_variables_block: ($) =>
      seq("type", "variables", repeat($._statement), "end", "variables"),

    // shared variables ... end variables
    shared_variables_block: ($) =>
      seq("shared", "variables", repeat($._statement), "end", "variables"),

    // global variables ... end variables
    global_variables_block: ($) =>
      seq("global", "variables", repeat($._statement), "end", "variables"),

    // forward prototypes ... end prototypes
    forward_prototypes_block: ($) =>
      seq(
        "forward",
        "prototypes",
        repeat($.function_prototype),
        "end",
        "prototypes",
      ),

    function_prototype: ($) =>
      seq(
        optional($.access_modifier),
        choice(
          seq(
            "function",
            field("return_type", $._type),
            field("name", $.identifier),
          ),
          seq("subroutine", field("name", $.identifier)),
        ),
        "(",
        optional($.parameter_list),
        ")",
        optional(seq("library", $.string)),
        optional(seq("alias", "for", $.string)),
        choice("\n", ";"),
      ),

    // public function RetType Name(params) ... end function
    function_definition: ($) =>
      seq(
        optional($.access_modifier),
        "function",
        field("return_type", $._type),
        field("name", $.identifier),
        "(",
        optional($.parameter_list),
        ")",
        optional(seq("throws", $.identifier)),
        repeat($._statement),
        "end",
        "function",
      ),

    // public subroutine Name(params) ... end subroutine
    subroutine_definition: ($) =>
      seq(
        optional($.access_modifier),
        "subroutine",
        field("name", $.identifier),
        "(",
        optional($.parameter_list),
        ")",
        optional(seq("throws", $.identifier)),
        repeat($._statement),
        "end",
        "subroutine",
      ),

    // event Name ... end event
    // PB allows semicolon after event header: "event pfc_postopen;"
    event_definition: ($) =>
      seq(
        optional($.access_modifier),
        "event",
        field("name", $.identifier),
        optional(seq("(", optional($.parameter_list), ")")),
        optional(";"),
        repeat($._statement),
        "end",
        "event",
      ),

    // on TypeName.EventName ... end on
    on_block: ($) =>
      seq(
        "on",
        field("type_name", $.identifier),
        ".",
        field("event_name", $.identifier),
        repeat($._statement),
        "end",
        "on",
      ),

    parameter_list: ($) =>
      seq($.parameter, repeat(seq(",", $.parameter))),

    parameter: ($) =>
      seq(
        optional("readonly"),
        optional("ref"),
        $._type,
        field("name", $.identifier),
        optional($.array_dimensions),
      ),

    operator: (_) =>
      token(
        choice(
          "+", "-", "*", "/", "=", "<", ">", "<=", ">=", "<>", "==",
          "and", "or", "not",
        ),
      ),

    keyword: (_) =>
      choice(
        "alias", "and", "autoinstantiate", "call", "case", "catch", "choose",
        "commit", "connect", "constant", "continue", "create", "cursor",
        "declare", "delete", "descriptor", "destroy", "disconnect", "do",
        "dynamic", "else", "elseif", "end", "enumerated", "event", "execute",
        "exit", "external", "false", "fetch", "finally", "first", "for",
        "forward", "from", "function", "global", "goto", "halt", "if",
        "immediate", "indirect", "insert", "into", "intrinsic", "is", "last",
        "library", "loop", "namespace", "native", "next", "not", "of", "on",
        "or", "parent", "post", "prepare", "prior", "private", "privateread",
        "privatewrite", "procedure", "protected", "protectedread",
        "protectedwrite", "prototypes", "public", "readonly", "ref", "return",
        "rollback", "rpcfunc", "select", "selectblob", "shared", "static",
        "step", "subroutine", "super", "system", "systemread", "systemwrite",
        "then", "this", "throw", "throws", "to", "trigger", "true", "try",
        "type", "until", "update", "updateblob", "using", "variables",
        "while", "with", "within", "xor", "_debug",
      ),
  },
});
