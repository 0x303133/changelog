import process from "process";

import { Git } from "./git";

export const cwd = process.cwd();

function onlyUnique(value: string, index: number, self: any[]): boolean {
  return self.indexOf(value) === index;
}

function packageFromPath(path: string): string {
  const parts = path.split("/");

  if (parts[0] !== "packages" || parts.length < 3) return "";

  if (parts.length >= 4 && parts[1][0] === "@") return `${parts[1]}/${parts[2]}`;

  return parts[1];
}

export function getListOfUniquePackages(sha: string): string[] {
  return Git.path.changed(sha)
    .map(path => packageFromPath(path))
    .filter(Boolean)
    .filter(onlyUnique);
}