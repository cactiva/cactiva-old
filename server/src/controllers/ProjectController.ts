import { Controller, Get, Post } from "@overnightjs/core";
import { Request, Response } from "express";
import { Morph } from "../morph";
import config, { execPath } from "../config";
import * as execa from "execa";
import * as cp from "child_process";
import * as pstree from "ps-tree";
import * as path from "path";
import jetpack = require("fs-jetpack");
import stream, { streams } from "../stream";

@Controller("api/project")
export class ProjectController {
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
    try {
      const name = config.get("app");
      Morph.getInstance(name);
      res.status(200).json({
        app: config.get("app"),
        env: config.get("env"),
        settings: JSON.parse(
          jetpack.read(
            path.join(execPath, "app", name, "settings.json")
          ) || "{}"
        ),
        expo: !!streams[`expo-${name}`] ? "running" : "stopped",
        hasura: !!streams[`hasura-${name}`] ? "running" : "stopped",
        backend: !!streams[`backend-${name}`] ? "running" : "stopped"
      });
    } catch (e) {
      console.log(e);
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

  @Get("start-expo")
  private async startExpo(req: Request, res: Response) {
    const morph = Morph.getInstance(req.query.project);
    process.chdir(morph.getAppPath());

    const st = stream(`expo-${req.query.project}`);
    st.cli = execa("yarn", ["web"], {
      all: true,
      cwd: morph.getAppPath()
    } as any);
    st.cli.all.on("data", (chunk: any) => {
      st.send(chunk.toString());
    });

    res.status(200).json({
      status: "ok"
    });
  }

  @Get("stop-expo")
  private async stopExpo(req: Request, res: Response) {
    const st = streams[`expo-${req.query.project}`];
    if (st && st.cli) {
      const pid = st.cli.pid;
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

        st.cli.cancel();
        st.cli = null;
        st.close();

        res.status(200).json({
          status: "ok"
        });
      });
    }
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
        let git = execa(
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

        jetpack.remove(
          path.join(execPath, "app", req.body.name, "src", "libs")
        );
        git = execa(
          "git",
          ["clone", "https://github.com/cactiva/cactiva-libs", "libs"],
          {
            all: true,
            cwd: path.join(execPath, "app", req.body.name, "src")
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

        jetpack.write(
          path.join(execPath, "app", req.body.name, "settings.json"),
          JSON.stringify(req.query)
        );

        config.set("app", req.body.name);
      })();
    }

    res.status(200).send({ status: "ok" });
  }
}
