import hostedInfo from "hosted-git-info";
import process from "process";

type BaseArgv = {
  to: string
  from: string
  "next-version": string
  "commits-marker": string
  "contributors-marker": string
}

type Pkg = {
  repo?: { url: string }
  repository?: { url: string }
  labels?: Record<string, string>
  ignoreContributors?: string[]
}

type Config = BaseArgv & {
  repository: string,
  labels: Record<string, string>
  ignoreContributors: string[]
  token: string
}

const defaultIgnore = [
  "dependabot-bot",
  "dependabot[bot]",
  "dependabot-preview[bot]",
  "greenkeeperio-bot",
  "greenkeeper[bot]",
  "renovate-bot",
  "renovate[bot]",
];

const defaultLabels = {
  breaking: ":boom: Breaking Change",
  enhancement: ":rocket: Enhancement",
  bug: ":bug: Bug Fix",
  documentation: ":memo: Documentation",
  internal: ":house: Internal",
};

export class ConfigFactory {
  public static build(argv: BaseArgv, pkg: Pkg, token: string): Config {
    return {
      to: argv.to,
      from: argv.from,
      token: token,
      labels: ConfigFactory.labels(pkg),
      repository: ConfigFactory.repository(pkg),
      ignoreContributors: ConfigFactory.ignore(pkg),
      "next-version": argv["next-version"],
      "commits-marker": argv["commits-marker"],
      "contributors-marker": argv["contributors-marker"],
    };
  }

  private static repository(pkg: Pkg) {
    const repo = pkg.repo ? pkg.repo : pkg.repository as { url: string };
    if (!repo) {
      console.log(`[Changelog]: Couldn't found git repository. Please, provide it in package.json`);
      process.exit();
    }
    const info = hostedInfo.fromUrl(repo.url);
    if (!info) {
      console.log(`[Changelog]: Couldn't found any info about git repository. Please, check if you provide correct repo in package.json`);
      process.exit();
    }
    return `${info.user}/${info.project}`;
  }

  private static ignore(pkg: Pkg) {
    return "ignoreContributors" in pkg && pkg.ignoreContributors ? pkg.ignoreContributors : defaultIgnore;
  }

  private static labels(pkg: Pkg) {
    return "labels" in pkg && pkg.labels ? pkg.labels : defaultLabels;
  }
}