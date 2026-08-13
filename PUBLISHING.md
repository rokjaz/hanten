# Hanten Website Publishing Workflow

## Publication Rule

Only exhibits that have completed the Hanten v2 standardization pass may be published to the website-v2 architecture.

The approved source file must be:

H###_v2.html

The publisher must not fall back to H###.html or any archived/original version.

## Workflow

1. Standardize the exhibit in the Hanten master project.
2. Save the approved version as H###_v2.html.
3. Run:
   ./tools/publish-exhibit.sh H###
4. Open and visually inspect exhibits/H###/index.html.
5. Test both Save Image and Share Image.
6. Commit the approved website version to Git.
7. Push website-v2 to GitHub.

## Source of Truth

Editorial/master exhibit files remain in the Hanten master project.

The GitHub repository contains the deployable website.

Do not edit the master exhibit merely to solve a website deployment issue.
