export interface IActionOutputs {
  version: string;
  hasChanged: boolean;
}

export enum ActionOutputs {
  version = 'version',
  hasChanged = 'has_changed'
}
