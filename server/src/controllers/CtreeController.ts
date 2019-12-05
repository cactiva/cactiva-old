import { Controller, Get, Post } from "@overnightjs/core";
import { Request, Response } from "express";
import { Morph } from "../morph";
import * as jetpack from "fs-jetpack";
import * as path from "path";
import * as fs from "fs";

@Controller("api/ctree")
export class CtreeController {
  @Get("list")
  private list(req: Request, res: Response) {
    const morph = Morph.getInstance(req.query.project);
    morph.reload();
    const tree: any = jetpack.inspectTree(
      path.join(morph.getAppPath(), "src"),
      {
        relativePath: true
      }
    );

    const exclude = [
      "./assets",
      "./libs",
      "./config",
      "./stores",
      "./api",
      "./.DS_",
      "./components.ts",
      "./theme.json"
    ];
    tree.children = tree.children.filter((e: any) => {
      for (let ex of exclude) {
        if (e.relativePath.indexOf(ex) === 0) return false;
      }
      return true;
    });

    res.status(200).json(tree);
  }

  @Get("duplicate")
  private duplicate(req: Request, res: Response) {
    const morph = Morph.getInstance(req.query.project);
    morph.project.resolveSourceFileDependencies();
    const from = path.join(morph.getAppPath(), req.query.path);
    const to = path.join(morph.getAppPath(), req.query.to);
    if (fs.lstatSync(from).isFile()) {
      const sf = morph.getSourceFile(from, true);
      if (sf) {
        sf.copyImmediatelySync(to);
        morph.project.saveSync();
        res.send({ status: "ok" });
      }
    }
  }

  @Get("newdir")
  private newdir(req: Request, res: Response) {
    const morph = Morph.getInstance(req.query.project);
    const to = path.join(morph.getAppPath(), req.query.path);
    morph.project.createDirectory(to);
    morph.project.saveSync();
    res.send({ status: "ok" });
  }

  @Get("newfile")
  private newfile(req: Request, res: Response) {
    const morph = Morph.getInstance(req.query.project);
    const sf = morph.project.createSourceFile(
      morph.getAppPath() + req.query.path,
      ` import React from "react";
    import { observer, useObservable } from "mobx-react-lite";
    import { View } from "react-native";
    import { useDimensions } from "react-native-hooks";
    import { useNavigation } from "react-navigation-hooks";

    export default observer(() => {
      const dim = useDimensions().window;
      const nav = useNavigation();
      const meta = useObservable({});

      return <View></View>;
    });`,
      {
        overwrite: true
      }
    );
    sf.saveSync();
    morph.project.saveSync();
    res.send({ status: "ok" });
  }

  @Post("newfile")
  private newfilebody(req: Request, res: Response) {
    const morph = Morph.getInstance(req.query.project);
    const source = ` import React from "react";
    import { observer, useObservable } from "mobx-react-lite";
    import { View } from "react-native";
    import { useDimensions } from "react-native-hooks";
    import { useNavigation } from "react-navigation-hooks";
    
    export default observer(() => {
      const dim = useDimensions().window;
      const nav = useNavigation();
      const meta = useObservable({});
    
      return ${req.body.value};
    });`;
    const sf = morph.project.createSourceFile(
      morph.getAppPath() + req.query.path,
      source,
      {
        overwrite: true
      }
    );
    morph.processImports(sf, req.body.imports);
    sf.fixMissingImports();
    sf.organizeImports();
    sf.saveSync();
    morph.project.saveSync();
    res.send({ status: "ok" });
  }

  @Get("move")
  private move(req: Request, res: Response) {
    const morph = Morph.getInstance(req.query.project);
    morph.project.resolveSourceFileDependencies();
    const from = path.join(morph.getAppPath(), req.query.old);
    const to = path.join(morph.getAppPath(), req.query.new);
    if (fs.lstatSync(from).isDirectory()) {
      const sf = morph.getDirectory(from, true);
      if (sf) {
        sf.moveImmediatelySync(to);
        morph.project.saveSync();
        res.send({ status: "ok" });
      }
    } else {
      const sf = morph.getSourceFile(from, true);
      if (sf) {
        sf.moveImmediatelySync(to);
        morph.project.saveSync();
        res.send({ status: "ok" });
      }
    }
  }

  @Get("delete")
  private async delete(req: Request, res: Response) {
    const morph = Morph.getInstance(req.query.project);
    morph.project.resolveSourceFileDependencies();
    let p = path.join(morph.getAppPath(), req.query.path);
    if (fs.lstatSync(p).isDirectory()) {
      const sf = morph.project.getDirectory(p);
      if (sf) {
        sf.forget();
        morph.project.save();
        await jetpack.removeAsync(p);
        res.send("ok");
      }
    } else {
      const sf = morph.project.getSourceFile(p);
      if (sf) {
        sf.delete();
        morph.project.save();
        res.send("ok");
      }
    }
  }
}
