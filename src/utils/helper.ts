import * as github from '@actions/github';
import { GitHub } from '@actions/github/lib/utils';

export function getOctokitAuth(): InstanceType<typeof GitHub> {
  const githubToken: string | undefined = process.env['GITHUB_TOKEN'];
  if (githubToken === undefined) {
    throw new Error(
      `GITHUB_TOKEN not available in the environment. Please specify it under the env section.`
    );
  }

  return github.getOctokit(githubToken);
}
