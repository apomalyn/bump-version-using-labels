// https://semver.org/#spec-item-2
// > A normal version number MUST take the form X.Y.Z where X, Y, and Z are non-negative
// > integers, and MUST NOT contain leading zeroes. X is the major version, Y is the minor
// > version, and Z is the patch version. Each element MUST increase numerically.
//
// NOTE: We differ here in that we allow X and X.Y, with missing parts having the default
// value of `0`.
const versionRegExp =
  /^(0|[1-9]\d*)(?:\.(0|[1-9]\d*)(?:\.(0|[1-9]\d*)(?:-([a-z0-9-.]+))?(?:\+([a-z0-9-.]+))?)?)?$/i;

export class SemanticVersion {
  readonly major!: number;
  readonly minor!: number;
  readonly patch!: number;
  readonly prerelease: string = '';
  readonly build: string = '';
  readonly raw!: string;

  constructor(
    major: number,
    minor: number,
    patch: number,
    pre_release = '',
    build = ''
  ) {
    this.major = major;
    this.minor = minor;
    this.patch = patch;
    this.prerelease = pre_release;
    this.build = build;
    this.raw = `${major}.${minor}.${patch}-${pre_release}+${build}`;
  }

  static fromString(text: string): SemanticVersion {
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
      build
    );
  }
}
