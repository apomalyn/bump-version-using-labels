<p>
  <a href="https://github.com/apomalyn/bump-version-using-labels/actions/workflows/build.yml"><img alt="typescript-action status" src="https://github.com/apomalyn/bump-version-using-labels/actions/workflows/build.yml/badge.svg"></a>
  <a href="https://github.com/apomalyn/bump-version-using-labels/actions/workflows/test.yml"><img alt="typescript-action status" src="https://github.com/apomalyn/bump-version-using-labels/actions/workflows/test.yml/badge.svg"></a>
</p>

# Bump version using labels

Updating the version of our application can really be a pain when you are working with multiple
collaborators. Not anymore! This action will handle that for you!

## How? Just how? 🤔

Everything is done in a PR.

The action take a reference version that can be either a file on another branch or a tag (use `reference_branch`
or `use_tag_as_ref` to choose which one to use) and update the local version based on the label applied on the PR.

Let's do an example:

1. Context:
    - On my main branch, the version on the `package.json` is 1.0.0
    - PR#1 the version is 1.0.0, the label is: `version: patch`
    - PR#2 the version is 1.0.0, the label is: `version: minor`
2. The action run:
    - PR#1's version is updated to 1.0.1
    - PR#2's version is updated to 1.1.0
3. PR#2 is merged, which mean the main branch version is now 1.1.0
4. We synchronize the PR#1 with the main branch
    - The action start and update the version to 1.1.1

## Supported type of files

Here is the list of files the action is supporting. If you don't find yours please fill an issue!

- Yaml (.yaml, .yml)
- Json (.json)
- Podspec (.podspec)

## Example workflow

Here is a minimal example:

```yaml
name: 'Example'
on: # rebuild any PRs
  pull_request:
    types:
      - unlabeled
      - labeled
      - synchronize
      - opened
      - reopened
jobs:
  test: # make sure the action works on a clean machine
    runs-on: ubuntu-latest
    if: ${{ github.event_name == 'pull_request' }}
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    steps:
      - uses: actions/checkout@v3
      - name: Bump version
        uses: apomalyn/bump-version-using-labels
        with:
          file_path: 'package.json'
```

This will update the `package.json` file and comment the PR after each update.

## Inputs

|      Parameter      | Description                                                                                                                                                     | required |                     default                    |
|:-------------------:|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|:--------:|:----------------------------------------------:|
|     `file_path`     | Path to the file that contains the version.                                                                                                                     |     ✅    |                                                |
|    `patch_label`    | Label used to update the minor version (x.x.PATCH)                                                                                                              |     ❌    |                `version: Patch`                |
|    `minor_label`    | Label used to update the minor version (x.MINOR.0)                                                                                                              |     ❌    |                `version: Minor`                |
|    `major_label`    | Label used to update the minor version (MAJOR.0.0)                                                                                                              |     ❌    |                `version: Major`                |
|    `look_for_key`   | Key in the file that contains the version. For Podspec files, no need to specify the prefix of (`Pod::Spec.new do &#124;<prefix>&#124;`) the action detects it. |     ❌    |                    `version`                   |
|   `use_tag_as_ref`  | Use the tags of the repository to determine the latest version.                                                                                                 |     ❌    |                      false                     |
|  `reference_branch` | Use the specified branch to determine the latest version used. Ignored if `use_tag_as_ref` is true.                                                             |     ❌    |                     `main`                     |
|      `comment`      | Comment the pull request when the version is update or when there is an error. Set to `false` to disable.                                                       |     ❌    |                      false                     |
|  `comment_message`  | Message used for the comment. You can use '{old}' and '{new}' to display the ancient and new version. Ignored if `comment` is false.                            |     ❌    |       `Bump version from {old} to {new}`       |
|       `commit`      | Commit the changed file. Set to `false` to disable.                                                                                                             |     ❌    |                      true                      |
|   `commit_message`  | Message used for the commit. You can use '{old}' and '{new}' to display the ancient and new version. Ignored if `commit` is false.                              |     ❌    |    `[BOT] Bump version from {old} to {new}`    |
|  `commit_user_name` | Name used for the commit user. Ignored if `commit` is false.                                                                                                    |     ❌    |              `github-actions[bot]`             |
| `commit_user_email` | Email address used for the commit user. Ignored if `commit` is false.                                                                                           |     ❌    | `github-actions[bot]@users.noreply.github.com` |

## Outputs

|    Output     | Description                                               |
|:-------------:|-----------------------------------------------------------|
|   `version`   | Current/updated version                                   |
| `has_changed` | Boolean that indicate if the version have changed or not. |