import { execa, execaSync } from "@esm2cjs/execa";

type ParserFunction<T> = (value: string, index?: number) => T

export class Git {
  private static async execa<T = string>(args: string[], options?: Record<string, string>, pretty?: ParserFunction<T>): Promise<T[]> {
    const raw = (await execa("git", args, options || {}))
      .stdout.split("\n")
      .filter(Boolean);

    if (pretty) return raw.map(pretty).filter(Boolean)

    return raw as T[];
  }

  private static exec<T = string>(args: string[], options?: Record<string, string>, pretty?: ParserFunction<T>): T[] {
    const raw = execaSync("git", args, options || {})
      .stdout.split("\n")
      .filter(Boolean);

    if (pretty) return raw.map(pretty).filter(Boolean);

    return raw as T[];
  }
}