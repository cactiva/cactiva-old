import { Controller, Get } from '@overnightjs/core';
import { Request, Response } from 'express';
import { Morph } from '../morph';
import * as path from 'path';
import * as fs from 'fs';

const morph = Morph.getInstance();

@Controller('api/assets')
export class AssetsController {
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
