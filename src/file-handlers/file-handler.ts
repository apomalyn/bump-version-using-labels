import { FileType } from '@models/file-type';
import { writeFileSync } from 'fs';

export abstract class FileHandler {
  protected content: string;
  protected fileType: FileType;

  protected constructor(content: string, fileType: FileType) {
    this.content = content;
    this.fileType = fileType;
  }

  saveToFile(filePath: string): void {
    writeFileSync(filePath, this.content);
  }

  getContent(): string {
    return this.content;
  }

  /**
   * Get the value of a specified key.
   * If the key is nested use a dot to define each level. For example if
   * you want the value of A that is nested in B, the key should be: "B.A"
   */
  abstract get(key: string): string;

  abstract set(key: string, value: string): void;

  protected keyToArray(key: string, separator = '.'): string[] {
    return key.split(separator);
  }
}
