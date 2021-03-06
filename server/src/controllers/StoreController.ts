import { Controller, Get, Post } from "@overnightjs/core";
import { Request, Response } from "express";
import * as jetpack from "fs-jetpack";
import * as _ from "lodash";
import * as path from "path";
import { SourceFile, SyntaxKind } from "ts-morph";
import { getHooks } from "../libs/morph/getHooks";
import { parseJsx } from "../libs/morph/parseJsx";
import { Morph } from "../morph";

@Controller("api/store")
export class StoreController {
  @Get("list")
  private list(req: Request, res: Response) {
    const morph = Morph.getInstance(req.query.project);
    if (!morph) { res.status(400); return }
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
  private async newfile(req: Request, res: Response) {
    const morph = Morph.getInstance(req.query.project);
    if (!morph) { res.status(400); return }
    const name = req.query.path
      .split("/")
      .pop()
      .split(".")[0];
    const sf = morph.project.createSourceFile(
      morph.getAppPath() + req.query.path,
      `import store from "@src/libs/store";

export default store("${name}", {
    
});
      `,
      {
        overwrite: true
      }
    );
    await sf.save();
    await morph.project.save();
    res.send({ status: "ok" });
  }

  @Get("readfile")
  private readfile(req: Request, res: Response) {
    const morph = Morph.getInstance(req.query.project);
    if (!morph) { res.status(400); return }
    const sf = morph.project.getSourceFile(
      req.query.path.replace("./", morph.getAppPath() + "/src/stores/")
    ) as SourceFile;

    res.send(sf.getText());
  }

  @Get("definition")
  private definition(req: Request, res: Response) {
    const morph = Morph.getInstance(req.query.project);
    if (!morph) { res.status(400); return }
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
        const store = parseJsx(
          e
            .getFirstChildByKind(SyntaxKind.ExportAssignment)
            .getFirstChildByKindOrThrow(SyntaxKind.CallExpression)
        ).arguments;
        result[name] = store[0];
        if (store[0].kind === SyntaxKind.StringLiteral) {
          result[name] = store[1];
        }
      });

    if (req.query.path) {
      const sf = morph.project.getSourceFile(
        morph.getAppPath() + req.query.path
      ) as SourceFile;
      const hooks = getHooks(sf);
      hooks.map((h: any) => {
        if (h && h.name && h.value.expression === "useObservable") {
          result[h.name] = _.get(h, "value.arguments.0", {
            kind: 189,
            value: {}
          });
        }
      });
    }

    // if (req.query.async) {
    //   files
    //     .filter((e: any) => {
    //       return (
    //         e.getFilePath().indexOf(morph.getAppPath() + "/src/api/") === 0
    //       );
    //     })
    //     .map((e: any) => {
    //       const name = e.getBaseName().substr(0, e.getBaseName().length - 3);
    //       if (name === "index") return;
    //       result["await api." + name + ".call()"] = {
    //         kind: SyntaxKind.StringLiteral,
    //         value: '""'
    //       };
    //     });
    // }

    res.send(result);
  }

  @Post("writefile")
  private async writefile(req: Request, res: Response) {
    const morph = Morph.getInstance(req.query.project);
    if (!morph) { res.status(400); return }
    const sf = morph.project.createSourceFile(
      req.query.path.replace("./", morph.getAppPath() + "/src/stores/"),
      req.body.value,
      {
        overwrite: true
      }
    );
    sf.organizeImports();
    await sf.save();
    await morph.project.save();
    res.send({
      status: "ok"
    });
  }
}
