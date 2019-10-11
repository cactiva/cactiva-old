import { Controller, Get } from "@overnightjs/core";
import { Request, Response } from "express";
import { Morph } from "../morph";
import * as jetpack from "fs-jetpack";
import * as path from "path";
import * as fs from 'fs';

const morph = Morph.getInstance();
@Controller("api/ctree")
export class CtreeController {
  @Get("list")
  private list(req: Request, res: Response) {
    const tree: any = jetpack.inspectTree(
      path.join(morph.getAppPath(), "src"),
      {
        relativePath: true
      }
    );

    tree.children = tree.children.filter((e: any) => {
      if (["assets", "libs"].indexOf(e.name) >= 0) {
        return false;
      }
      return true;
    });

    res.status(200).json(tree);
  }


  @Get("move")
  private move(req: Request, res: Response) {
    const from = path.join(morph.getAppPath(), "src", req.query.old);
    const to = path.join(morph.getAppPath(), "src", req.query.new);
    if (fs.lstatSync(from).isDirectory()) {
      const sf = morph.project.getDirectory(from);
      if (sf) {
        sf.moveImmediatelySync(to);
        morph.project.saveSync();
        res.send({ status: 'ok' });
      }
    } else {
      const sf = morph.project.getSourceFile(from);
      if (sf) {
        sf.moveImmediatelySync(to);
        morph.project.saveSync();
        res.send({ status: 'ok' });
      }
    }
  }

}
