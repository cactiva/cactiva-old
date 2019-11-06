import { Controller, Get, Post } from "@overnightjs/core";
import { Request, Response } from "express";
import { Morph } from "../morph";
import * as path from "path";
import * as fs from "fs";
import * as multer from "multer";
import jetpack = require("fs-jetpack");

@Controller("api/assets")
export class AssetsController {
  @Post("upload")
  private _upload(req: Request, res: Response) {
    const morph = Morph.getInstance(req.query.project);
    const images = multer.diskStorage({
      destination: path.join(morph.getAppPath(), "src/assets/images"),
      filename: (req, file, callback) => {
        callback(null, file.originalname);
      }
    });
    const uploadMul = multer({ storage: images });
    const reqHandler = uploadMul.single("file");
    reqHandler(req, res, e => {
      const file = req.file;
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      if (!file) {
        res.status(400).json("File not found!");
      }
      res.status(200).json(file);
    });
  }

  @Post("upload-font")
  private _uploadFont(req: Request, res: Response) {
    const morph = Morph.getInstance(req.query.project);
    const images = multer.diskStorage({
      destination: path.join(morph.getAppPath(), "src/assets/images"),
      filename: (req, file, callback) => {
        callback(null, file.originalname);
      }
    });
    const uploadMul = multer({
      storage: multer.diskStorage({
        destination: path.join(morph.getAppPath(), "src/assets/fonts"),
        filename: (_, file, callback) => {
          callback(null, file.originalname);
        }
      })
    });
    const reqHandler = uploadMul.single("file");
    reqHandler(req, res, e => {
      let file = req.file;
      jetpack.renameAsync(
        path.join(morph.getAppPath(), "src/assets/fonts/", file.filename),
        req.body.name
      );
      file.filename = file.originalname = req.body.name;
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      if (!file) {
        res.status(400).json("File not found!");
      }
      res.status(200).json(file);
    });
  }

  @Get("list")
  private _list(req: Request, res: Response) {
    const morph = Morph.getInstance(req.query.project);
    const tree = jetpack.inspectTree(
      path.join(morph.getAppPath(), "src/assets/images"),
      {
        relativePath: true
      }
    );

    res.status(200).json(tree);
  }

  @Get("font-list")
  private _fontList(req: Request, res: Response) {
    const morph = Morph.getInstance(req.query.project);
    const tree: any = jetpack.inspectTree(
      path.join(morph.getAppPath(), "src/assets/fonts"),
      {
        relativePath: true
      }
    );
    res.status(200).json(tree);
  }

  @Post("delete")
  private _delete(req: Request, res: Response) {
    const morph = Morph.getInstance(req.query.project);
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    const filename = req.body.filename;
    const filepath = path.join(
      morph.getAppPath(),
      "src/assets/images/",
      filename
    );
    if (fs.existsSync(filepath)) {
      jetpack.remove(
        path.join(morph.getAppPath(), "src/assets/images/", filename)
      );
    }
    const tree = jetpack.inspectTree(
      path.join(morph.getAppPath(), "src/assets/images"),
      {
        relativePath: true
      }
    );
    res.status(200).json(tree);
  }

  @Post("delete-font")
  private _deleteFont(req: Request, res: Response) {
    const morph = Morph.getInstance(req.query.project);
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    const filename = req.body.filename;
    const filepath = path.join(
      morph.getAppPath(),
      "src/assets/fonts/",
      filename
    );
    if (fs.existsSync(filepath)) {
      jetpack.remove(
        path.join(morph.getAppPath(), "src/assets/fonts/", filename)
      );
    }
    const tree: any = jetpack.inspectTree(
      path.join(morph.getAppPath(), "src/assets/fonts"),
      {
        relativePath: true
      }
    );
    res.status(200).json(tree);
  }

  @Get(":fileName")
  private readFile(req: Request, res: Response) {
    const morph = Morph.getInstance(req.query.project);
    const filepath = path.join(
      morph.getAppPath(),
      "src/assets/images",
      req.params.fileName
    );
    if (fs.existsSync(filepath)) {
      fs.createReadStream(filepath).pipe(res);
    } else {
      res.status(404).send();
    }
  }

  @Get("font/:fileName")
  private readFontFile(req: Request, res: Response) {
    const morph = Morph.getInstance(req.query.project);
    const filepath = path.join(
      morph.getAppPath(),
      "src/assets/fonts",
      req.params.fileName
    );
    if (fs.existsSync(filepath)) {
      fs.createReadStream(filepath).pipe(res);
    } else {
      res.status(404).send();
    }
  }
}
