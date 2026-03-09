Generate dev-journal posts from git commit history across all tracked repos, then optionally publish selected drafts.

## Steps

1. **Generate new posts**: Run `npm run journal:generate` and capture the output. Report what was created and what was skipped.

2. **List draft journal posts**: Find all `posts/dev-journal-*.md` files that have `draft: true` in their frontmatter. Display them grouped by repo with date and commit count from the title.

3. **Ask what to publish**: Present the list of drafts and ask the user which ones to publish. Options:
   - Publish all
   - Publish by repo (e.g., "all contours posts")
   - Publish specific posts by name
   - Publish none (just keep as drafts)

4. **Publish selected posts**: For each selected post, remove the `draft: true` line from the frontmatter. Report which files were updated.

5. **Ask about deployment**: Ask the user if they want to push to GitHub (which triggers Railway auto-deploy). If yes:
   - Stage the changed files
   - Commit with message like `publish: Dev journal posts for <repos>`
   - Push to origin/main
   - Report the commit SHA

If the user provides arguments like a specific repo name, only process that repo's drafts in step 3.
