import {
  ICactivaTrait,
  ICactivaTraitField
} from "@src/components/editor/utility/classes";
import { SyntaxKind } from "@src/components/editor/utility/syntaxkinds";

const CactivaTraitStyle: any = {
  Typography: [
    {
      name: "Font Family",
      path: "style.value.fontFamily",
      kind: SyntaxKind.StringLiteral,
      mode: "font",
      default: "Global",
      divider: "Typography",
      options: {
        styles: {
          root: {
            flex: "0 0 100%",
            paddingRight: 0
          }
        }
      }
    },
    {
      name: "Color",
      path: "style.value.color",
      kind: SyntaxKind.StringLiteral,
      mode: "color",
      options: {
        styles: {
          root: {
            flex: "0 0 100%",
            paddingRight: 0
          }
        }
      }
    },
    {
      name: "Font Size",
      path: "style.value.fontSize",
      kind: SyntaxKind.NumericLiteral,
      options: {
        styles: {
          root: {
            flex: "0 0 50%",
            paddingRight: 0
          }
        }
      }
    },
    {
      name: "Line Height",
      path: "style.value.lineHeight",
      kind: SyntaxKind.NumericLiteral,
      options: {
        styles: {
          root: {
            flex: "0 0 50%",
            paddingRight: 0
          }
        }
      }
    },
    {
      name: "Font Style",
      path: "style.value.fontStyle",
      kind: SyntaxKind.StringLiteral,
      mode: "radio",
      options: {
        styles: {
          root: {
            flex: "0 0 50%",
            paddingRight: 0
          }
        },
        items: [
          { value: "normal", label: "Normal", icon: "font", mode: "icon" },
          { value: "italic", label: "Italic", icon: "italic", mode: "icon" }
        ]
      }
    },
    {
      name: "Font Weight",
      path: "style.value.fontWeight",
      kind: SyntaxKind.StringLiteral,
      mode: "select",
      options: {
        styles: {
          root: {
            flex: "0 0 80%",
            paddingRight: 0
          }
        },
        items: [
          { value: "normal", label: "Normal" },
          { value: "bold", label: "Bold" },
          { value: "100", label: "100" },
          { value: "200", label: "200" },
          { value: "300", label: "300" },
          { value: "400", label: "400" },
          { value: "500", label: "500" },
          { value: "600", label: "600" },
          { value: "700", label: "700" },
          { value: "800", label: "800" },
          { value: "900", label: "900" }
        ]
      }
    },
    {
      name: "Text Align",
      path: "style.value.textAlign",
      kind: SyntaxKind.StringLiteral,
      mode: "radio",
      options: {
        styles: {
          root: {
            flex: "0 0 100%",
            paddingRight: 0
          }
        },
        items: [
          { value: "left", label: "Left", icon: "align-left", mode: "icon" },
          {
            value: "center",
            label: "Center",
            icon: "align-center",
            mode: "icon"
          },
          { value: "right", label: "Right", icon: "align-right", mode: "icon" },
          {
            value: "justify",
            label: "Justify",
            icon: "align-justify",
            mode: "icon"
          },
          {
            value: "auto",
            label: "Auto"
          }
        ]
      }
    }
  ] as ICactivaTraitField[],
  Layout: [
    {
      name: "Background Color",
      path: "style.value.backgroundColor",
      kind: SyntaxKind.StringLiteral,
      divider: "Layout",
      mode: "color",
      options: {
        styles: {
          root: {
            flex: "0 0 100%",
            paddingRight: 0
          }
        }
      }
    },
    {
      name: "Display",
      path: "style.value.display",
      kind: SyntaxKind.StringLiteral,
      mode: "radio",
      options: {
        styles: {
          root: {
            flex: "0 0 50%",
            paddingRight: 0
          }
        },
        items: [
          { value: "none", label: "None", icon: "minus", mode: "icon" },
          { value: "flex", label: "Flex", icon: "zoom-to-fit", mode: "icon" }
        ]
      }
    },
    {
      name: "Flex",
      path: "style.value.flex",
      kind: SyntaxKind.NumericLiteral,
      options: {
        styles: {
          root: {
            flex: "0 0 50%",
            paddingRight: 0
          }
        }
      }
    },
    {
      name: "Flex Basis",
      path: "style.value.flexBasis",
      kind: SyntaxKind.StringLiteral,
      options: {
        styles: {
          root: {
            flex: "0 0 50%",
            paddingRight: 0
          }
        }
      }
    },
    {
      name: "Flex Grow",
      path: "style.value.flexGrow",
      kind: SyntaxKind.NumericLiteral,
      options: {
        styles: {
          root: {
            flex: "0 0 50%",
            paddingRight: 0
          }
        }
      }
    },
    {
      name: "Flex Shrink",
      path: "style.value.flexShrink",
      kind: SyntaxKind.NumericLiteral,
      options: {
        styles: {
          root: {
            flex: "0 0 50%",
            paddingRight: 0
          }
        }
      }
    },
    {
      name: "Flex Wrap",
      path: "style.value.flexWrap",
      kind: SyntaxKind.StringLiteral,
      mode: "radio",
      options: {
        styles: {
          root: {
            flex: "0 0 50%",
            paddingRight: 0
          }
        },
        items: [
          { value: "nowrap", label: "No Wrap", icon: "more", mode: "icon" },
          {
            value: "wrap",
            label: "Wrap",
            icon: "drag-handle-horizontal",
            mode: "icon"
          }
        ]
      }
    },
    {
      name: "Flex Direction",
      path: "style.value.flexDirection",
      kind: SyntaxKind.StringLiteral,
      mode: "radio",
      options: {
        styles: {
          root: {
            flex: "0 0 100%",
            paddingRight: 0
          }
        },
        items: [
          { value: "row", label: "Row", icon: "chevron-right", mode: "icon" },
          {
            value: "column",
            label: "Column",
            icon: "chevron-down",
            mode: "icon"
          },
          {
            value: "row-reverse",
            label: "Row Reverse",
            icon: "chevron-left",
            mode: "icon"
          },
          {
            value: "column-reverse",
            label: "Column Reverse",
            icon: "chevron-up",
            mode: "icon"
          }
        ]
      }
    },
    {
      name: "Align Items",
      path: "style.value.alignItems",
      kind: SyntaxKind.StringLiteral,
      mode: "radio",
      options: {
        styles: {
          root: {
            flex: "0 0 100%",
            paddingRight: 0
          }
        },
        items: [
          {
            value: "flex-start",
            label: "Flex Start",
            icon: "alignment-top",
            mode: "icon"
          },
          {
            value: "center",
            label: "Center",
            icon: "horizontal-distribution",
            mode: "icon"
          },
          {
            value: "flex-end",
            label: "Flex End",
            icon: "alignment-bottom",
            mode: "icon"
          },
          {
            value: "stretch",
            label: "Stretch",
            icon: "flow-review",
            mode: "icon"
          },
          {
            value: "baseline",
            label: "Baseline",
            icon: "alignment-horizontal-center",
            mode: "icon"
          }
        ]
      }
    },
    {
      name: "Justify Content",
      path: "style.value.justifyContent",
      kind: SyntaxKind.StringLiteral,
      mode: "radio",
      options: {
        styles: {
          root: {
            flex: "0 0 100%",
            paddingRight: 0
          }
        },
        items: [
          {
            value: "flex-start",
            label: "Flex Start",
            icon: "alignment-left",
            mode: "icon"
          },
          {
            value: "center",
            label: "Center",
            icon: "vertical-distribution",
            mode: "icon"
          },
          {
            value: "flex-end",
            label: "Flex End",
            icon: "alignment-right",
            mode: "icon"
          },
          {
            value: "space-between",
            label: "Space Between",
            icon: "split-columns",
            mode: "icon"
          },
          {
            value: "space-around",
            label: "Space Arround",
            icon: "merge-columns",
            mode: "icon"
          }
        ]
      }
    },
    {
      name: "Position",
      path: "style.value.position",
      kind: SyntaxKind.StringLiteral,
      mode: "radio",
      options: {
        styles: {
          root: {
            flex: "0 0 100%",
            paddingRight: 0
          }
        },
        items: [
          {
            value: "relative",
            label: "Relative",
            icon: "column-layout",
            mode: "icon"
          },
          {
            value: "absolute",
            label: "Absolute",
            icon: "page-layout",
            mode: "icon"
          }
        ]
      }
    },
    {
      name: "",
      path: "style.value.top",
      kind: SyntaxKind.NumericLiteral,
      mode: "multiple",
      options: {
        className: "group-first",
        styles: {
          root: {
            flex: "0 0 45%",
            paddingRight: 0
          }
        },
        fields: {
          name: "Top"
        }
      }
    },
    {
      label: false,
      name: "Right",
      path: "style.value.right",
      kind: SyntaxKind.NumericLiteral,
      options: {
        className: "group-middle",
        styles: {
          root: {
            flex: "0 0 17%",
            paddingRight: 0
          }
        },
        fields: {
          name: "Right"
        }
      }
    },
    {
      label: false,
      name: "Bottom",
      path: "style.value.bottom",
      kind: SyntaxKind.NumericLiteral,
      options: {
        className: "group-middle",
        styles: {
          root: {
            flex: "0 0 17%",
            paddingRight: 0
          }
        },
        fields: {
          name: "Bottom"
        }
      }
    },
    {
      label: false,
      name: "Left",
      path: "style.value.left",
      kind: SyntaxKind.NumericLiteral,
      options: {
        className: "group-last",
        styles: {
          root: {
            flex: "0 0 17%",
            paddingRight: 0
          }
        },
        fields: {
          name: "Left"
        }
      }
    },
    {
      name: "Z-Index",
      path: "style.value.zIndex",
      kind: SyntaxKind.NumericLiteral,
      options: {
        styles: {
          root: {
            flex: "0 0 50%",
            paddingRight: 0
          }
        }
      }
    },
    {
      name: "Opacity",
      path: "style.value.zIndex",
      kind: SyntaxKind.NumericLiteral,
      options: {
        styles: {
          root: {
            flex: "0 0 50%",
            paddingRight: 0
          }
        }
      }
    }
  ] as ICactivaTraitField[],
  Spacing: [
    {
      name: "Margin",
      path: "style.value.marginTop",
      kind: SyntaxKind.NumericLiteral,
      mode: "multiple",
      divider: "Spacing",
      options: {
        className: "group-first",
        styles: {
          root: {
            flex: "0 0 45%",
            paddingRight: 0
          }
        },
        fields: {
          name: "Top"
        }
      }
    },
    {
      label: false,
      name: "Margin Right",
      path: "style.value.marginRight",
      kind: SyntaxKind.NumericLiteral,
      options: {
        className: "group-middle",
        styles: {
          root: {
            flex: "0 0 18%",
            paddingRight: 0
          }
        },
        fields: {
          name: "Right"
        }
      }
    },
    {
      label: false,
      name: "Margin Bottom",
      path: "style.value.marginBottom",
      kind: SyntaxKind.NumericLiteral,
      options: {
        className: "group-middle",
        styles: {
          root: {
            flex: "0 0 18%",
            paddingRight: 0
          }
        },
        fields: {
          name: "Bottom"
        }
      }
    },
    {
      label: false,
      name: "Margin Left",
      path: "style.value.marginLeft",
      kind: SyntaxKind.NumericLiteral,
      options: {
        className: "group-last",
        styles: {
          root: {
            flex: "0 0 18%",
            paddingRight: 0
          }
        },
        fields: {
          name: "Left"
        }
      }
    },
    {
      name: "Padding",
      path: "style.value.paddingTop",
      kind: SyntaxKind.NumericLiteral,
      options: {
        className: "group-first",
        styles: {
          root: {
            flex: "0 0 45%",
            paddingRight: 0
          }
        },
        fields: {
          name: "Top"
        }
      }
    },
    {
      label: false,
      name: "Padding Right",
      path: "style.value.paddingRight",
      kind: SyntaxKind.NumericLiteral,
      options: {
        className: "group-middle",
        styles: {
          root: {
            flex: "0 0 18%",
            paddingRight: 0
          }
        },
        fields: {
          name: "Right"
        }
      }
    },
    {
      label: false,
      name: "Padding Bottom",
      path: "style.value.paddingBottom",
      kind: SyntaxKind.NumericLiteral,
      options: {
        className: "group-middle",
        styles: {
          root: {
            flex: "0 0 18%",
            paddingRight: 0
          }
        },
        fields: {
          name: "Bottom"
        }
      }
    },
    {
      label: false,
      name: "Padding Left",
      path: "style.value.paddingLeft",
      kind: SyntaxKind.NumericLiteral,
      options: {
        className: "group-last",
        styles: {
          root: {
            flex: "0 0 18%",
            paddingRight: 0
          }
        },
        fields: {
          name: "Left"
        }
      }
    }
  ] as ICactivaTraitField[],
  Size: [
    {
      name: "Min Width",
      path: "style.value.minWidth",
      kind: SyntaxKind.NumericLiteral,
      divider: "Size",
      options: {
        styles: {
          root: {
            flex: "0 0 50%",
            paddingRight: 0
          }
        }
      }
    },
    {
      name: "Min Height",
      path: "style.value.minHeight",
      kind: SyntaxKind.NumericLiteral,
      options: {
        styles: {
          root: {
            flex: "0 0 50%",
            paddingRight: 0
          }
        }
      }
    },
    {
      name: "Width",
      path: "style.value.width",
      kind: SyntaxKind.NumericLiteral,
      options: {
        styles: {
          root: {
            flex: "0 0 50%",
            paddingRight: 0
          }
        }
      }
    },
    {
      name: "Height",
      path: "style.value.height",
      kind: SyntaxKind.NumericLiteral,
      options: {
        styles: {
          root: {
            flex: "0 0 50%",
            paddingRight: 0
          }
        }
      }
    },
    {
      name: "Max Width",
      path: "style.value.maxWidth",
      kind: SyntaxKind.NumericLiteral,
      options: {
        styles: {
          root: {
            flex: "0 0 50%",
            paddingRight: 0
          }
        }
      }
    },
    {
      name: "Max Height",
      path: "style.value.maxHeight",
      kind: SyntaxKind.NumericLiteral,
      options: {
        styles: {
          root: {
            flex: "0 0 50%",
            paddingRight: 0
          }
        }
      }
    },
    {
      name: "Overflow",
      path: "style.value.overflow",
      kind: SyntaxKind.StringLiteral,
      mode: "radio",
      options: {
        styles: {
          root: {
            flex: "0 0 100%",
            paddingRight: 0
          }
        },
        items: [
          { value: "hidden", label: "Hidden", icon: "eye-off", mode: "icon" },
          {
            value: "visible",
            label: "Visible",
            icon: "eye-open",
            mode: "icon"
          },
          {
            value: "scroll",
            label: "Scroll",
            icon: "list-detail-view",
            mode: "icon"
          }
        ]
      }
    }
  ] as ICactivaTraitField[],
  Border: [
    {
      name: "Color",
      path: "style.value.borderColor",
      kind: SyntaxKind.StringLiteral,
      mode: "color",
      divider: "Border",
      options: {
        styles: {
          root: {
            flex: "0 0 100%",
            paddingRight: 0
          }
        }
      }
    },
    {
      name: "Style",
      path: "style.value.borderStyle",
      kind: SyntaxKind.StringLiteral,
      mode: "radio",
      options: {
        styles: {
          root: {
            flex: "0 0 70%",
            paddingRight: 0
          }
        },
        items: [
          { value: "solid", label: "Solid", icon: "minus", mode: "icon" },
          { value: "dotted", label: "Dotted", icon: "more", mode: "icon" },
          {
            value: "dashed",
            label: "Dashed",
            icon: "layout-linear",
            mode: "icon"
          }
        ]
      }
    },
    {
      name: "Width",
      path: "style.value.borderWidth",
      kind: SyntaxKind.NumericLiteral,
      options: {
        styles: {
          root: {
            flex: "0 0 60%",
            paddingRight: 0
          }
        }
      }
    },
    {
      name: "Radius",
      path: "style.value.borderRadius",
      kind: SyntaxKind.NumericLiteral,
      options: {
        styles: {
          root: {
            flex: "0 0 99%",
            paddingRight: 0,
            marginBottom: -5
          },
          field: {
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0
          }
        },
        fields: {
          name: "All"
        }
      }
    },
    {
      name: "",
      path: "style.value.borderTopLeftRadius",
      kind: SyntaxKind.NumericLiteral,
      options: {
        className: "group-first",
        styles: {
          root: {
            flex: "0 0 45%",
            paddingRight: 0
          }
        },
        fields: {
          name: "Top Left"
        }
      }
    },
    {
      label: false,
      name: "Border Radius",
      path: "style.value.borderTopRightRadius",
      kind: SyntaxKind.NumericLiteral,
      options: {
        className: "group-middle",
        styles: {
          root: {
            flex: "0 0 18%",
            paddingRight: 0
          }
        },
        fields: {
          name: "Top Right"
        }
      }
    },
    {
      label: false,
      name: "Border Radius",
      path: "style.value.borderBottomRightRadius",
      kind: SyntaxKind.NumericLiteral,
      options: {
        className: "group-middle",
        styles: {
          root: {
            flex: "0 0 18%",
            paddingRight: 0
          }
        },
        fields: {
          name: "Bottom Right"
        }
      }
    },
    {
      label: false,
      name: "Border Radius",
      path: "style.value.borderBottomLeftRadius",
      kind: SyntaxKind.NumericLiteral,
      options: {
        className: "group-last",
        styles: {
          root: {
            flex: "0 0 18%",
            paddingRight: 0
          }
        },
        fields: {
          name: "Bottom Left"
        }
      }
    }
  ] as ICactivaTraitField[]
};

const TraitStyle = (
  excep?: ("Layout" | "Spacing" | "Size" | "Typography" | "Border")[]
) => {
  const fields: ICactivaTraitField[] = [];
  Object.keys(CactivaTraitStyle).map((key: any) => {
    if (!excep || excep.indexOf(key) === -1) {
      fields.push(...CactivaTraitStyle[key]);
    }
  });
  return [
    {
      name: "style",
      kind: SyntaxKind.ObjectLiteralExpression,
      default: {},
      fields: fields
    }
  ] as ICactivaTrait[];
};

export default TraitStyle;
