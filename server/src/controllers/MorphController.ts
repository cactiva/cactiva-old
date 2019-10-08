import { Controller, Get, Post } from "@overnightjs/core";
import { Request, Response } from "express";
import { Morph } from "../morph";
import { SyntaxKind } from "ts-morph";

const morph = Morph.getInstance();
@Controller("api/morph")
export class MorphController {
  @Get("text2ast")
  private text2ast(req: Request, res: Response) {
    const result = morph.parseText("let a = 'asfasf';");
    res.status(200).json(result);
  }

  @Post("ast2text")
  private ast2text(req: Request, res: Response) {
    const result = morph.generateSource(req.body);
    res.status(200).json(result);
  }

  // @Post("ast2exp")
  // private ast2exp(req: Request, res: Response) {
  //   const rawResult = morph.generateExpression(req.body);
  //   const result = [""] as any;

  //   rawResult.map(r => {
  //     if (typeof r === "string") {
  //       if (typeof result[result.length - 1] === "string") {
  //         result[result.length - 1] = result[result.length - 1] + r;
  //         return;
  //       }
  //     }

  //     if (Array.isArray(r)) {
  //       r.map(rr => {
  //         result.push(rr);
  //       });
  //       return;
  //     }

  //     result.push(r);
  //   });

  //   res.status(200).json(
  //     result.map((r: any) => {
  //       if (typeof r === "string") {
  //         return { kind: SyntaxKind.JsxText, value: r };
  //       }
  //       return r;
  //     })
  //   );
  // }
}
