import { FileHandler } from '@fileHandlers/file-handler';
import { FileType } from '@models/file-type';
import { NotFoundError } from '@utils/errors';

export default class YamlHandler extends FileHandler {
  private static readonly QUOTATION_REGEX = '(?:"|\')?';
  private static readonly COLON_REGEX = '(?::\\s)';
  private static readonly VALUE_REGEX = `(?<value>[^"'\\n]*)(?:"|')?$`;
  private static readonly EVERYTHING_REGEX = `([\\S\\s]*?)`;

  constructor(content: string) {
    super(content, FileType.YAML);
  }

  private static buildRegex(keys: string[]): RegExp {
    let regexp = `^`;

    for (let i = 0; i < keys.length - 1; i++) {
      regexp += YamlHandler.buildKeyRegex(keys[i]);
    }

    regexp += YamlHandler.buildKeyValueRegex(keys[keys.length - 1]);

    return new RegExp(regexp, 'm');
  }

  private static buildKeyRegex(key: string): string {
    return `${YamlHandler.QUOTATION_REGEX}(${key})${YamlHandler.QUOTATION_REGEX}${YamlHandler.COLON_REGEX}${YamlHandler.EVERYTHING_REGEX}`;
  }

  private static buildKeyValueRegex(key: string): string {
    return `${YamlHandler.QUOTATION_REGEX}(${key})${YamlHandler.QUOTATION_REGEX}${YamlHandler.COLON_REGEX}${YamlHandler.QUOTATION_REGEX}${YamlHandler.VALUE_REGEX}`;
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
    const exploded = match[0].split(':');
    exploded[exploded.length - 1] = exploded[exploded.length - 1].replace(
      originalValue,
      value
    );
    const updated = exploded.join(':');

    // Inject the updated value
    this.content = this.content.replace(match[0], updated);
  }

  /**
   * Search the key passed in the document and return the RegExpMatch
   * This RegExpMatch contains one group called 'value' which is the value of the
   * key passed.
   */
  private searchKey(key: string): RegExpMatchArray {
    const parsedKey = this.keyToArray(key);
    const regex = YamlHandler.buildRegex(parsedKey);

    const match = this.content.match(regex);

    if (match === null) {
      throw new NotFoundError(`${key} wasn't found.`);
    }

    return match;
  }
}
