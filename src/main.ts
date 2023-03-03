import * as core from '@actions/core';
import * as github from '@actions/github';
import { WorkflowFails } from '@utils/errors';
import { EventHandlerFactory } from '@eventHandlers/event-handler-factory';

async function run(): Promise<void> {
  try {
    const eventHandler = EventHandlerFactory.fromEvent(
      github.context.eventName,
      github.context.payload
    );

    const outputs = await eventHandler.handle();

    for (const [key, value] of Object.entries(outputs)) {
      core.setOutput(key, value);
    }
  } catch (e) {
    if (e instanceof WorkflowFails) {
      core.setFailed(e.message);
    } else if (e instanceof Error) {
      core.error(e.message);
    }
  }
}

void run();
