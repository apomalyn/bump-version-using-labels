export interface ISettings {
  labels: ILabels;
  // Key in the file that contains the version.
  lookForKey: string;
  // Path to the file that contains the version.
  filePath: string;
  useTag: boolean;
  referenceBranch: string;
  comment: ICommentSettings;
  commit: ICommitSettings;
}

interface ILabels {
  patch: string;
  minor: string;
  major: string;
}

interface ICommentSettings {
  // True if the action should comment
  comment: boolean;
  message: string;
}

interface ICommitSettings {
  // True if the action should commit
  commit: boolean;
  message: string;
  username: string;
  email: string;
}
