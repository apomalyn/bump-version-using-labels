import { FileHandler } from './file-handler';
import { FileType } from '@models/file-type';
import { NotFoundError } from '../utils/not-found-error';

export default class JsonHandler extends FileHandler {
  private static readonly QUOTATION_REGEX = '(?:\\"|\\\')';
  private static readonly EVERYTHING_REGEX = '([\\S\\s]+?)';

  constructor(content: string) {
    super(content, FileType.JSON);
  }

  private static buildKeyRegex(key: string): string {
    return `(${key})${JsonHandler.QUOTATION_REGEX}(?:\\:\\s*)(?:{)`;
  }

  private static buildKeyValueRegex(key: string): string {
    return `(${key})${JsonHandler.QUOTATION_REGEX}(?:\\:\\s*)${JsonHandler.QUOTATION_REGEX}?(?<value>[\\w\\s-._]*)${JsonHandler.QUOTATION_REGEX}?`;
  }

  private static buildRegex(keys: string[]): RegExp {
    let regex = JsonHandler.QUOTATION_REGEX;
    for (let i = 0; i < keys.length - 1; i++) {
      regex +=
        JsonHandler.buildKeyRegex(keys[i]) + JsonHandler.EVERYTHING_REGEX;
    }
    regex += JsonHandler.buildKeyValueRegex(keys[keys.length - 1]);

    return new RegExp(regex, 'g');
  }

  get(key: string): string {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.searchKey(key).groups!.value;
  }

  set(key: string, value: string): void {
    const matchResult = this.searchKey(key);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const originalValue = matchResult.groups!.value;

    // Update the value in the original match
    const exploded = matchResult[0].split(':');
    exploded[exploded.length - 1] = exploded[exploded.length - 1].replace(
      originalValue,
      value
    );
    const updated = exploded.join(':');

    // Inject the updated value
    this.content = this.content.replace(matchResult[0], updated);
  }

  saveToFile(filePath: string): void {
    super.saveToFile(filePath);
  }

  private searchKey(key: string): RegExpMatchArray {
    const parsedKey = this.keyToArray(key);
    const regex = JsonHandler.buildRegex(parsedKey);

    const allMatch = this.content.matchAll(regex);

    if (allMatch === undefined) {
      throw new NotFoundError(`${key} wasn't found.`);
    }

    // Check to see that the match start at level 1
    for (const match of allMatch) {
      if (this.content.slice(0, match.index).split('{').length % 2 === 0) {
        return match;
      }
    }

    throw new NotFoundError(`${key} wasn't found.`);
  }
}
