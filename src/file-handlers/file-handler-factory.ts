import { existsSync, readFileSync } from 'fs';
import { FileHandler } from './file-handler';
import { FileType } from '@models/file-type';
import JsonHandler from './json-handler';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class FileHandlerFactory {
  static fromFile(filePath: string): FileHandler {
    const content = this.getContentFromFile(filePath);

    return this.fromContent(filePath, content);
  }

  static fromContent(filePath: string, fileContent: string): FileHandler {
    for (const fileTypeRegex of Object.values(FileType)) {
      if (filePath.match(fileTypeRegex) !== null) {
        switch (fileTypeRegex) {
          case FileType.JSON:
            return new JsonHandler(fileContent);
        }
      }
    }

    throw new TypeError(`${filePath} isn't a type of file that is supported`);
  }

  /**
   * Open and read the file.
   */
  private static getContentFromFile(filePath: string): string {
    if (!existsSync(filePath)) {
      throw new Error(`${filePath} doesn't exists.`);
    }

    // Read the content of the file.
    return readFileSync(filePath, 'utf8');
  }
}
