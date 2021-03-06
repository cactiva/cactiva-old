export enum SyntaxKind {
  Unknown = 0,
  EndOfFileToken = 1,
  SingleLineCommentTrivia = 2,
  MultiLineCommentTrivia = 3,
  NewLineTrivia = 4,
  WhitespaceTrivia = 5,
  ShebangTrivia = 6,
  ConflictMarkerTrivia = 7,
  NumericLiteral = 8,
  BigIntLiteral = 9,
  StringLiteral = 10,
  JsxText = 11,
  JsxTextAllWhiteSpaces = 12,
  RegularExpressionLiteral = 13,
  NoSubstitutionTemplateLiteral = 14,
  TemplateHead = 15,
  TemplateMiddle = 16,
  TemplateTail = 17,
  OpenBraceToken = 18,
  CloseBraceToken = 19,
  OpenParenToken = 20,
  CloseParenToken = 21,
  OpenBracketToken = 22,
  CloseBracketToken = 23,
  DotToken = 24,
  DotDotDotToken = 25,
  SemicolonToken = 26,
  CommaToken = 27,
  LessThanToken = 28,
  LessThanSlashToken = 29,
  GreaterThanToken = 30,
  LessThanEqualsToken = 31,
  GreaterThanEqualsToken = 32,
  EqualsEqualsToken = 33,
  ExclamationEqualsToken = 34,
  EqualsEqualsEqualsToken = 35,
  ExclamationEqualsEqualsToken = 36,
  EqualsGreaterThanToken = 37,
  PlusToken = 38,
  MinusToken = 39,
  AsteriskToken = 40,
  AsteriskAsteriskToken = 41,
  SlashToken = 42,
  PercentToken = 43,
  PlusPlusToken = 44,
  MinusMinusToken = 45,
  LessThanLessThanToken = 46,
  GreaterThanGreaterThanToken = 47,
  GreaterThanGreaterThanGreaterThanToken = 48,
  AmpersandToken = 49,
  BarToken = 50,
  CaretToken = 51,
  ExclamationToken = 52,
  TildeToken = 53,
  AmpersandAmpersandToken = 54,
  BarBarToken = 55,
  QuestionToken = 56,
  ColonToken = 57,
  AtToken = 58,
  /** Only the JSDoc scanner produces BacktickToken. The normal scanner produces NoSubstitutionTemplateLiteral and related kinds. */
  BacktickToken = 59,
  EqualsToken = 60,
  PlusEqualsToken = 61,
  MinusEqualsToken = 62,
  AsteriskEqualsToken = 63,
  AsteriskAsteriskEqualsToken = 64,
  SlashEqualsToken = 65,
  PercentEqualsToken = 66,
  LessThanLessThanEqualsToken = 67,
  GreaterThanGreaterThanEqualsToken = 68,
  GreaterThanGreaterThanGreaterThanEqualsToken = 69,
  AmpersandEqualsToken = 70,
  BarEqualsToken = 71,
  CaretEqualsToken = 72,
  Identifier = 73,
  BreakKeyword = 74,
  CaseKeyword = 75,
  CatchKeyword = 76,
  ClassKeyword = 77,
  ConstKeyword = 78,
  ContinueKeyword = 79,
  DebuggerKeyword = 80,
  DefaultKeyword = 81,
  DeleteKeyword = 82,
  DoKeyword = 83,
  ElseKeyword = 84,
  EnumKeyword = 85,
  ExportKeyword = 86,
  ExtendsKeyword = 87,
  FalseKeyword = 88,
  FinallyKeyword = 89,
  ForKeyword = 90,
  FunctionKeyword = 91,
  IfKeyword = 92,
  ImportKeyword = 93,
  InKeyword = 94,
  InstanceOfKeyword = 95,
  NewKeyword = 96,
  NullKeyword = 97,
  ReturnKeyword = 98,
  SuperKeyword = 99,
  SwitchKeyword = 100,
  ThisKeyword = 101,
  ThrowKeyword = 102,
  TrueKeyword = 103,
  TryKeyword = 104,
  TypeOfKeyword = 105,
  VarKeyword = 106,
  VoidKeyword = 107,
  WhileKeyword = 108,
  WithKeyword = 109,
  ImplementsKeyword = 110,
  InterfaceKeyword = 111,
  LetKeyword = 112,
  PackageKeyword = 113,
  PrivateKeyword = 114,
  ProtectedKeyword = 115,
  PublicKeyword = 116,
  StaticKeyword = 117,
  YieldKeyword = 118,
  AbstractKeyword = 119,
  AsKeyword = 120,
  AnyKeyword = 121,
  AsyncKeyword = 122,
  AwaitKeyword = 123,
  BooleanKeyword = 124,
  ConstructorKeyword = 125,
  DeclareKeyword = 126,
  GetKeyword = 127,
  InferKeyword = 128,
  IsKeyword = 129,
  KeyOfKeyword = 130,
  ModuleKeyword = 131,
  NamespaceKeyword = 132,
  NeverKeyword = 133,
  ReadonlyKeyword = 134,
  RequireKeyword = 135,
  NumberKeyword = 136,
  ObjectKeyword = 137,
  SetKeyword = 138,
  StringKeyword = 139,
  SymbolKeyword = 140,
  TypeKeyword = 141,
  UndefinedKeyword = 142,
  UniqueKeyword = 143,
  UnknownKeyword = 144,
  FromKeyword = 145,
  GlobalKeyword = 146,
  BigIntKeyword = 147,
  OfKeyword = 148,
  QualifiedName = 149,
  ComputedPropertyName = 150,
  TypeParameter = 151,
  Parameter = 152,
  Decorator = 153,
  PropertySignature = 154,
  PropertyDeclaration = 155,
  MethodSignature = 156,
  MethodDeclaration = 157,
  Constructor = 158,
  GetAccessor = 159,
  SetAccessor = 160,
  CallSignature = 161,
  ConstructSignature = 162,
  IndexSignature = 163,
  TypePredicate = 164,
  TypeReference = 165,
  FunctionType = 166,
  ConstructorType = 167,
  TypeQuery = 168,
  TypeLiteral = 169,
  ArrayType = 170,
  TupleType = 171,
  OptionalType = 172,
  RestType = 173,
  UnionType = 174,
  IntersectionType = 175,
  ConditionalType = 176,
  InferType = 177,
  ParenthesizedType = 178,
  ThisType = 179,
  TypeOperator = 180,
  IndexedAccessType = 181,
  MappedType = 182,
  LiteralType = 183,
  ImportType = 184,
  ObjectBindingPattern = 185,
  ArrayBindingPattern = 186,
  BindingElement = 187,
  ArrayLiteralExpression = 188,
  ObjectLiteralExpression = 189,
  PropertyAccessExpression = 190,
  ElementAccessExpression = 191,
  CallExpression = 192,
  NewExpression = 193,
  TaggedTemplateExpression = 194,
  TypeAssertionExpression = 195,
  ParenthesizedExpression = 196,
  FunctionExpression = 197,
  ArrowFunction = 198,
  DeleteExpression = 199,
  TypeOfExpression = 200,
  VoidExpression = 201,
  AwaitExpression = 202,
  PrefixUnaryExpression = 203,
  PostfixUnaryExpression = 204,
  BinaryExpression = 205,
  ConditionalExpression = 206,
  TemplateExpression = 207,
  YieldExpression = 208,
  SpreadElement = 209,
  ClassExpression = 210,
  OmittedExpression = 211,
  ExpressionWithTypeArguments = 212,
  AsExpression = 213,
  NonNullExpression = 214,
  MetaProperty = 215,
  SyntheticExpression = 216,
  TemplateSpan = 217,
  SemicolonClassElement = 218,
  Block = 219,
  VariableStatement = 220,
  EmptyStatement = 221,
  ExpressionStatement = 222,
  IfStatement = 223,
  DoStatement = 224,
  WhileStatement = 225,
  ForStatement = 226,
  ForInStatement = 227,
  ForOfStatement = 228,
  ContinueStatement = 229,
  BreakStatement = 230,
  ReturnStatement = 231,
  WithStatement = 232,
  SwitchStatement = 233,
  LabeledStatement = 234,
  ThrowStatement = 235,
  TryStatement = 236,
  DebuggerStatement = 237,
  VariableDeclaration = 238,
  VariableDeclarationList = 239,
  FunctionDeclaration = 240,
  ClassDeclaration = 241,
  InterfaceDeclaration = 242,
  TypeAliasDeclaration = 243,
  EnumDeclaration = 244,
  ModuleDeclaration = 245,
  ModuleBlock = 246,
  CaseBlock = 247,
  NamespaceExportDeclaration = 248,
  ImportEqualsDeclaration = 249,
  ImportDeclaration = 250,
  ImportClause = 251,
  NamespaceImport = 252,
  NamedImports = 253,
  ImportSpecifier = 254,
  ExportAssignment = 255,
  ExportDeclaration = 256,
  NamedExports = 257,
  ExportSpecifier = 258,
  MissingDeclaration = 259,
  ExternalModuleReference = 260,
  JsxElement = 261,
  JsxSelfClosingElement = 262,
  JsxOpeningElement = 263,
  JsxClosingElement = 264,
  JsxFragment = 265,
  JsxOpeningFragment = 266,
  JsxClosingFragment = 267,
  JsxAttribute = 268,
  JsxAttributes = 269,
  JsxSpreadAttribute = 270,
  JsxExpression = 271,
  CaseClause = 272,
  DefaultClause = 273,
  HeritageClause = 274,
  CatchClause = 275,
  PropertyAssignment = 276,
  ShorthandPropertyAssignment = 277,
  SpreadAssignment = 278,
  EnumMember = 279,
  UnparsedPrologue = 280,
  UnparsedPrepend = 281,
  UnparsedText = 282,
  UnparsedInternalText = 283,
  UnparsedSyntheticReference = 284,
  SourceFile = 285,
  Bundle = 286,
  UnparsedSource = 287,
  InputFiles = 288,
  JSDocTypeExpression = 289,
  JSDocAllType = 290,
  JSDocUnknownType = 291,
  JSDocNullableType = 292,
  JSDocNonNullableType = 293,
  JSDocOptionalType = 294,
  JSDocFunctionType = 295,
  JSDocVariadicType = 296,
  JSDocNamepathType = 297,
  JSDocComment = 298,
  JSDocTypeLiteral = 299,
  JSDocSignature = 300,
  JSDocTag = 301,
  JSDocAugmentsTag = 302,
  JSDocAuthorTag = 303,
  JSDocClassTag = 304,
  JSDocCallbackTag = 305,
  JSDocEnumTag = 306,
  JSDocParameterTag = 307,
  JSDocReturnTag = 308,
  JSDocThisTag = 309,
  JSDocTypeTag = 310,
  JSDocTemplateTag = 311,
  JSDocTypedefTag = 312,
  JSDocPropertyTag = 313,
  SyntaxList = 314,
  NotEmittedStatement = 315,
  PartiallyEmittedExpression = 316,
  CommaListExpression = 317,
  MergeDeclarationMarker = 318,
  EndOfDeclarationMarker = 319,
  Count = 320,
  FirstAssignment = 60,
  LastAssignment = 72,
  FirstCompoundAssignment = 61,
  LastCompoundAssignment = 72,
  FirstReservedWord = 74,
  LastReservedWord = 109,
  FirstKeyword = 74,
  LastKeyword = 148,
  FirstFutureReservedWord = 110,
  LastFutureReservedWord = 118,
  FirstTypeNode = 164,
  LastTypeNode = 184,
  FirstPunctuation = 18,
  LastPunctuation = 72,
  FirstToken = 0,
  LastToken = 148,
  FirstTriviaToken = 2,
  LastTriviaToken = 7,
  FirstLiteralToken = 8,
  LastLiteralToken = 14,
  FirstTemplateToken = 14,
  LastTemplateToken = 17,
  FirstBinaryOperator = 28,
  LastBinaryOperator = 72,
  FirstNode = 149,
  FirstJSDocNode = 289,
  LastJSDocNode = 313,
  FirstJSDocTagNode = 301,
  LastJSDocTagNode = 313
}

export const getSyntaxKindName = (kind: number) => {
  for (var i in SyntaxKind) {
    if ((SyntaxKind as any)[i] === kind) {
      return i;
    }
  }
};
