import { Controller, Get, Post } from "@overnightjs/core";
import axios from "axios";
import * as download from "download";
import * as execa from "execa";
import { Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";
import config, { execPath } from "../config";
import { Morph } from "../morph";
import stream from "../stream";
import jetpack = require("fs-jetpack");
const { Client } = require("pg");

@Controller("api/project")
export class ProjectController {
  deleting: string[] = [];
  creating: string[] = [];

  @Get("refresh-comps")
  private async duplicate(req: Request, res: Response) {
    const morph = Morph.getInstance(req.query.project);
    await morph.reloadComponentDefinitions();
    res.send({ status: "ok" });
  }

  @Get("list")
  private list(req: Request, res: Response) {
    res.status(200).json({
      list: (jetpack.list(path.join(execPath, "app")) || [])
        .map(e => {
          let status = !!Morph.instances[e] ? "Loaded" : "Closed";
          if (this.deleting.indexOf(e) >= 0) status = "Deleting";
          if (this.creating.indexOf(e) >= 0) status = "Creating";

          return {
            name: e,
            status
          };
        })
        .filter(e => {
          return e.name.indexOf(".DS_") < 0 && e.name !== 'raw';
        })
    });
  }

  @Get("info")
  private info(req: Request, res: Response) {
    try {
      const name = config.get("app");
      const morph = Morph.getInstance(name);
      if (!morph) {
        res.status(200).json({
          app: "",
          env: "",
          status: "stopped"
        }); return
      }
      if (morph) {
        morph.reload();
      }

      const settings = JSON.parse(
        jetpack.read(path.join(execPath, "app", name, "settings.json")) || "{}"
      );
      settings.name = name;
      jetpack.write(
        path.join(execPath, "app", name, "settings.json"),
        JSON.stringify(settings)
      );

      res.status(200).json({
        app: config.get("app"),
        env: config.get("env"),
        settings,
        theme: JSON.parse(
          jetpack.read(path.join(execPath, "app", name, "src", "theme.json")) ||
          "{}"
        )
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

  @Post("gql-query")
  private async gqlquery(req: Request, res: Response) {
    const name = config.get("app");
    const headers = req.body.headers || {};
    const body = req.body.body;
    const settings = JSON.parse(
      jetpack.read(path.join(execPath, "app", name, "settings.json")) ||
      "{backend: {}}"
    );
    const hasura = settings.hasura;
    const backend = settings.backend;

    headers["x-hasura-admin-secret"] = hasura.secret;
    try {
      let url = `${backend.protocol}://${backend.host}:${backend.port}/hasura/v1/graphql`;
      if (hasura.host) url = `${hasura.host}/v1/graphql`;;
      const gqlres = await axios.post(
        url,
        body,
        {
          headers
        }
      );

      res.status(200).json({
        status: gqlres.status,
        statusText: gqlres.statusText,
        headers: gqlres.headers,
        data: gqlres.data.data || "No Response"
      });
    } catch (e) {
      return res.status(200).json({ ...e, body: e.request.body });
    }
  }

  @Get("read-source")
  private async readSource(req: Request, res: Response) {
    const morph = Morph.getInstance(req.query.project);
    if (!morph) { res.status(400); return }
    if (!req.query.path) {
      res.status(500).end("Read source path is missing");
      return;
    }
    const result = await morph.readTsx(req.query.path, false);
    res.status(200).json(result);
  }

  @Post("apply-imports")
  private async applyImports(req: Request, res: Response) {
    const morph = Morph.getInstance(req.query.project);
    if (!morph) { res.status(400); return }
    const source = JSON.parse(req.body.value);
    const sf = morph.project.createSourceFile(
      "__tempfile" + morph.randomDigits() + "__.tsx",
      source
    );

    morph.processHooks(sf, req.body.hooks);
    morph.processImports(sf, req.body.imports);

    sf.fixMissingImports();
    sf.organizeImports();
    const result = await morph.formatCactivaSource(sf, false);
    res.status(200).json(result);

    await sf.delete();
    return;
  }

  @Get("emit-dts")
  private async emitdts(req: Request, res: Response) {
    const morph = Morph.getInstance(req.query.project);
    if (!morph) { res.status(400); return }
    res.send(await morph.getTypes())
  }

  @Post("write-source")
  private async writeSource(req: Request, res: Response) {
    const morph = Morph.getInstance(req.query.project);
    if (!morph) { res.status(400); return }
    if (!!req.query.path) {
      const source = JSON.parse(req.body.value);
      const sf = morph.project.createSourceFile(
        morph.getAppPath() + req.query.path,
        source,
        {
          overwrite: true
        }
      );

      if (req.body.raw !== "y") {
        morph.processHooks(sf, req.body.hooks);
        morph.processImports(sf, req.body.imports);
        sf.fixMissingImports();
        sf.organizeImports();
      }
      sf.formatText();

      await sf.save();
      await morph.project.save();

      const result = await morph.readTsx(req.query.path, false);
      res.status(200).json(result);
      return;
    }
    res.status(500).json({
      error: "insufficient query param"
    });
  }

  @Get("load")
  private load(req: Request, res: Response) {
    config.set("app", req.query.name);
    (config as any).save();
    res.status(200).send({ status: "ok" });
  }

  @Get("del")
  private del(req: Request, res: Response) {
    config.set("app", "");

    const p = path.join(execPath, "app", req.query.name);
    if (jetpack.exists(p)) {
      (async () => {
        const name = req.query.name;
        this.deleting.push(name);
        await jetpack.removeAsync(p);
        this.deleting.splice(this.deleting.indexOf(name), 1);
      })();
    }
    delete Morph.instances[req.query.name];
    res.status(200).send({ status: "ok" });
  }

  @Post("edit-project")
  private editProject(req: Request, res: Response) {
    const r = jetpack.write(
      path.join(execPath, "app", req.body.name, "settings.json"),
      JSON.stringify(req.body)
    );
    res.status(200).send(req.body);
  }

  @Post("new-project")
  private newProject(req: Request, res: Response) {
    const s = stream("new-project-" + req.body.name);
    if (!!s) {
      (async () => {
        this.creating.push(req.body.name);
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

        git = execa(
          "git",
          ["clone", "https://github.com/cactiva/cactiva-backend", "backend"],
          {
            all: true,
            cwd: path.join(execPath, "app", req.body.name)
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

        jetpack.write(
          path.join(execPath, "app", req.body.name, "settings.json"),
          JSON.stringify(req.body)
        );
        s.send("--- Downloading Hasura ---\n\n");

        const hasura = await download(
          "https://github.com/cactiva/hasura-static/raw/master/linux-amd64"
        ).on("downloadProgress", progress => {
          s.send(
            `Download Progress: ${Math.round(progress.percent * 100)}%` + "\r"
          );
        });
        await jetpack.writeAsync(
          path.join(execPath, "app", req.body.name, "hasura"),
          hasura,
          { atomic: true }
        );

        fs.chmod(
          path.join(execPath, "app", req.body.name, "hasura"),
          "755",
          () => { }
        );

        config.set("app", req.body.name);
        this.creating.splice(this.creating.indexOf(req.body.name), 1);

        s.send("\n\n--- DONE ---");
        s.close();
      })();
    }

    res.status(200).send({ status: "ok" });
  }

  @Post("test-db")
  private async testDb(req: Request, res: Response) {
    const client = new Client(req.body);
    try {
      await client.connect();
      res.status(200).send({
        status: "ok"
      });
    } catch (e) {
      res.status(200).send({
        status: "failed",
        reason: e.message
      });
    }
  }
}
