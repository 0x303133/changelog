import { execa, execaSync } from "@esm2cjs/execa";

import { cwd } from "./utils";

type ParserFunction<T> = (value: string, index?: number) => T;

interface BaseGitStructure {
  shortSHA: string;
  longSHA: string;
}

export interface Commit extends BaseGitStructure {
  refName: string;
  summary: string;
  date: string;
  user: string;
}

const commitParser: ParserFunction<Commit | null> = (commit) => {
  const parts = commit.match(/shash<(.+)> lhash<(.*)> ref<(.*)> message<(.*)> date<(.*)> user<(.*)>/) || [];

  if (!parts || parts.length === 0) return null;

  return {
    shortSHA: parts[1],
    longSHA: parts[2],
    refName: parts[3],
    summary: parts[4],
    date: parts[5],
    user: parts[6],
  };
};

export class Git {
  private static async execa<T = string>(
    args: string[],
    options?: Record<string, string>,
    pretty?: ParserFunction<T | null>,
  ): Promise<T[]> {
    const raw = (await execa("git", args, options || {})).stdout.split("\n").filter(Boolean);

    if (pretty) return raw.map(pretty).filter(Boolean) as T[];

    return raw as T[];
  }

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
      commits: (from: string, to = "") => {
        const args = [`log`, `--oneline`, `--pretty=%H`, `${from}..${to}`];
        return Git.exec<string>(args);
      },
      pulls: (from: string, to = "") => {
        const args = [`log`, `--oneline`, `--first-parent`, `--merges`, `--pretty=%H`, `${from}..${to}`];
        return Git.exec<string>(args);
      },
    };
  }

  public static get sha() {
    return {
      commits: async (hashes: string[]): Promise<Commit[]> => {
        return (await Promise.all(
          hashes.map(async (hash) => {
            const args = [
              `log`,
              `-1`,
              `--oneline`,
              `--pretty=shash<%h> lhash<%H> ref<%D> message<%s> date<%cd> user<%an>`,
              `--date=short`,
              `${hash}`,
            ];
            return (await Git.execa<Commit>(args, {}, commitParser))[0];
          }),
        )) as unknown as Promise<Commit[]>;
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
