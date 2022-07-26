import FileHandlerFactory from '@fileHandlers/file-handler-factory';
import { NotFoundError } from '@utils/not-found-error';
import YamlHandler from '@fileHandlers/yaml-handler';

const samplesDir = './spec/samples';
const goodSamplesDir = `${samplesDir}/good`;

const rootToken = 'token';
const nestedToken = 'nested.token';
const doubleNestedToken = 'double.nested.token';
const invalidToken = 'notFound';

describe('YamlHandler', () => {
  describe('factory constructor', () => {
    it('should create a YamlHandler instance', () => {
      const instance = FileHandlerFactory.fromFile(
        `${goodSamplesDir}/sample.yaml`
      );

      expect(instance).toBeInstanceOf(YamlHandler);
    });

    it("should throw an exception when the file doesn't exists.", () => {
      expect(() =>
        FileHandlerFactory.fromFile(`${goodSamplesDir}/not_found.yaml`)
      ).toThrow(Error);
    });
  });

  describe('get', () => {
    it('should retrieve the value when the token is at the root of the document', () => {
      const instance = buildYamlHandler();

      expect(instance.get(rootToken)).toBe('1.0.0');
    });

    it('should retrieve the value when the token is nested in the document', () => {
      const instance = buildYamlHandler();

      expect(instance.get(nestedToken)).toBe('2.0.0-q');
    });

    it('should retrieve the value when the token is double nested in the document', () => {
      const instance = buildYamlHandler();

      expect(instance.get(doubleNestedToken)).toBe('3.0.0+1');
    });

    it('should retrieve the value when the token is double nested in the document', () => {
      const instance = buildYamlHandler();

      expect(() => instance.get(invalidToken)).toThrow(NotFoundError);
    });
  });

  describe('set', () => {
    const sampleContent =
      'description: Dummy template\n' +
      'token: 1.0.0\n' +
      'double:\n' +
      '  nested:\n' +
      '    token: 2.0.0\n' +
      'main: lib/main.js\n' +
      'name: dummy\n' +
      'nested:\n' +
      '  token: 3.0.0\n' +
      'private: true\n';

    const updatedValue = '10.0.0';

    it('should change the value when the token is at the root of the document', () => {
      const instance = buildYamlHandler(sampleContent);
      const updateSampleContent =
        'description: Dummy template\n' +
        'token: 10.0.0\n' +
        'double:\n' +
        '  nested:\n' +
        '    token: 2.0.0\n' +
        'main: lib/main.js\n' +
        'name: dummy\n' +
        'nested:\n' +
        '  token: 3.0.0\n' +
        'private: true\n';

      instance.set(rootToken, updatedValue);
      expect(instance.getContent()).toBe(updateSampleContent);
    });

    it('should change the value when the token is nested in the document', () => {
      const instance = buildYamlHandler(sampleContent);
      const updateSampleContent =
        'description: Dummy template\n' +
        'token: .0.0\n' +
        'double:\n' +
        '  nested:\n' +
        '    token: 2.0.0\n' +
        'main: lib/main.js\n' +
        'name: dummy\n' +
        'nested:\n' +
        '  token: 10.0.0\n' +
        'private: true\n';

      instance.set(nestedToken, updatedValue);
      expect(instance.getContent()).toBe(updateSampleContent);
    });

    it('should change the value when the token is double nested in the document', () => {
      const instance = buildYamlHandler(sampleContent);
      const updateSampleContent =
        'description: Dummy template\n' +
        'token: 1.0.0\n' +
        'double:\n' +
        '  nested:\n' +
        '    token: 10.0.0\n' +
        'main: lib/main.js\n' +
        'name: dummy\n' +
        'nested:\n' +
        '  token: 3.0.0\n' +
        'private: true\n';

      instance.set(doubleNestedToken, updatedValue);
      expect(instance.getContent()).toBe(updateSampleContent);
    });

    it('should change the value when the token is double nested in the document', () => {
      const instance = buildYamlHandler(sampleContent);

      expect(() => instance.set(invalidToken, updatedValue)).toThrow(
        NotFoundError
      );
    });
  });
});

function buildYamlHandler(
  content: string | undefined = undefined
): YamlHandler {
  if (content === undefined) {
    return FileHandlerFactory.fromFile(
      `${goodSamplesDir}/sample.yaml`
    ) as YamlHandler;
  }
  return new YamlHandler(content);
}
