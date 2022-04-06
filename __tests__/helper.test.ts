import {expect} from "@jest/globals";
import * as fs from 'fs';
import * as helper from '../src/helper';

const samples_dir = './__tests__/samples';
const good_samples_dir = `${samples_dir}/good`;

const file_prefix = 'look_for_';

let good_files: string[] = [];

beforeAll(() => {
  good_files = fs.readdirSync(good_samples_dir);
  for (const value of good_files) {
    const index: number = good_files.indexOf(value);
    good_files[index] = `${good_samples_dir}/${value}`;
  }
});

describe('LoadFile', () => {
  test('GOOD - Load files', () => {
    let file_exploded: string[];
    let looking_for: string;
    let result: Object;

    for (const file_path of good_files) {
      console.log(`Testing ${file_path}`);
      file_exploded = file_path.split(file_prefix);

      if (file_exploded.length < 1) {
        console.log(
          `${file_path} name not valid. Should follow: ${file_path}<TAG-TO-LOOK>.<EXTENSION>`
        );
        continue;
      }
      file_exploded = (file_exploded.pop() as string).split('.');
      file_exploded.pop();
      looking_for = file_exploded.join('.');

      // Testing if the looking for token exists
      result = helper.loadFile(file_path);
      expect(result[looking_for as keyof typeof result]).toBeDefined();
    }
  });
});
