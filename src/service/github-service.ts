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
      throw new Error(`No tags found on the repository`);
    }

    return tags_list_response.data as ITagPayload[];
  }

  async commitFile(
    file_path: string,
    commit_message: string,
    committer: { name: string; email: string },
    author?: { name: string; email: string },
    branch_name?: string | undefined
  ): Promise<void> {
    const file_content = helper.loadFile(file_path, false) as string;
    core.debug('Start commit process');
    const blob = await this._octokit.rest.git.createBlob({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      content: file_content,
      encoding: 'utf8'
    });
    core.debug(`Blob with file ${file_path} created`);
    const current_commit_sha = this._eventPayload.pull_request.head.sha;
    core.debug(`Last commit sha: ${current_commit_sha}`);
    const tree = await this._octokit.rest.git.createTree({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      tree: [
        {
          path: file_path,
          mode: `100644`,
          type: `blob`,
          sha: blob.data.sha
        }
      ],
      base_tree: await this.getTreeShaForCommit(current_commit_sha)
    });
    core.debug(`New tree created`);

    if (author === undefined) {
      author = {
        name: github.context.actor,
        email: `${github.context.actor}@users.noreply.github.com>`
      };
    }

    const commit = await this._octokit.rest.git.createCommit({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      message: commit_message,
      tree: tree.data.sha,
      parents: [current_commit_sha],
      committer,
      author
    });
    core.debug(`New commit created, sha: ${commit.data.sha}`);

    await this._octokit.rest.git.updateRef({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      ref: `heads/${branch_name ?? this._eventPayload.pull_request.head.ref}`,
      sha: commit.data.sha
    });
    core.debug(`Commit pushed!`);
  }

  async getTreeShaForCommit(sha: string): Promise<string> {
    const { data: commit_data } = await this._octokit.rest.git.getCommit({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      commit_sha: sha
    });

    return commit_data.tree.sha;
  }
}
