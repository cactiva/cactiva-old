import { Controller, Get } from "@overnightjs/core";
import { Request, Response } from "express";
import { Morph } from "../morph";
import * as jetpack from "fs-jetpack";
import * as path from "path";

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
}
