export class NotFoundError extends Error {}

export class WorkflowFails extends Error {
  constructor(message: string, readonly comment = false) {
    super(message);
  }
}
