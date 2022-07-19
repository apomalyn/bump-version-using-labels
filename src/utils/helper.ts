import * as YAML from 'yaml';
import * as github from '@actions/github';
import { GitHub } from '@actions/github/lib/utils';
import { writeFileSync } from 'fs';

export function getOctokitAuth(): InstanceType<typeof GitHub> {
  const githubToken: string | undefined = process.env['GITHUB_TOKEN'];
  if (githubToken === undefined) {
    throw new Error(
      `GITHUB_TOKEN not available in the environment. Please specify it under the env section.`
    );
  }

  return github.getOctokit(githubToken);
}

/**
 * Write the file content in the file specified.
 * Throw an error if the file is something else than a JSON or YAML file.
 */
export function writeFile(
  file_path: string,
  file_content: Object,
  json_spacing = 2
): void {
  let content: string;
  if (file_path.endsWith('.json')) {
    content = JSON.stringify(file_content, undefined, json_spacing);
  } else if (file_path.endsWith('.yaml') || file_path.endsWith('.yml')) {
    content = YAML.stringify(file_content);
  } else {
    throw new Error(`${file_path} should be a YAML or JSON file.`);
  }
  writeFileSync(file_path, content);
}
