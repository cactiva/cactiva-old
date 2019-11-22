import { Controller, Get, Post } from "@overnightjs/core";
import { Request, Response } from "express";
import * as jetpack from "fs-jetpack";
import * as path from "path";
import { SourceFile, SyntaxKind } from "ts-morph";
import { parseJsx } from "../libs/morph/parseJsx";
import { Morph } from "../morph";

@Controller("api/api")
export class ApiController {
  @Get("list") 
  private list(req: Request, res: Response) {
    const morph = Morph.getInstance(req.query.project);
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
    const morph = Morph.getInstance(req.query.project);
    const sf = morph.project.createSourceFile(
      morph.getAppPath() + req.query.path,
      `import { createApi } from "@src/libs/utils/api";

export default createApi({
    url: '',
    method: 'get',
    headers: {},
    body: '',
    queryString: {},
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
    const morph = Morph.getInstance(req.query.project);
    const sf = morph.project.getSourceFile(
      req.query.path.replace("./", morph.getAppPath() + "/src/api/")
    ) as SourceFile;

    if (sf !== undefined) {
      const e = sf.getFirstChildByKind(SyntaxKind.ExportAssignment);
      res.send({
        text: sf.getText(),
        source:
          e !== undefined
            ? parseJsx(e.getFirstChildByKindOrThrow(SyntaxKind.CallExpression))
                .arguments[0]
            : {}
      });
    }
  }

  @Post("parse")
  private parse(req: Request, res: Response) {
    const morph = Morph.getInstance(req.query.project);
    morph.createTempSource(req.body.value, (sf: SourceFile) => {
      const e = sf.getFirstChildByKind(SyntaxKind.ExportAssignment);
      res.send({
        source:
          e !== undefined
            ? parseJsx(e.getFirstChildByKindOrThrow(SyntaxKind.CallExpression))
                .arguments[0]
            : {}
      });
    });
  }

  @Post("writefile")
  private writefile(req: Request, res: Response) {
    const morph = Morph.getInstance(req.query.project);
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
