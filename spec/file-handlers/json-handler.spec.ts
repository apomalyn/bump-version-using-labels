import FileHandlerFactory from '@fileHandlers/file-handler-factory';
import JsonHandler from '@fileHandlers/json-handler';
import { NotFoundError } from '@utils/not-found-error';

const samplesDir = './spec/samples';

const rootToken = 'token';
const nestedToken = 'nested.token';
const doubleNestedToken = 'double.nested.token';
const invalidToken = 'notFound';

describe('JsonHandler', () => {
  describe('factory constructor', () => {
    it('should create a JsonHandler instance', () => {
      const instance = FileHandlerFactory.fromFile(`${samplesDir}/sample.json`);

      expect(instance).toBeInstanceOf(JsonHandler);
    });

    it("should throw an exception when the file doesn't exists.", () => {
      expect(() =>
        FileHandlerFactory.fromFile(`${samplesDir}/not_found.json`)
      ).toThrow(Error);
    });
  });

  describe('get', () => {
    it('should retrieve the value when the token is at the root of the document', () => {
      const instance = buildJsonHandler();

      expect(instance.get(rootToken)).toBe('1.0.0');
    });

    it('should retrieve the value when the token is nested in the document', () => {
      const instance = buildJsonHandler();

      expect(instance.get(nestedToken)).toBe('2.0.0-q');
    });

    it('should retrieve the value when the token is double nested in the document', () => {
      const instance = buildJsonHandler();

      expect(instance.get(doubleNestedToken)).toBe('3.0.0+1');
    });

    it('should retrieve the value when the token is double nested in the document', () => {
      const instance = buildJsonHandler();

      expect(() => instance.get(invalidToken)).toThrow(NotFoundError);
    });
  });

  describe('set', () => {
    const sampleContent =
      '{\n' +
      '  "name": "dummy",\n' +
      '  "token": "1.0.0",\n' +
      '  "private": true,\n' +
      '  "description": "Dummy template",\n' +
      '  "main": "lib/main.js",\n' +
      '  "double": {\n' +
      '    "nested": {\n' +
      '      "token": "2.0.0"\n' +
      '    },\n' +
      '  },\n' +
      '  "nested": {\n' +
      '    "token": "3.0.0"\n' +
      '  },\n' +
      '}';

    const updatedValue = '10.0.0';

    it('should change the value when the token is at the root of the document', () => {
      const instance = buildJsonHandler(sampleContent);
      const updateSampleContent =
        '{\n' +
        '  "name": "dummy",\n' +
        '  "token": "10.0.0",\n' +
        '  "private": true,\n' +
        '  "description": "Dummy template",\n' +
        '  "main": "lib/main.js",\n' +
        '  "double": {\n' +
        '    "nested": {\n' +
        '      "token": "2.0.0"\n' +
        '    },\n' +
        '  },\n' +
        '  "nested": {\n' +
        '    "token": "3.0.0"\n' +
        '  },\n' +
        '}';

      instance.set(rootToken, updatedValue);
      expect(instance.getContent()).toBe(updateSampleContent);
    });

    it('should change the value when the token is nested in the document', () => {
      const instance = buildJsonHandler(sampleContent);
      const updateSampleContent =
        '{\n' +
        '  "name": "dummy",\n' +
        '  "token": "1.0.0",\n' +
        '  "private": true,\n' +
        '  "description": "Dummy template",\n' +
        '  "main": "lib/main.js",\n' +
        '  "double": {\n' +
        '    "nested": {\n' +
        '      "token": "2.0.0"\n' +
        '    },\n' +
        '  },\n' +
        '  "nested": {\n' +
        '    "token": "10.0.0"\n' +
        '  },\n' +
        '}';

      instance.set(nestedToken, updatedValue);
      expect(instance.getContent()).toBe(updateSampleContent);
    });

    it('should change the value when the token is double nested in the document', () => {
      const instance = buildJsonHandler(sampleContent);
      const updateSampleContent =
        '{\n' +
        '  "name": "dummy",\n' +
        '  "token": "1.0.0",\n' +
        '  "private": true,\n' +
        '  "description": "Dummy template",\n' +
        '  "main": "lib/main.js",\n' +
        '  "double": {\n' +
        '    "nested": {\n' +
        '      "token": "10.0.0"\n' +
        '    },\n' +
        '  },\n' +
        '  "nested": {\n' +
        '    "token": "3.0.0"\n' +
        '  },\n' +
        '}';

      instance.set(doubleNestedToken, updatedValue);
      expect(instance.getContent()).toBe(updateSampleContent);
    });

    it('should change the value when the token is double nested in the document', () => {
      const instance = buildJsonHandler(sampleContent);

      expect(() => instance.set(invalidToken, updatedValue)).toThrow(
        NotFoundError
      );
    });
  });
});

function buildJsonHandler(
  content: string | undefined = undefined
): JsonHandler {
  if (content === undefined) {
    return FileHandlerFactory.fromFile(
      `${samplesDir}/sample.json`
    ) as JsonHandler;
  }
  return new JsonHandler(content);
}
