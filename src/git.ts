import { execaSync } from "@esm2cjs/execa";

import { cwd } from "./utils";

type ParserFunction<T> = (value: string, index?: number) => T;

export class Git {
  private static exec<T = string>(args: string[], options?: Record<string, string>, pretty?: ParserFunction<T | null>): T[] {
    const raw = execaSync("git", args, options || {})
      .stdout.split("\n")
      .filter(Boolean);

    if (pretty) return raw.map(pretty).filter(Boolean) as T[];

    return raw as T[];
  }

  public static get tags() {
    return {
      all: () => Git.exec<string>(["tag"]),
      first: () => Git.exec<string>(["tag"])[0],
      last: () => Git.exec<string>(["describe", "--abbrev=0", "--tags"])[0],
      head: () => "HEAD",
    };
  }

  public static get hashes() {
    return {
      pulls: (from: string, to = "") => {
        const args = [`log`, `--oneline`, `--first-parent`, `--merges`, `--pretty=%H`, `${from}..${to}`];
        return Git.exec<string>(args);
      },
    };
  }

  public static get path() {
    return {
      root: () => Git.exec(["rev-parse", "--show-toplevel"], { cwd })[0],
      changed: (sha: string) => Git.exec(["show", "-m", "--name-only", "--pretty=format:", "--first-parent", sha]),
    };
  }
}
