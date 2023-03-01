import * as core from '@actions/core';
import * as github from '@actions/github';
import FileHandlerFactory from '@fileHandlers/file-handler-factory';
import GithubService from './services/github-service';
import { NotFoundError } from '@utils/errors';
import { SemanticVersion } from '@models/semantic-version';
import { VersionType } from '@models/version-type';
import { getSettings } from '@utils/helper';
import { PullRequestEvent } from '@octokit/webhooks-definitions/schema';

const OLD_TAG = '{old}';
const NEW_TAG = '{new}';

const github_service = new GithubService();

async function run(): Promise<void> {
  if (github.context.eventName !== 'pull_request') {
    core.setFailed(
      "Event isn't a pull request. This action can only work on pull request."
    );
    return;
  }
  const payload = (github.context.payload as PullRequestEvent).pull_request;
  const settings = getSettings();
  const labels = Object.values(settings.labels);

  try {
    core.debug('Start action');

    if (settings.filePath === '') {
      core.setFailed(`file_path need to be specified.`);
      return;
    }

    const handler = FileHandlerFactory.fromFile(settings.filePath);
    const local_version = SemanticVersion.fromString(
      handler.get(settings.lookForKey)
    );

    core.debug(`Local raw version parsed to ${local_version.raw}`);

    let reference_version = await getReferenceVersion(
      settings.filePath,
      settings.lookForKey
    );

    // Retrieving the reference version failed
    if (reference_version === undefined) {
      core.info(`Reference version not found, will use the local one`);
      reference_version = local_version;
    }

    let increased = false;
    let message = `There is no version labels on the PR. 
    Please use one of the following: ${labels.join(',')}`;

    core.debug('Start label search');
    for (const label of payload.labels) {
      const index = labels.indexOf(label.name);

      if (index !== -1) {
        if (increased) {
          message = `There are multiple version labels on the PR. Please use only one.`;
          core.setFailed(message);
          if (settings.comment) {
            await github_service.createComment(payload.number, message);
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
      if (settings.comment) {
        await github_service.createComment(payload.number, message);
      }
      return;
    }

    if (reference_version.raw === local_version.raw) {
      core.info(`Version already updated. Skipping.`);
    } else {
      handler.set(settings.lookForKey, reference_version.raw);
      handler.saveToFile(settings.filePath);

      if (settings.comment) {
        await github_service.commitFile(
          settings.filePath,
          settings.comment.message
            .replace(OLD_TAG, local_version.raw)
            .replace(NEW_TAG, reference_version.raw),
          {
            name: core.getInput('commit_user_name'),
            email: core.getInput('commit_user_email')
          },
          payload.head.ref
        );
        if (settings.comment) {
          await github_service.createComment(
            payload.number,
            settings.comment.message
              .replace(OLD_TAG, local_version.raw)
              .replace(NEW_TAG, reference_version.raw)
          );
        }
      }
    }

    core.setOutput('version', reference_version.raw);
    core.setOutput('has_changed', increased);
  } catch (error) {
    if (error instanceof NotFoundError)
      core.setFailed(
        `Tag ${settings.lookForKey} not found in ${settings.filePath}`
      );
    else if (error instanceof Error) core.setFailed(error);
  }
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

    const handler = FileHandlerFactory.fromContent(
      reference_file.name,
      Buffer.from(reference_file.content, 'base64').toString('binary')
    );
    return SemanticVersion.fromString(handler.get(look_for_key));
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

void run();
