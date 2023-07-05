import process from "process";

import { Github, GithubPullRequest } from "./github";
import { Commit, Git } from "./git";
import { Config } from "./config";

export type PullRequest = GithubPullRequest & { packages: string[] }

export type Release = {
  title: string,
  system_title: `${string}..${string}`
  commits: Commit[]
  pulls: PullRequest[],
  contributors: string[]
}

export class Changelog {
  private readonly github: Github;

  constructor(private readonly config: Config) {
    this.github = new Github(this.config.token, this.config.repository);
  }

  public async createRelease() {
    const tags = this.tagsRange(this.config.from, this.config.to);
    return await this.releases(tags);
  }

  private tagsRange(from: string, to: string) {
    let tags = Git.tags.all();

    if (tags.length === 0) {
      console.log(`[Changelog]: Tags not found`);
      process.exit();
    }

    if (tags.indexOf(from) === -1) {
      console.log(`[Changelog]: From tag not found`);
      process.exit();
    }

    if (to === "HEAD") {
      tags = tags.slice(tags.indexOf(from));
      tags.push("HEAD");
    } else {
      if (tags.indexOf(to) === -1) {
        console.log(`[Changelog]: To tag not found`);
        process.exit();
      }
      tags = tags.slice(tags.indexOf(from), tags.indexOf(to));
    }
    return tags;
  }

  private async releases(tags: string[]) {
    const Releases: Release[] = [];

    for (let i = 0; i < tags.length - 1; i++) {
      const raw_commits = Git.hashes.commits(tags[i], tags[i + 1]);
      const raw_pulls = Git.hashes.pulls(tags[i], tags[i + 1]);

      const commitsInPulls: string[] = [];

      await Promise.all(raw_pulls.map(async (pull) => {
        const shaPull = await this.github.pulls.bySha(pull);
        const commits_in_pull = (await this.github.pulls.commits(shaPull.number)).map(commit => commit.sha);
        commitsInPulls.push(...commits_in_pull);
      }));
      const commits_hashes = raw_commits.filter((el) => !raw_pulls.includes(el) && !commitsInPulls.includes(el));

      const commits = await Git.sha.commits(commits_hashes);
      const pulls = await this.github.pulls.all(raw_pulls);
      const contributors: Set<string> = new Set();

      commits.forEach(commit => contributors.add(commit.user));
      pulls.forEach(pull => contributors.add(pull.user.login));

      Releases.push({
        title: tags[i + 1] === "HEAD" ? this.config["next-version"] : tags[i + 1],
        commits: commits,
        pulls: pulls,
        system_title: `${tags[i]}..${tags[i + 1]}`,
        contributors: [...contributors],
      });
    }

    return Releases;
  }
}