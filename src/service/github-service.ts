import * as core from '@actions/core';
import * as github from '@actions/github';
import * as helper from '../helper';
// eslint-disable-next-line import/no-unresolved
import { Label, PullRequestEvent } from '@octokit/webhooks-definitions/schema';
import IGithubGetContentPayload from '../models/igithub-get-content-payload';
import ITagPayload from '../models/igithub-tag-payload';

export default class GithubService {
  private readonly _eventPayload: PullRequestEvent;
  private _octokit = helper.getOctokitAuth();

  constructor() {
    this._eventPayload = github.context.payload as PullRequestEvent;
  }

  get labels(): Label[] {
    return this._eventPayload.pull_request.labels;
  }

  /**
   * Create a comment on the pull request.
   */
  async createComment(message: string): Promise<void> {
    await this._octokit.rest.issues.createComment({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: this._eventPayload.pull_request.number,
      body: message
    });
  }

  /**
   * Retrieve content from a repository branch.
   * Can throw an ReferenceError if the branch or the file in the branch doesn't
   * exist.
   */
  async getFileContentForBranch(
    file_path: string,
    branch_name: string
  ): Promise<IGithubGetContentPayload> {
    const branch_exist = await this._octokit.rest.repos.getBranch({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      branch: branch_name
    });
    if (branch_exist.status !== 200) {
      throw new ReferenceError(`Reference branch ${branch_name} not found`);
    }
    core.debug(`Reference version will be searched in ${branch_name} branch`);

    const reference_file_response = await this._octokit.rest.repos.getContent({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      path: file_path,
      ref: branch_name
    });

    if (reference_file_response.status !== 200) {
      throw new ReferenceError(
        `File ${file_path} in branch ${branch_name} not found`
      );
    }

    return reference_file_response.data as IGithubGetContentPayload;
  }

  async getRepoTags(): Promise<ITagPayload[]> {
    const tags_list_response = await this._octokit.rest.repos.listTags({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo
    });

    if (tags_list_response.status !== 200) {
      core.debug(
        `Retrieving tag list failed, status code: ${tags_list_response.status}`
      );
      throw new Error(`No tags found on the repository`);
    }

    return tags_list_response.data as ITagPayload[];
  }
}
