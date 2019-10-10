import { Controller, Get } from "@overnightjs/core";
import { Request, Response } from "express";
import { Morph } from "../morph";

@Controller("api/project")
export class ProjectController {
  @Get("read-source")
  private readSource(req: Request, res: Response) {
    if (!req.query.path) {
      res.status(500).end("Read source path is missing");
      return;
    }
    const result = Morph.getInstance().readTsx(req.query.path, false);
    res.status(200).json(result);
  }

  @Get("write-source")
  private writeSource(req: Request, res: Response) {
    if (!req.query.path) {
      res.status(500).end("Read source path is missing");
      return;
    }
    const morph = Morph.getInstance();
    const result = morph.generateSource(
      morph.readTsx(req.query.path).component
    );

    res.status(200).json(result);
  }
}
