;; ----------------------------------------
;; Comments
;; ----------------------------------------

(block_comment) @comment
(line_comment) @comment

;; ----------------------------------------
;; PBExport header (treat as special comment)
;; ----------------------------------------

(pbexport_header) @comment.documentation

;; ----------------------------------------
;; Literals
;; ----------------------------------------

(number) @number
(string) @string
(string_fragment) @string
(escape_sequence) @string.special

(boolean) @constant.builtin
(null) @constant.builtin
(array_literal) @constant
(enum_constant) @constant.builtin

;; ----------------------------------------
;; Identifiers and Variables
;; ----------------------------------------

(identifier) @variable

;; In function calls
(call_expression
  function: (identifier) @function.call)

;; In method/property access
(member_expression
  property: (identifier) @property)

;; In label declarations
(label_statement
  name: (identifier) @label)

;; In goto
(goto_statement
  label: (identifier) @label)

;; ----------------------------------------
;; Types
;; ----------------------------------------

(primitive_type) @type.builtin
(user_type) @type

;; Type declaration names
(type_declaration
  name: (identifier) @type.definition)

(forward_type_declaration
  name: (identifier) @type.definition)

;; Ancestor type names
(type_declaration
  ancestor: (identifier) @type)

(forward_type_declaration
  ancestor: (identifier) @type)

;; ----------------------------------------
;; Functions and Methods
;; ----------------------------------------

;; Function definition names
(function_definition
  name: (identifier) @function)

(subroutine_definition
  name: (identifier) @function)

;; Event definition names
(event_definition
  name: (identifier) @function.method)

;; On block names
(on_block
  event_name: (identifier) @function.method)
(on_block
  type_name: (identifier) @type)

;; Function/subroutine prototype names
(function_prototype
  name: (identifier) @function)

;; Type member function names
(type_function_member
  name: (identifier) @function.method)

(type_event_member
  name: (identifier) @function.method)

;; Parameters
(parameter
  name: (identifier) @variable.parameter)

;; ----------------------------------------
;; Operators
;; ----------------------------------------

(binary_expression operator: _ @operator)
(assignment_expression "=" @operator)
(relational_expression operator: _ @operator)
(partial_relational_expression operator: _ @operator)
(unary_expression operator: _ @operator)
(not_expression "not" @keyword.operator)

;; ----------------------------------------
;; Keywords and Control Flow
;; ----------------------------------------

[
  "if" "then" "elseif" "else" "end"
  "for" "to" "step" "next"
  "do" "while" "until" "loop"
  "return" "throw"
  "try" "catch" "finally"
  "create" "destroy"
  "choose" "case" "else" "end"
  "goto" "call" "using"
  "halt" "::" "is"
  "ref" "readonly"
  "forward" "prototypes"
  "type" "from" "within" "autoinstantiate"
  "variables" "shared" "global" "local"
  "function" "subroutine" "event" "on"
  "library" "alias" "throws" "constant"
] @keyword

(continue_statement) @keyword
(exit_statement) @keyword

(access_modifier) @keyword.modifier

;; this/super/parent
(this_expression) @variable.builtin

;; ----------------------------------------
;; Punctuation
;; ----------------------------------------

["(" ")" "[" "]" "{" "}" "," ";"] @punctuation.delimiter
"." @punctuation.delimiter
":" @punctuation.delimiter
