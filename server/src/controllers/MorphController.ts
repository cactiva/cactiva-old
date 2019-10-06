import { Controller, Get } from '@overnightjs/core';
import { Request, Response } from 'express';
import { Morph } from '../morph';

const morph = Morph.getInstance();
@Controller('api/morph')
export class MorphController {
  @Get('parse')
  private parse(req: Request, res: Response) {
    const result = morph.parseText("let a = 'asfasf';");
    res.status(200).json(result);
  }
}
