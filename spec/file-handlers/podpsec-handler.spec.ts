import FileHandlerFactory from '@fileHandlers/file-handler-factory';
import { NotFoundError } from '@utils/errors';
import PodspecHandler from '@fileHandlers/podspec-handler';

const samplesDir = './spec/samples';

const token = 'spec.version';
const spacedToken = 'spec.version_spaced';
const noSpaceToken = 'spec.version_no_space';
const multipleToken = 'spec.multiple.key.version';
const multipleLinesToken = 'spec.different.lines.version';
const invalidToken = 'wrong.version';

describe('PodspecHandler', () => {
  describe('factory constructor', () => {
    it('should create a PodspecHandler instance', () => {
      const instance = FileHandlerFactory.fromFile(
        `${samplesDir}/sample.podspec`
      );

      expect(instance).toBeInstanceOf(PodspecHandler);
    });

    it("should throw an exception when the file doesn't exists.", () => {
      expect(() =>
        FileHandlerFactory.fromFile(`${samplesDir}/not_found.podspec`)
      ).toThrow(Error);
    });
  });

  describe('get', () => {
    it('should retrieve the value when the token and value are separated by one space', () => {
      const instance = buildPodspecHandler();

      expect(instance.get(token)).toBe('1.0.0');
    });

    it('should retrieve the value when the token and value are separated by multiple spaces', () => {
      const instance = buildPodspecHandler();

      expect(instance.get(spacedToken)).toBe('2.0.0-q');
    });

    it('should retrieve the value when the token is composed of dot e.g. spec.test.version', () => {
      const instance = buildPodspecHandler();

      expect(instance.get(multipleToken)).toBe('3.0.0+1');
    });

    it('should retrieve the value when the token and value are not separated by spaces', () => {
      const instance = buildPodspecHandler();

      expect(instance.get(noSpaceToken)).toBe('4.0.0-q');
    });

    it('should retrieve the value when the token and value are separated by multiple spaces and lines', () => {
      const instance = buildPodspecHandler();

      expect(instance.get(multipleLinesToken)).toBe('5.0.0');
    });

    it('should not retrieve the value when the token is not in the document', () => {
      const instance = buildPodspecHandler();

      expect(() => instance.get(invalidToken)).toThrow(NotFoundError);
    });
  });
});

function buildPodspecHandler(
  content: string | undefined = undefined
): PodspecHandler {
  if (content === undefined) {
    return FileHandlerFactory.fromFile(
      `${samplesDir}/sample.podspec`
    ) as PodspecHandler;
  }
  return new PodspecHandler(content);
}
