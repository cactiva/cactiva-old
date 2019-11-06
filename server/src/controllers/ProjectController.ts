import { Controller, Get, Post } from "@overnightjs/core";
import { Request, Response } from "express";
import { Morph } from "../morph";
import config, { execPath } from "../config";
import * as execa from "execa";
import * as cp from "child_process";
import * as pstree from "ps-tree";
import * as path from "path";
import jetpack = require("fs-jetpack");
import stream from "../stream";

@Controller("api/project")
export class ProjectController {
  cli: any;
  buffer: string = "";
  lastBufferIndex: number = 0;

  @Get("list")
  private list(req: Request, res: Response) {
    res.status(200).json({
      list: (jetpack.list(path.join(execPath, "app")) || []).map(e => {
        return {
          name: e,
          status: !!Morph.instances[e] ? "Loaded" : "Closed"
        };
      })
    });
  }

  @Get("info")
  private info(req: Request, res: Response) {
    this.lastBufferIndex = 0;
    try {
      Morph.getInstance(config.get("app"));
      res.status(200).json({
        app: config.get("app"),
        env: config.get("env"),
        status: !!this.cli ? "running" : "stopped"
      });
    } catch (e) {
      res.status(200).json({
        app: "",
        env: "",
        status: "stopped"
      });
    }
  }

  @Get("read-source")
  private readSource(req: Request, res: Response) {
    const morph = Morph.getInstance(req.query.project);
    if (!req.query.path) {
      res.status(500).end("Read source path is missing");
      return;
    }
    const result = morph.readTsx(req.query.path, false);
    res.status(200).json(result);
  }

  @Post("write-source")
  private writeSource(req: Request, res: Response) {
    const morph = Morph.getInstance(req.query.project);
    if (!!req.query.path) {
      const source = JSON.parse(req.body.value);
      let sf = null;
      if (req.body.raw === "y") {
        sf = morph.project.createSourceFile(
          morph.getAppPath() + req.query.path,
          source,
          {
            overwrite: true
          }
        );
      } else {
        const preparedSource = morph.prepareSourceForWrite(
          source,
          req.body.imports
        );
        sf = morph.project.createSourceFile(
          morph.getAppPath() + req.query.path,
          preparedSource,
          {
            overwrite: true
          }
        );
      }
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
    const morph = Morph.getInstance(req.query.project);
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

  @Get("load")
  private load(req: Request, res: Response) {
    config.set("app", req.query.name);
    res.status(200).send({ status: "ok" });
  }

  @Get("del")
  private async del(req: Request, res: Response) {
    config.set("app", "");

    const p = path.join(execPath, "app", req.query.name);
    if (jetpack.exists(p)) {
      jetpack.remove(p);
    }
    delete Morph.instances[req.query.name];
    res.status(200).send({ status: "ok" });
  }

  @Post("new-project")
  private newProject(req: Request, res: Response) {
    const s = stream("new-project-" + req.body.name);
    if (!!s) {
      (async () => {
        const git = execa(
          "git",
          ["clone", "https://github.com/cactiva/cactiva-base", req.body.name],
          {
            all: true,
            cwd: path.join(execPath, "app")
          } as any
        );

        if (git.all) {
          git.all.on("data", e => {
            s.send(e.toString());
          });
          git.all.pipe(process.stdout);
        }

        await git;

        const yarn = execa("yarn", {
          all: true,
          cwd: path.join(execPath, "app", req.body.name)
        } as any);

        if (yarn.all) {
          yarn.all.on("data", e => {
            s.send(e.toString());
          });
          yarn.all.pipe(process.stdout);
        }
        await yarn;
        s.send("--- DONE ---");
        s.close();

        config.set("app", req.body.name);
      })();
    }

    res.status(200).send({ status: "ok" });
  }
}
