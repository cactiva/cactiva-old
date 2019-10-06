import { Controller, Get, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import { Morph } from '../morph';

const morph = Morph.getInstance();
@Controller('api/morph')
export class MorphController {
  @Get('text2ast')
  private text2ast(req: Request, res: Response) {
    const result = morph.parseText("let a = 'asfasf';");
    res.status(200).json(result);
  }

  @Post('ast2text')
  private ast2text(req: Request, res: Response) {
    const result = morph.generateSource(req.body);
    res.status(200).json(result);
  }
}
