import * as core from '@actions/core';
import * as github from '@actions/github';
import * as helper from '../utils/helper';
import { existsSync, readFileSync } from 'fs';
import GithubGetContentPayload from '@models/github-get-content-payload';
import ITagPayload from '@models/github-tag-payload';

export default class GithubService {
  private octokit = helper.getOctokitAuth();

  /**
   * Create a comment on the pull request.
   */
  async createComment(issueNumber: number, message: string): Promise<void> {
    await this.octokit.rest.issues.createComment({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: issueNumber,
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
  ): Promise<GithubGetContentPayload> {
    const branch_exist = await this.octokit.rest.repos.getBranch({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      branch: branch_name
    });
    if (branch_exist.status !== 200) {
      throw new ReferenceError(`Reference branch ${branch_name} not found`);
    }
    core.debug(`Reference version will be searched in ${branch_name} branch`);

    const reference_file_response = await this.octokit.rest.repos.getContent({
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

    return reference_file_response.data as GithubGetContentPayload;
  }

  async getRepoTags(): Promise<ITagPayload[]> {
    const tags_list_response = await this.octokit.rest.repos.listTags({
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
    branch_name: string,
    author?: { name: string; email: string }
  ): Promise<void> {
    if (!existsSync(file_path)) {
      throw new Error(`${file_path} doesn't exists.`);
    }

    const file_content = readFileSync(file_path, 'utf8');
    core.info('Start commit process');
    const blob = await this.octokit.rest.git.createBlob({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      content: file_content,
      encoding: 'utf8'
    });

    const current_commit = (
      (await this.octokit.request(
        `GET /repos/${github.context.repo.owner}/${github.context.repo.repo}/commits/${branch_name}`
      )) as { data: { sha: string } }
    ).data;

    core.debug(`Last commit: ${current_commit.sha}`);
    const tree = await this.octokit.rest.git.createTree({
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
      base_tree: await this.getTreeShaForCommit(current_commit.sha)
    });

    if (author === undefined) {
      author = {
        name: github.context.actor,
        email: `${github.context.actor}@users.noreply.github.com`
      };
    }

    const commit = await this.octokit.rest.git.createCommit({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      message: commit_message,
      tree: tree.data.sha,
      parents: [current_commit.sha],
      committer,
      author
    });
    core.debug(`New commit created, sha: ${commit.data.sha}`);

    await this.octokit.rest.git.updateRef({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      ref: `heads/${branch_name}`,
      sha: commit.data.sha
    });
    core.info(`Commit pushed! (sha: ${commit.data.sha})`);
  }

  async getTreeShaForCommit(sha: string): Promise<string> {
    const { data: commit_data } = await this.octokit.rest.git.getCommit({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      commit_sha: sha
    });

    return commit_data.tree.sha;
  }
}
