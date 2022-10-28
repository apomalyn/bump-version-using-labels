import { FileHandler } from '@fileHandlers/file-handler';
import { FileType } from '@models/file-type';
import { NotFoundError } from '@utils/errors';

export default class PodspecHandler extends FileHandler {
  private static readonly QUOTATION_REGEX = '(?:"|\')';
  private static readonly SPACE_REGEX = '([\\s]*?)';
  private static readonly VALUE_REGEX = `(?<value>[^"'\\n]*)${PodspecHandler.QUOTATION_REGEX}$`;

  constructor(content: string) {
    super(content, FileType.PODSPEC);
  }

  get(key: string): string {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.searchKey(key).groups!.value;
  }

  set(key: string, value: string): void {
    const match = this.searchKey(key);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const originalValue = match.groups!.value;

    // Update the value in the original match
    const updated = match[0].replace(originalValue, value);

    // Inject the updated value
    this.content = this.content.replace(match[0], updated);
  }

  private buildRegex(key: string): RegExp {
    const regexEscapedkey = key.replace('.', '\\.');
    const regexp = `${regexEscapedkey}${PodspecHandler.SPACE_REGEX}=${PodspecHandler.SPACE_REGEX}${PodspecHandler.QUOTATION_REGEX}${PodspecHandler.VALUE_REGEX}`;

    return new RegExp(regexp, 'm');
  }

  /**
   * Search the key passed in the document and return the RegExpMatch
   * This RegExpMatch contains one group called 'value' which is the value of the
   * key passed.
   */
  private searchKey(key: string): RegExpMatchArray {
    const regex = this.buildRegex(key);

    const match = this.content.match(regex);

    if (match === null) {
      throw new NotFoundError(`${key} wasn't found.`);
    }

    return match;
  }
}
