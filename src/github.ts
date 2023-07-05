import process from "process";
import axios from "axios";

import { Repository } from "./config";
import { PullRequest } from "./changelog";
import { getListOfUniquePackages } from "./utils";

export interface GithubCommitsInPull {
  "sha": string;
}

export interface GithubPullBySHA {
  "url": string,
  "id": string,
  "number": number,
}

export interface GithubPullRequest {
  "url": string,
  "id": number,
  "number": number,
  "state": string,
  "title": string,
  "user": {
    "login": string,
    "html_url": string,
    "type": string,
    "site_admin": boolean
  },
  "body": string | null,
  "labels": Array<{
    "id": number,
    "url": string,
    "name": string,
    "description": string,
    "color": string,
  }>,
  "merged": boolean,
  "merge_commit_sha": string
}


export class Github {
  constructor(private readonly token: string, private readonly repository: Repository) {
  }

  public get pulls() {
    return {
      commits: (id: string | number) => {
        return this.request<GithubCommitsInPull[]>(`https://api.github.com/repos/${this.repository}/pulls/${id}/commits`);
      },
      byId: (id: string | number) => {
        return this.request<GithubPullRequest>(`https://api.github.com/repos/${this.repository}/pulls/${id}`);
      },
      bySha: async (hash: string) => {
        return (await this.request<GithubPullBySHA[]>(`https://api.github.com/repos/${this.repository}/commits/${hash}/pulls`))[0];
      },
      all: async (hashes: string[]) => {
        return (await Promise.all(hashes.map(async (hash) => {
          const raw = await this.pulls.bySha(hash);
          let api_pull = await this.pulls.byId(raw.number);
          if (api_pull.merged) {
            const pull: PullRequest = { ...api_pull, packages: [] };
            const packages = getListOfUniquePackages(hash);
            packages.length !== 0 ? pull["packages"] = packages : pull["packages"] = [];
            return pull;
          }
          return undefined;
        }))).flat(2).filter(Boolean) as PullRequest[];
      },
    };
  }


  private async request<T>(url: string) {
    try {
      const { data } = await axios<T>(url, { headers: { Authorization: `Bearer ${this.token}` } });

      return data as T;
    } catch (e) {
      console.log(`[Changelog]: Request error was occurred: `, e);
      process.exit();
    }
  }
}