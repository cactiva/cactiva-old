import { Controller, Post, Get } from "@overnightjs/core";
import { Request, Response } from "express";
import { Morph } from "../morph";

@Controller("api/morph")
export class MorphController {
  @Post("jsx2ast")
  private jsx2ast(req: Request, res: Response) {
    const morph = Morph.getInstance(req.query.project);
    const result = morph.parseJsxExpression(JSON.parse(req.body.value));
    res.status(200).json(result);
  }

  @Post("parse-exp")
  private parseExp(req: Request, res: Response) {
    const morph = Morph.getInstance(req.query.project);
    const result = morph.parseExpression(req.body.value);
    res.status(200).json(result);
  }
}
  