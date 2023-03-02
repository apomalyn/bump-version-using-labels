import { EventHandler } from './event-handler';
import { FileHandler } from '@fileHandlers/file-handler';
import { EventType } from '@models/event-type';
import {
  PullRequest,
  PullRequestEvent
} from '@octokit/webhooks-definitions/schema';
import { ISettings } from '@models/settings';
import FileHandlerFactory from '@fileHandlers/file-handler-factory';
import { SemanticVersion } from '@models/semantic-version';
import * as core from '@actions/core';
import { Messages, NEW_TAG, OLD_TAG } from '@constants/messages';
import { VersionType } from '@models/version-type';
import { WorkflowFails } from '@utils/errors';
import { ActionOutputs, IActionOutputs } from '@models/action-outputs';

export default class PullRequestHandler extends EventHandler {
  private pullRequest: PullRequest;

  private fileHandler: FileHandler;

  constructor(payload: PullRequestEvent, settings: ISettings) {
    super(EventType.PullRequest, payload, settings);
    this.pullRequest = payload.pull_request;
    this.fileHandler = FileHandlerFactory.fromFile(settings.filePath);
  }

  async handle(): Promise<IActionOutputs> {
    try {
      return super.handle();
    } catch (e) {
      if (e instanceof WorkflowFails && e.comment) {
        await this.commentPullRequest(e.message);
      }
      throw e;
    }
  }

  protected async process(): Promise<IActionOutputs> {
    core.debug(
      Messages.eventDetected(EventType.PullRequest) + Messages.startProcessing
    );
    const labels = Object.values(this.settings.labels) as string[];
    const localVersion = SemanticVersion.fromString(
      this.fileHandler.get(this.settings.lookForKey)
    );

    core.debug(Messages.localVersionParsed(localVersion.raw));

    let referenceVersion = await this.getReferenceVersion();

    // Retrieving the reference version failed
    if (referenceVersion === undefined) {
      core.info(Messages.referenceVersionNotFound);
      referenceVersion = localVersion;
    } else {
      core.debug(Messages.referenceVersionParsed(referenceVersion.raw));
    }

    let increased = false;

    core.debug(Messages.startLabelSearch);
    for (const label of this.pullRequest.labels) {
      const index = labels.indexOf(label.name);

      if (index !== -1) {
        if (increased) {
          throw new WorkflowFails(
            Messages.multipleLabelsFound,
            this.settings.comment.need
          );
        }
        core.debug(Messages.labelFound(VersionType[index]));
        referenceVersion.increase(
          VersionType[VersionType[index] as keyof typeof VersionType]
        );
        increased = true;
      }
    }

    if (!increased) {
      throw new WorkflowFails(
        Messages.noLabelsFound(labels),
        this.settings.comment.need
      );
    }
    core.setOutput('version', referenceVersion.raw);
    core.setOutput('has_changed', increased);

    if (referenceVersion.raw === localVersion.raw) {
      core.info(Messages.versionAlreadyUpdated);
      return {
        [ActionOutputs.version]: referenceVersion.raw,
        [ActionOutputs.hasChanged]: false
      };
    }

    await this.commitVersion(
      this.pullRequest.head.ref,
      localVersion,
      referenceVersion
    );
    await this.commentPullRequest(
      this.settings.comment.message
        .replace(OLD_TAG, localVersion.raw)
        .replace(NEW_TAG, referenceVersion.raw)
    );

    return {
      [ActionOutputs.version]: referenceVersion.raw,
      [ActionOutputs.hasChanged]: true
    };
  }

  private async commentPullRequest(message: string): Promise<void> {
    if (!this.settings.comment.need) {
      return;
    }
    await this.githubService.createComment(this.pullRequest.number, message);
  }
}
