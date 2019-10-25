import { Controller, Get, Post } from "@overnightjs/core";
import { Request, Response } from "express";
import { Morph } from "../morph";
import config from "../config";
import * as execa from "execa";
import * as cp from "child_process";
import * as pstree from "ps-tree";

const morph = Morph.getInstance();
@Controller("api/project")
export class ProjectController {
  cli: any;
  buffer: string = "";
  lastBufferIndex: number = 0;

  @Get("info")
  private info(req: Request, res: Response) {
    this.lastBufferIndex = 0;
    res.status(200).json({
      app: config.get("app"),
      env: config.get("env"),
      status: !!this.cli ? "running" : "stopped"
    });
  }

  @Get("read-source")
  private readSource(req: Request, res: Response) {
    if (!req.query.path) {
      res.status(500).end("Read source path is missing");
      return;
    }
    const result = morph.readTsx(req.query.path, false);
    res.status(200).json(result);
  }

  @Post("write-source")
  private writeSource(req: Request, res: Response) {
    if (!!req.query.path) {
      const source = JSON.parse(req.body.value);
      const preparedSource = morph.prepareSourceForWrite(
        source,
        req.body.imports
      );
      const sf = morph.project.createSourceFile(
        morph.getAppPath() + req.query.path,
        preparedSource,
        {
          overwrite: true
        }
      );
      sf.organizeImports();
      sf.saveSync();
      morph.project.saveSync();

      const result = morph.readTsx(req.query.path, false);
      res.status(200).json(result);
      return;
    }
    res.status(500).json({
      error: "insufficient query param"
    });
  }

  @Get("start-server")
  private async startServer(req: Request, res: Response) {
    process.chdir(morph.getAppPath());
    if (!!this.cli && !!this.cli.cancel) {
      this.cli.cancel();
      return;
    }
    this.buffer = "";
    this.lastBufferIndex = 0;

    this.cli = execa("yarn", ["web"], {
      all: true
    } as any);

    this.cli.all.on("data", (chunk: any) => {
      const text = chunk.toString();
      this.buffer += text;
    });

    res.status(200).json({
      status: "ok"
    });
  }

  @Get("stop-server")
  private async stopServer(req: Request, res: Response) {
    if (this.cli && this.cli.cancel) {
      this.buffer = "";
      const pid = this.cli.pid;
      pstree(pid, (err: any, children: readonly any[]) => {
        if (process.platform !== "win32") {
          cp.spawn(
            "kill",
            ["-9"].concat(
              children.map(function(p) {
                return p.PID;
              })
            )
          );
        }

        this.cli.cancel();
        this.lastBufferIndex = 0;
        this.cli = null;

        res.status(200).json({
          status: "ok"
        });
      });
    }
  }

  @Get("log-server")
  private logServer(req: Request, res: Response) {
    const result = this.buffer.substr(this.lastBufferIndex);
    this.lastBufferIndex = this.buffer.length;
    res.status(200).send(result);
  }
}
