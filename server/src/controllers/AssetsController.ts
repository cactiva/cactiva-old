import { Controller, Get, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import { Morph } from '../morph';
import * as path from 'path';
import * as fs from 'fs';
import * as multer from 'multer';
import jetpack = require('fs-jetpack');

const morph = Morph.getInstance();
const storage = multer.diskStorage({
  destination: path.join(morph.getAppPath(), 'src/assets/images'),
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  }
});
@Controller('api/assets')
export class AssetsController {
  @Post('upload')
  private _upload(req: Request, res: Response) {
    const uploadMul = multer({ storage: storage });
    const reqHandler = uploadMul.single('file');
    reqHandler(req, res, e => {
      const file = req.file;
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      if (!file) {
        res.status(400).json('File not found!');
      }
      res.status(200).json(file);
    });
  }

  @Get('list')
  private _list(req: Request, res: Response) {
    const tree = jetpack.inspectTree(
      path.join(morph.getAppPath(), 'src/assets/images'),
      {
        relativePath: true
      }
    );

    res.status(200).json(tree);
  }

  @Post('delete')
  private _delete(req: Request, res: Response) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    const filename = req.body.filename;
    const filepath = path.join(
      morph.getAppPath(),
      'src/assets/images/',
      filename
    );
    if (fs.existsSync(filepath)) {
      jetpack.remove(
        path.join(morph.getAppPath(), 'src/assets/images/', filename)
      );
    }
    const tree = jetpack.inspectTree(
      path.join(morph.getAppPath(), 'src/assets/images'),
      {
        relativePath: true
      }
    );
    res.status(200).json(tree);
  }

  @Get(':fileName')
  private readFile(req: Request, res: Response) {
    const filepath = path.join(
      morph.getAppPath(),
      'src/assets/images',
      req.params.fileName
    );
    if (fs.existsSync(filepath)) {
      fs.createReadStream(filepath).pipe(res);
    } else {
      res.status(404).send();
    }
  }
}
