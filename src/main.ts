import * as core from '@actions/core';
import * as github from '@actions/github';
import * as helper from './helper';
import {SemanticVersion} from './models/SemanticVersion';
import {wait} from './wait';

async function run(): Promise<void> {
  if (github.context.eventName !== 'pull_request') {
    core.setFailed(
      "Event isn't a pull request. This action can only work on pull request."
    );
  }
  try {
    const patch_label: string = core.getInput('patch_label');
    const minor_label: string = core.getInput('minor_label');
    const major_label: string = core.getInput('major_label');
    const look_for: string = core.getInput('look_for_tag');
    const file_path: string = core.getInput('file_path');

    if (file_path === '') {
      core.setFailed(`file_path need to be specified.`);
    }

    const content = helper.loadFile(file_path);
    const version_raw = content[look_for as keyof typeof content].toString();

    if (version_raw === undefined) {
      core.setFailed(`Tag ${look_for} not found in ${file_path}`);
    }
    core.debug(`File loaded and raw version found: ${version_raw}`);

    const version = SemanticVersion.fromString(version_raw);
    core.debug(`Raw version parsed to ${version.raw}`);

    // TODO check which label is present on the PR.

    // TODO increment version

    // TODO Write to file

    // TODO check if need comment ==> comment

    // TODO check if need commit => commit

    core.setOutput('time', new Date().toTimeString());
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
