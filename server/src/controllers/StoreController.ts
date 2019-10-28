import { Controller, Get } from "@overnightjs/core";
import { Request, Response } from "express";
import { Morph } from "../morph";
import * as jetpack from "fs-jetpack";
import * as path from "path";
import * as fs from "fs";
import { SourceFile } from "ts-morph";

let morph = Morph.getInstance();
@Controller("api/store")
export class StoreController {
  @Get("list")
  private list(req: Request, res: Response) {
    morph.reload();
    const tree: any = jetpack.inspectTree(
      path.join(morph.getAppPath(), "src/stores"),
      {
        relativePath: true
      }
    );

    res.status(200).json(tree);
  }

  @Get("newfile")
  private newfile(req: Request, res: Response) {
    const sf = morph.project.createSourceFile(
      morph.getAppPath() + req.query.path,
      `import { observable } from "mobx";

export default observable({
    
});
      `,
      {
        overwrite: true
      }
    );
    sf.saveSync();
    morph.project.saveSync();
    res.send({ status: "ok" });
  }

  @Get("readfile")
  private readfile(req: Request, res: Response) {
    console.log(morph.getAppPath() + req.query.path);
    const sf = morph.project.getSourceFile(
      req.query.path.replace("./", morph.getAppPath() + "/src/stores/")
    ) as SourceFile;

    res.send(sf.getText());
  }
}
