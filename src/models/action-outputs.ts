export interface IActionOutputs {
  [ActionOutputs.version]: string;
  [ActionOutputs.hasChanged]: boolean;
}

export enum ActionOutputs {
  version = 'version',
  hasChanged = 'has_changed'
}
