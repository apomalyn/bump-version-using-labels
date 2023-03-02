import { EventType } from '@models/event-type';

export const Messages = {
  eventNotSupported: (eventName: string) =>
    `Trigger ${eventName} isn't supported. Please refer to the documentation to adjust your workflow.`,
  eventDetected: (event: EventType) => `Event detected: ${event}.`,
  startProcessing: 'Start processing event.',
  noLabelsFound: (labels: string[]) =>
    `There is no version labels on the PR.\nPlease use one of the following: ${labels.join(
      ', '
    )}`,
  startLabelSearch: 'Searching for a version increase label...',
  multipleLabelsFound:
    'There are multiple version labels on the PR. Please use only one.',
  labelFound: (increasing: string) =>
    `Version label found, increasing ${increasing}.`,
  versionAlreadyUpdated: 'Version already updated. Skipping.',
  localVersionParsed: (rawVersion: string) =>
    `Local version parsed to ${rawVersion}.`,
  referenceVersionParsed: (rawVersion: string) =>
    `Reference version parsed to ${rawVersion}.`,
  referenceVersionNotFound:
    'Reference version not found, will use the local one.',
  keyNotFound: (key: string, filePath: string) =>
    `Tag ${key} not found in ${filePath}`
};

export const OLD_TAG = '{old}';
export const NEW_TAG = '{new}';
