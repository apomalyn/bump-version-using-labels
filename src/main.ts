import * as core from '@actions/core';
import * as github from '@actions/github';
import * as helper from './helper';
import GithubService from './service/github-service';
import { SemanticVersion } from './models/semantic-version';
import { VersionType } from './models/version-type';
import { writeFile } from './helper';

const github_service = new GithubService();

const OLD_TAG = '{old}';
const NEW_TAG = '{new}';

async function run(): Promise<void> {
  if (github.context.eventName !== 'pull_request') {
    core.setFailed(
      "Event isn't a pull request. This action can only work on pull request."
    );
    return;
  }
  try {
    const comment_pr = core.getBooleanInput('comment');
    const labels = [
      core.getInput('patch_label'),
      core.getInput('minor_label'),
      core.getInput('major_label')
    ];
    const look_for: string = core.getInput('look_for_tag');
    const file_path: string = core.getInput('file_path');

    if (file_path === '') {
      core.setFailed(`file_path need to be specified.`);
      return;
    }

    const content = helper.loadFile(file_path);
    const version = getVersionFromFile(content, look_for);

    if (version === undefined) {
      core.setFailed(`Tag ${look_for} not found in ${file_path}`);
      return;
    }
    core.debug(`Raw version parsed to ${version.raw}`);

    let reference_version = await getReferenceVersion(file_path, look_for);

    // Retrieving the reference version failed
    if (reference_version === undefined) {
      core.info(`Reference version not found, will use the local one`);
      reference_version = version;
    }

    let increased = false;
    let message = `There is no version labels on the PR. 
    Please use one of the following: ${labels}`;

    core.debug('Start label search');
    for (const label of github_service.labels) {
      const index = labels.indexOf(label.name);

      if (index !== -1) {
        if (increased) {
          message = `There are multiple version labels on the PR. Please use only one.`;
          core.setFailed(message);
          if (comment_pr) {
            await github_service.createComment(message);
          }
          return;
        }
        core.debug(`Version label found, increasing ${VersionType[index]}`);
        reference_version.increase(
          VersionType[VersionType[index] as keyof typeof VersionType]
        );
        increased = true;
      }
    }

    if (!increased) {
      core.setFailed(message);
      if (comment_pr) {
        await github_service.createComment(message);
      }
      return;
    }

    Object.defineProperty(content, look_for, {
      value: reference_version.raw
    });

    writeFile(file_path, content);

    if (comment_pr) {
      await github_service.createComment(
        core
          .getInput('comment_message')
          .replace(OLD_TAG, version.raw)
          .replace(NEW_TAG, reference_version.raw)
      );
    }

    // TODO check if need commit => commit

    core.setOutput('version', reference_version.raw);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

function getVersionFromFile(
  content: Object,
  key: string
): SemanticVersion | undefined {
  const version_raw = content[key as keyof typeof content].toString();

  if (version_raw === undefined) {
    return;
  }
  core.debug(`File loaded and raw version found: ${version_raw}`);

  return SemanticVersion.fromString(version_raw);
}

async function getReferenceVersion(
  file_path: string,
  look_for_key: string
): Promise<SemanticVersion | undefined> {
  const use_tag_as_ref: boolean = core.getBooleanInput('use_tag_as_ref');

  if (!use_tag_as_ref) {
    const branch_name: string = core.getInput('reference_branch');
    return getRefVersionFromBranch(branch_name, file_path, look_for_key);
  } else {
    core.debug(`Retrieving reference version from tags`);
    return getRefVersionFromTag();
  }
}

/**
 * Retrieve the version associated with [look_for_key] in [file_path] on the
 * specified branch.
 */
async function getRefVersionFromBranch(
  branch_name: string,
  file_path: string,
  look_for_key: string
): Promise<SemanticVersion | undefined> {
  try {
    const reference_file = await github_service.getFileContentForBranch(
      file_path,
      branch_name
    );

    const content: Object = helper.parseFile(
      reference_file.name,
      Buffer.from(reference_file.content, 'base64').toString('binary')
    );

    return getVersionFromFile(content, look_for_key);
  } catch (e) {
    if (e instanceof ReferenceError) {
      core.setFailed(e.message);
    }
    return;
  }
}

/**
 * Retrieve the version from the latest tag published
 */
async function getRefVersionFromTag(): Promise<SemanticVersion | undefined> {
  try {
    const tags_list = await github_service.getRepoTags();

    if (tags_list.length === 0) {
      return;
    }

    return SemanticVersion.fromString(tags_list[0].name);
  } catch (e) {
    if (e instanceof Error) {
      core.setFailed(`No tags found on the repository`);
      throw e;
    }
  }
}

run();
