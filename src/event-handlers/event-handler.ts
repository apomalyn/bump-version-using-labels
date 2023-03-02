import { PullRequestEvent } from '@octokit/webhooks-definitions/schema';
import { EventType } from '@models/event-type';
import { ISettings } from '@models/settings';
import { SemanticVersion } from '@models/semantic-version';
import GithubService from '@services/github-service';
import { WorkflowFails } from '@utils/errors';
import FileHandlerFactory from '@fileHandlers/file-handler-factory';
import * as core from '@actions/core';
import { NEW_TAG, OLD_TAG } from '@constants/messages';
import { IActionOutputs } from '@models/action-outputs';

export abstract class EventHandler {
  protected githubService = new GithubService();

  protected constructor(
    protected eventType: EventType,
    protected payload: PullRequestEvent,
    protected settings: ISettings
  ) {}

  abstract dispatch(): Promise<IActionOutputs>;

  /**
   * Commit the new version. This will only commit the file modified.
   * @param branch branch that will receive the commit
   * @param localVersion
   * @param referenceVersion
   */
  protected async commitVersion(
    branch: string,
    localVersion: SemanticVersion,
    referenceVersion: SemanticVersion
  ): Promise<void> {
    if (!this.settings.commit.need) {
      return;
    }

    const commitMessage = this.settings.commit.message
      .replace(OLD_TAG, localVersion.raw)
      .replace(NEW_TAG, referenceVersion.raw);

    await this.githubService.commitFile(
      this.settings.filePath,
      commitMessage,
      this.settings.commit.committer,
      branch
    );
  }

  /**
   * Retrieve the reference version following the settings of the action
   * (branch or tag)
   */
  protected async getReferenceVersion(): Promise<SemanticVersion | undefined> {
    if (!this.settings.useTag) {
      return this.getVersionFromBranch(this.settings.referenceBranch);
    }
    core.debug(`Retrieving reference version from tags`);
    return this.getVersionFromLastTag();
  }

  private async getVersionFromLastTag(): Promise<SemanticVersion | undefined> {
    try {
      const tagsList = await this.githubService.getRepoTags();

      if (tagsList.length === 0) {
        return;
      }

      return SemanticVersion.fromString(tagsList[0].name);
    } catch (e) {
      if (e instanceof Error) {
        throw new WorkflowFails(`Something went wrong. Stopping action.`);
      }
    }
  }

  /**
   * Retrieve the version associated with [look_for_key] in [file_path] on the
   * specified branch.
   */
  protected async getVersionFromBranch(
    branchName: string
  ): Promise<SemanticVersion | undefined> {
    try {
      const referenceFile = await this.githubService.getFileContentForBranch(
        this.settings.filePath,
        branchName
      );

      const handler = FileHandlerFactory.fromContent(
        referenceFile.name,
        Buffer.from(referenceFile.content, 'base64').toString('binary')
      );
      return SemanticVersion.fromString(handler.get(this.settings.lookForKey));
    } catch (e) {
      if (e instanceof ReferenceError) {
        throw new WorkflowFails(e.message);
      }
      return;
    }
  }
}
