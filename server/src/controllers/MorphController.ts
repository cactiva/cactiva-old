import { Controller, Post } from "@overnightjs/core";
import { Request, Response } from "express";
import { Morph } from "../morph";

const morph = Morph.getInstance();
@Controller("api/morph")
export class MorphController {
  @Post("jsxexp")
  private jsxexp(req: Request, res: Response) {
    const result = morph.parseJsxExpression(JSON.parse(req.body.value));
    res.status(200).json(result);
  }

  @Post("ast2text")
  private ast2text(req: Request, res: Response) {
    const result = morph.generateSource(req.body);
    res.status(200).json(result);
  }
}
