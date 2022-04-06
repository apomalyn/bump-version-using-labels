import * as YAML from 'yaml';
import * as github from '@actions/github';
import {existsSync, readFileSync} from 'fs';
import {GitHub} from '@actions/github/lib/utils';

export function getOctokitAuth(): InstanceType<typeof GitHub> {
  const githubToken: string | undefined = process.env['GITHUB_TOKEN'];
  if (githubToken === undefined) {
    throw new Error(
      `GITHUB_TOKEN not available in the environment. Please specify it under the env section.`
    );
  }

  return github.getOctokit(githubToken);
}

// Load the JSON or YAML file located at file_path.
// Throw an error if the file doesn't exist, is not valid or is something else than a JSON or YAML file.
export function loadFile(file_path: string): Object {
  if (!existsSync(file_path)) {
    throw new Error(`${file_path} doesn't exists.`);
  }

  // Read the content of the file.
  const content = readFileSync(file_path, 'utf8');
  let loaded: Object;
  if (file_path.endsWith('.json')) {
    loaded = JSON.parse(content);
  } else if (file_path.endsWith('.yaml') || file_path.endsWith('.yml')) {
    loaded = YAML.parse(content);
  } else {
    throw new Error(`${file_path} should be a YAML or JSON file.`);
  }

  return loaded;
}
