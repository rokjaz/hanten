# Hanten Website Publishing Workflow

## Publication Rule

Publish from the standardized master file in Google Drive:

02 Maps/H### Name/H###.html

(An older H###_v2.html is used only if H###.html is missing.)

## Workflow

1. Standardize the exhibit in the Hanten master project.
2. Save the approved version as H###.html in its 02 Maps folder.
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

## Retiring an exhibit

When an exhibit is merged into another one or retired in the master project:

1. Delete its folder from exhibits/.
2. Add two lines to _redirects pointing its old address to the exhibit that absorbed it (or to /browse.html if nothing did):
   /exhibits/H### /exhibits/H0YY/ 301
   /exhibits/H###/* /exhibits/H0YY/ 301
3. Remove it from index.html, browse.html, and data/featured.js.
4. Republish any exhibit whose Related links changed.
