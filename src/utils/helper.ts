import * as github from '@actions/github';
import * as core from '@actions/core';
import { GitHub } from '@actions/github/lib/utils';
import { ISettings } from '@models/settings';

export function getOctokitAuth(): InstanceType<typeof GitHub> {
  const githubToken: string | undefined = process.env['GITHUB_TOKEN'];
  if (githubToken === undefined) {
    throw new Error(
      `GITHUB_TOKEN not available in the environment. Please specify it under the env section.`
    );
  }

  return github.getOctokit(githubToken);
}

export function getSettings(): ISettings {
  return {
    labels: {
      patch: core.getInput('patch_label'),
      minor: core.getInput('minor_label'),
      major: core.getInput('major_label')
    },
    comment: {
      comment: core.getBooleanInput('comment'),
      message: core.getInput('comment_message')
    },
    commit: {
      commit: core.getBooleanInput('commit'),
      message: core.getInput('commit_message'),
      username: core.getInput('commit_user_name'),
      email: core.getInput('commit_user_email')
    },
    filePath: core.getInput('file_path'),
    lookForKey: core.getInput('look_for_key'),
    referenceBranch: core.getInput('reference_branch'),
    useTag: core.getBooleanInput('use_tag_as_ref')
  };
}
