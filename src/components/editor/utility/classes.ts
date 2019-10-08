export abstract class CactivaKind {
  static kindName: string = "";
  static element: any;
  static structure: any;
}
export interface ICactivaTraitField {
  label?: string;
  name: string;
  path: string;
  kind: number;
  default?: any;
  mode?: string;
  options?: {
    styles?: {
      root?: any;
      label?: any;
      field?: any;
    };
    items?: { label: string; value: string | number }[];
  } & any;
}

export interface ICactivaTrait {
  name: string;
  kind?: number;
  default?: any;
  fields: ICactivaTraitField[];
}

export abstract class CactivaTag {
  static tagName: string = "";
  static from: string = "";
  static traits: ICactivaTrait[] = [];
  static element: any;
  static structure: any;
}
