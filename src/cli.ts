import highlight from "cli-highlight";
import process from "process";
import fs from "fs/promises";
import yargs from "yargs";
import chalk from "chalk";
import path from "path";

import { ConfigFactory } from "./config";
import { Changelog } from "./changelog";
import { Render } from "./render";
import { cwd } from "./utils";
import { Git } from "./git";

const UNRELEASED = "unreleased";

export async function run() {
  const argv = await yargs
    .usage("changelog [options]")
    .options({
      from: {
        type: "string",
        description: "A git tag or commit hash that determines the lower bound of the range of commits",
        default: Git.tags.first(),
      },
      to: {
        type: "string",
        description: "A git tag or commit hash that determines the upper bound of the range of commits",
        default: Git.tags.head(),
      },
      "next-version": {
        type: "string",
        description: "The name of the next version",
        default: UNRELEASED,
      },
      "contributors-marker": {
        type: "string",
        description: "Contributors marker. Default: -",
        default: "-",
      },
      "commits-marker": {
        type: "string",
        description: "Commits marker. Default: *",
        default: "*",
      },
      filename: {
        type: "string",
        description: "Output filename",
        default: "",
      },
    })
    .example("changelog", 'Create a changelog for the changes after the latest available tag, under "Unreleased" section')
    .example("changelog --from=v0.1.0 --to=v0.3.0", "Create a changelog for the changes in all tags within the given range")
    .epilog("For more information, see https://github.com/0x303133/changelog")
    .wrap(Math.min(100, yargs.terminalWidth()))
    .parse();

  if (!argv.from) {
    console.log(`[Changelog]: First tag doesn't exist. Please, create initial tag.`);
    process.exit();
  }

  if (argv["next-version"] === UNRELEASED && argv.to === "HEAD") {
    console.log(`[Changelog]: Next version not found. Please, provide next-version the same title as the new tag will be.`);
    process.exit();
  }

  try {
    await fs.access(path.join(cwd, ".changelogc"));
  } catch (e) {
    console.log(`[Changelog]: Config file doesn't exist: (.changelogc)`);
    process.exit();
  }

  const token = (await fs.readFile(path.join(cwd, ".changelogc"))).toString();

  try {
    await fs.access(path.join(cwd, "package.json"));
  } catch (e) {
    console.log(`[Changelog]: Package.json doesn't exist.`);
    process.exit();
  }

  const pkg = JSON.parse((await fs.readFile(path.join(cwd, "package.json"))).toString());

  if (!(pkg.repo || pkg.repository)) {
    console.log(`[Changelog]: Repository doesn't exist in package.json`);
    process.exit();
  }

  const config = ConfigFactory.build(argv, pkg, token);

  const releases = await new Changelog(config).createRelease();

  const markdown = new Render(config).markdown(releases);

  if (!argv.filename) {
    let highlighted = highlight(markdown, {
      language: "Markdown",
      theme: {
        section: chalk.bold,
        string: chalk.hex("#0366d6"),
        link: chalk.dim,
      },
    });

    console.log(highlighted);
  } else {
    await fs.writeFile(path.join(cwd, `${argv.filename}.md`), markdown);
  }
}
