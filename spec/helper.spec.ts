import * as fs from 'fs';
import * as helper from '../src/utils/helper';
import { expect } from '@jest/globals';

describe('Helper', () => {
  const samples_dir = './spec/samples';
  const good_samples_dir = `${samples_dir}/good`;
  const temp_dir = `${samples_dir}/temp`;

  const file_prefix = 'look_for_';

  let good_files: string[] = [];

  beforeAll(() => {
    good_files = fs.readdirSync(good_samples_dir);
    for (const value of good_files) {
      const index: number = good_files.indexOf(value);
      good_files[index] = `${good_samples_dir}/${value}`;
    }
  });

  describe('loadFile', () => {
    test('Should load JSON and YAML files when the key exists', () => {
      let file_exploded: string[];
      let looking_for: string;
      let result: Object;

      for (const file_path of good_files) {
        // eslint-disable-next-line no-console
        console.log(`Testing ${file_path}`);
        file_exploded = file_path.split(file_prefix);

        if (file_exploded.length < 1) {
          // eslint-disable-next-line no-console
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

    test("Should fail if the file doesn't exists", () => {
      expect(() => helper.loadFile('dummy')).toThrow(Error);
    });
  });

  describe('writeFile', () => {
    beforeEach(() => {
      fs.mkdirSync(temp_dir);
    });

    afterEach(() => {
      fs.rmSync(temp_dir, { recursive: true, force: true });
    });

    test('Should overwrite the file', () => {
      // Prepare the file
      const file_path = `${temp_dir}/test.json`;
      fs.writeFileSync(file_path, '{"version": "1.0.0"}');

      const override_content = { version: '2.0.0' };

      helper.writeFile(file_path, override_content);

      expect(JSON.parse(fs.readFileSync(file_path, 'utf8'))).toStrictEqual(
        override_content
      );
    });

    test("Should create the file if don't exists", () => {
      const content = { version: '2.0.0' };
      const file_path = `${temp_dir}/test.json`;

      expect(fs.existsSync(file_path)).toBeFalsy();

      helper.writeFile(file_path, content);

      expect(fs.existsSync(file_path)).toBeTruthy();
      expect(JSON.parse(fs.readFileSync(file_path, 'utf8'))).toStrictEqual(
        content
      );
    });

    test("Should fail if the file isn't JSON or YAML", () => {
      expect(() => helper.writeFile('dummy.dummy', {})).toThrow(Error);
    });
  });
});
