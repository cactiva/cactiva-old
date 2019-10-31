import { Controller, Get, Post } from "@overnightjs/core";
import { Request, Response } from "express";
import * as jetpack from "fs-jetpack";
import * as _ from "lodash";
import * as path from "path";
import { SourceFile, SyntaxKind } from "ts-morph";
import { getHooks } from "../libs/morph/getHooks";
import { parseJsx } from "../libs/morph/parseJsx";
import { Morph } from "../morph";

let morph = Morph.getInstance();
@Controller("api/api")
export class ApiController {
  @Get("list")
  private list(req: Request, res: Response) {
    morph.reload();
    const tree: any = jetpack.inspectTree(
      path.join(morph.getAppPath(), "src/api"),
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
      `import { createApi } from "@src/utility/api";

export default createApi({
    path: '',
    method: 'get',
    body: '',
    pre: (params:any, api:any) => {
      return api;
    },
    post: (result:any, api:any) => {
      return result;
    }
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
      req.query.path.replace("./", morph.getAppPath() + "/src/api/")
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
          e.getFilePath().indexOf(morph.getAppPath() + "/src/api/") === 0
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
    const sf = morph.project.createSourceFile(
      req.query.path.replace("./", morph.getAppPath() + "/src/api/"),
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
