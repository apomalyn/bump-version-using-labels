import { EventType } from '@models/event-type';
import PullRequestHandler from './pull-request-handler';
import { PullRequestEvent } from '@octokit/webhooks-definitions/schema';
import { EventHandler } from './event-handler';
import { WebhookPayload } from '@actions/github/lib/interfaces';
import { getSettings } from '@utils/helper';
import { Messages } from '@constants/messages';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class EventHandlerFactory {
  static fromEvent(eventName: string, payload: WebhookPayload): EventHandler {
    const settings = getSettings();
    switch (eventName) {
      case EventType.PullRequest:
        return new PullRequestHandler(payload as PullRequestEvent, settings);
      case EventType.Push:
      default:
        throw new TypeError(Messages.eventNotSupported(eventName));
    }
  }
}
