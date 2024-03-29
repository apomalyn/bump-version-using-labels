export default interface GithubGetContentPayload {
  type: string;

  encoding: string;

  size: number;

  name: string;

  path: string;

  content: string;

  sha: string;

  url: string;

  git_url: string;

  html_url: string;

  download_url: string;
}
