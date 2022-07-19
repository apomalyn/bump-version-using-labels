// https://semver.org/#spec-item-2
// > A normal version number MUST take the form X.Y.Z where X, Y, and Z are non-negative
// > integers, and MUST NOT contain leading zeroes. X is the major version, Y is the minor
// > version, and Z is the patch version. Each element MUST increase numerically.
//
// NOTE: We differ here in that we allow X and X.Y, with missing parts having the default
// value of `0`.
import { VersionType } from './version-type';

const versionRegExp =
  /^(0|[1-9]\d*)(?:\.(0|[1-9]\d*)(?:\.(0|[1-9]\d*)(?:-([a-z0-9-.]+))?(?:\+([a-z0-9-.]+))?)?)?$/i;

export class SemanticVersion {
  readonly prerelease: string = '';
  readonly build: string = '';
  readonly startWithV: boolean = false;

  constructor(
    major: number,
    minor: number,
    patch: number,
    pre_release = '',
    build = '',
    startWithV = false
  ) {
    this._major = major;
    this._minor = minor;
    this._patch = patch;
    this.prerelease = pre_release;
    this.build = build;
    this.startWithV = startWithV;
  }

  private _major!: number;

  get major(): number {
    return this._major;
  }

  private _minor!: number;

  get minor(): number {
    return this._minor;
  }

  private _patch!: number;

  get patch(): number {
    return this._patch;
  }

  get raw(): string {
    return `${this.startWithV ? 'v' : ''}${this._major}.${this._minor}.${
      this._patch
    }${this.prerelease.length > 0 ? `-${this.prerelease}` : ''}${
      this.build.length > 0 ? `+${this.build}` : ''
    }`;
  }

  static fromString(text: string): SemanticVersion {
    let startWithV = false;
    if (text.startsWith('v')) {
      text = text.slice(1);
      startWithV = true;
    }
    const match = versionRegExp.exec(text);
    if (!match)
      throw new SyntaxError("The text given isn't a valid semantic version.");

    const [, major, minor = '0', patch = '0', prerelease = '', build = ''] =
      match;
    return new SemanticVersion(
      parseInt(major, 10),
      parseInt(minor, 10),
      parseInt(patch, 10),
      prerelease,
      build,
      startWithV
    );
  }

  increase(versionType: VersionType): void {
    switch (versionType) {
      case VersionType.MAJOR:
        this.increaseMajor();
        break;
      case VersionType.MINOR:
        this.increaseMinor();
        break;
      case VersionType.PATCH:
        this.increasePath();
        break;
    }
  }

  increaseMajor(): void {
    this._major += 1;
    this._minor = 0;
    this._patch = 0;
  }

  increaseMinor(): void {
    this._minor += 1;
    this._patch = 0;
  }

  increasePath(): void {
    this._patch += 1;
  }
}
