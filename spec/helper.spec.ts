import * as fs from 'fs';
import * as helper from '../src/utils/helper';
import { expect } from '@jest/globals';

describe('Helper', () => {
  const samples_dir = './spec/samples';
  const temp_dir = `${samples_dir}/temp`;

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
