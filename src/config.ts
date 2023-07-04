type BaseArgv = {
  to: string
  from: string
  "next-version": string
  "commits-marker": string
  "contributors-marker": string
}

type Pkg = {
  repo?: { url: string }
  repository: { url: string }
  labels?: Record<string, string>
}

export class ConfigFactory {
  public static build(argv: BaseArgv, pkg: Pkg, token: string) {}
}