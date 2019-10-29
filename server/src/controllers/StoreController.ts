import { Controller, Get, Post } from "@overnightjs/core";
import { Request, Response } from "express";
import { Morph } from "../morph";
import * as jetpack from "fs-jetpack";
import * as path from "path";
import * as fs from "fs";
import { SourceFile, SyntaxKind } from "ts-morph";
import { get } from "http";
import { defaultExport } from "../libs/morph/defaultExport";
import { parseJsx } from "../libs/morph/parseJsx";

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
    const sf = morph.project.getSourceFile(
      req.query.path.replace("./", morph.getAppPath() + "/src/stores/")
    ) as SourceFile;

    res.send(sf.getText());
  }

  @Get("definition")
  private definition(req: Request, res: Response) {
    const files = morph.project.getSourceFiles();
    const result: any = {};
    files
      .filter((e: any) => {
        return (
          e.getFilePath().indexOf(morph.getAppPath() + "/src/stores/") === 0
        );
      })
      .map((e: any) => {
        const name = e.getBaseName().substr(0, e.getBaseName().length - 3);
        result[name] = parseJsx(
          e
            .getFirstChildByKind(SyntaxKind.ExportAssignment)
            .getFirstChildByKindOrThrow(SyntaxKind.CallExpression)
        ).arguments[0];
      });
    res.send(result);
  }

  @Post("writefile")
  private writefile(req: Request, res: Response) {
    console.log(req.body);
    const sf = morph.project.createSourceFile(
      req.query.path.replace("./", morph.getAppPath() + "/src/stores/"),
      req.body.value,
      {
        overwrite: true
      }
    );
    sf.organizeImports();
    sf.saveSync();
    morph.project.saveSync();
    res.send({
      status: "ok"
    });
  }
}
