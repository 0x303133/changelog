import { execa, execaSync } from "@esm2cjs/execa";

type ParserFunction<T> = (value: string, index?: number) => T

export class Git {
  private static async execa<T = string>(args: string[], options?: Record<string, string>, pretty?: ParserFunction<T>): Promise<T[]> {
    const raw = (await execa("git", args, options || {}))
      .stdout.split("\n")
      .filter(Boolean);

    if (pretty) return raw.map(pretty).filter(Boolean);

    return raw as T[];
  }

  private static exec<T = string>(args: string[], options?: Record<string, string>, pretty?: ParserFunction<T>): T[] {
    const raw = execaSync("git", args, options || {})
      .stdout.split("\n")
      .filter(Boolean);

    if (pretty) return raw.map(pretty).filter(Boolean);

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
      commits: (from: string, to: string = "") => {
        const args = [
          `log`,
          `--oneline`,
          `--pretty=%H`,
          `${from}..${to}`,
        ];
        return Git.exec<string>(args);
      },
      pulls: (from: string, to: string = "") => {
        const args = [
          `log`,
          `--oneline`,
          `--first-parent`,
          `--merges`,
          `--pretty=%H`,
          `${from}..${to}`,
        ];
        return Git.exec<string>(args);
      },
    };
  }
}