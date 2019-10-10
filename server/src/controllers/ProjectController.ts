import { Controller, Get, Post } from "@overnightjs/core";
import { Request, Response } from "express";
import { Morph } from "../morph";

const morph = Morph.getInstance();
@Controller("api/project")
export class ProjectController {
  @Get("read-source")
  private readSource(req: Request, res: Response) {
    if (!req.query.path) {
      res.status(500).end("Read source path is missing");
      return;
    }
    const result = morph.readTsx(req.query.path, false);
    res.status(200).json(result);
  }

  @Post("write-source")
  private writeSource(req: Request, res: Response) {
    const source = JSON.parse(req.body.value);
    const result = morph.parseSource(source, false);
    if (!!req.query.path) {
      const sf = morph.project.createSourceFile(
        morph.getAppPath() + req.query.path,
        source,
        {
          overwrite: true
        }
      );
      sf.saveSync();
      morph.project.saveSync();
    }
    res.status(200).json(result);
  }
}
