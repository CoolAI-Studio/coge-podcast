import 'dotenv/config';
import { execSync } from 'child_process';

const REPO_OWNER = 'CoolAI-Studio';
const REPO_NAME = 'coge-podcast';
const BRANCH = 'main';

async function sync() {
  const token = process.env.GITHUB_PAT || process.env.GITHUB_TOKEN;
  if (!token) {
    console.error('❌ Error: GITHUB_PAT or GITHUB_TOKEN environment variable is not defined.');
    console.log('Please add GITHUB_PAT to your AI Studio Secrets (via the Settings menu).');
    process.exit(1);
  }

  console.log('🚀 Starting GitHub Sync...');
  
  try {
    // 1. Initialize git if not already present
    let isGitRepo = false;
    try {
      execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
      isGitRepo = true;
    } catch (e) {
      // not a git repo
    }

    if (!isGitRepo) {
      console.log('Initializing local Git repository...');
      execSync('git init');
    }

    // 2. Configure git user info
    console.log('Configuring Git user...');
    execSync('git config user.name "AI Studio Assistant"');
    execSync('git config user.email "assistant@aistudio"');

    // 3. Set remote origin with token
    const remoteUrl = `https://x-access-token:${token}@github.com/${REPO_OWNER}/${REPO_NAME}.git`;
    
    // Check if origin already exists
    let hasRemote = false;
    try {
      execSync('git remote get-url origin', { stdio: 'ignore' });
      hasRemote = true;
    } catch (e) {}

    if (hasRemote) {
      execSync(`git remote set-url origin "${remoteUrl}"`);
    } else {
      execSync(`git remote add origin "${remoteUrl}"`);
    }

    // 4. Create or switch to the main branch
    try {
      execSync(`git checkout -b ${BRANCH}`, { stdio: 'ignore' });
    } catch (e) {
      execSync(`git checkout ${BRANCH}`, { stdio: 'ignore' });
    }

    // 5. Add all files
    console.log('Staging files...');
    execSync('git add -A');

    // 6. Commit
    console.log('Committing changes...');
    const commitMessage = `Auto sync from AI Studio - ${new Date().toLocaleString()}`;
    try {
      execSync(`git commit -m "${commitMessage}"`);
    } catch (e) {
      console.log('No changes to commit.');
      return;
    }

    // 7. Push to remote
    console.log(`Pushing to GitHub (${REPO_OWNER}/${REPO_NAME} branch: ${BRANCH})...`);
    execSync(`git push -u origin ${BRANCH} --force`, { stdio: 'inherit' });
    
    console.log('✅ Sync completed successfully!');
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    process.exit(1);
  }
}

sync();
