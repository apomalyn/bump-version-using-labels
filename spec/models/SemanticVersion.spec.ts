import { SemanticVersion } from '@models/semantic-version';
import { expect } from '@jest/globals';

const good_samples = [
  {
    raw: '1.0.0',
    expected: new SemanticVersion(1, 0, 0)
  },
  {
    raw: '0.1.1',
    expected: new SemanticVersion(0, 1, 1)
  },
  {
    raw: '1.0.0-aw2Q22ad',
    expected: new SemanticVersion(1, 0, 0, 'aw2Q22ad')
  },
  {
    raw: '1.1.1+2211sda21',
    expected: new SemanticVersion(1, 1, 1, '', '2211sda21')
  },
  {
    raw: '1.1.1-aw2Q22ad+2211sda21',
    expected: new SemanticVersion(1, 1, 1, 'aw2Q22ad', '2211sda21')
  },
  {
    raw: 'v1.1.1',
    expected: new SemanticVersion(1, 1, 1, '', '', true)
  }
];

const bad_samples = [
  '.0.0',
  'a.b.x',
  '1.0.0+sad+sad', // Can't have two build number
  'asdas'
];

describe('Constructor', () => {
  test('GOOD', () => {
    let sem_ver: SemanticVersion;
    for (const sample of good_samples) {
      // eslint-disable-next-line no-console
      console.log(`Testing ${sample.raw}`);
      sem_ver = SemanticVersion.fromString(sample.raw);

      expect(sem_ver).toBeInstanceOf(SemanticVersion);
      expect(sem_ver).toEqual(sample.expected);
    }
  });

  test('BAD', () => {
    for (const sample of bad_samples) {
      // eslint-disable-next-line no-console
      console.log(`Testing ${sample}`);
      expect(() => SemanticVersion.fromString(sample)).toThrowError(
        SyntaxError
      );
    }
  });
});
