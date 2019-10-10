import { Controller, Post, Get } from "@overnightjs/core";
import { Request, Response } from "express";
import { Morph } from "../morph";

const morph = Morph.getInstance();
@Controller("api/morph")
export class MorphController {
  @Post("jsx2ast")
  private jsx2ast(req: Request, res: Response) {
    const result = morph.parseJsxExpression(JSON.parse(req.body.value));
    res.status(200).json(result);
  }
}
