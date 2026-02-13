export interface ScenarioStep {
  instruction: string;
  expectedCommand: string;
  simulatedOutput: string;
  educationalNote: string;
  hint: string;
  alternativeCommands?: string[];
}

export interface TerminalScenario {
  id: string;
  title: string;
  description: string;
  category: 'kubernetes' | 'docker' | 'linux' | 'git';
  difficulty: 'medium' | 'hard' | 'evil';
  emoji: string;
  xpReward: number;
  steps: ScenarioStep[];
}

export const TERMINAL_SCENARIOS: TerminalScenario[] = [
  {
    id: 'scenario-k8s-crashloop',
    title: 'Pod CrashLoopBackOff',
    description: 'A production pod is stuck in CrashLoopBackOff. Debug it step by step.',
    category: 'kubernetes',
    difficulty: 'hard',
    emoji: '☸️',
    xpReward: 100,
    steps: [
      {
        instruction: 'First, check the status of all pods in the default namespace.',
        expectedCommand: 'kubectl get pods',
        simulatedOutput: 'NAME                     READY   STATUS             RESTARTS   AGE\napi-server-7b9d4f6c-x2k  0/1     CrashLoopBackOff   5          10m\nnginx-5d6b4c7f8-abc12    1/1     Running            0          2h',
        educationalNote: 'kubectl get pods shows pod status. CrashLoopBackOff means the container keeps crashing and K8s keeps restarting it with increasing backoff delays.',
        hint: 'Use kubectl get to list resources',
      },
      {
        instruction: 'The api-server pod is crashing. Check its events and details.',
        expectedCommand: 'kubectl describe pod api-server-7b9d4f6c-x2k',
        simulatedOutput: 'Name:         api-server-7b9d4f6c-x2k\nStatus:       Running\nContainers:\n  api:\n    State:       Waiting (CrashLoopBackOff)\n    Last State:  Terminated (Exit Code 1)\n    Ready:       False\n    Restart Count: 5\nEvents:\n  Warning  BackOff  1m   kubelet  Back-off restarting failed container',
        educationalNote: 'kubectl describe shows detailed info including events. Exit Code 1 means the application crashed (generic error). Exit Code 137 = OOMKilled, 143 = SIGTERM.',
        hint: 'Use kubectl describe pod <name>',
        alternativeCommands: ['kubectl describe pod api-server-7b9d4f6c-x2k'],
      },
      {
        instruction: 'Check the logs from the crashed container to see why it failed.',
        expectedCommand: 'kubectl logs api-server-7b9d4f6c-x2k --previous',
        simulatedOutput: 'Starting API server...\nConnecting to database at postgres:5432...\nError: FATAL: password authentication failed for user "api"\nConnection refused. Exiting with code 1.',
        educationalNote: 'Use --previous to see logs from the LAST crashed container instance. Without it, you might see an empty log if the current container just restarted.',
        hint: 'Use kubectl logs with --previous flag',
        alternativeCommands: ['kubectl logs api-server-7b9d4f6c-x2k -p'],
      },
      {
        instruction: 'The database password is wrong. Check the secret being used.',
        expectedCommand: 'kubectl get secret db-credentials -o yaml',
        simulatedOutput: 'apiVersion: v1\nkind: Secret\nmetadata:\n  name: db-credentials\ndata:\n  password: b2xkcGFzc3dvcmQ=\n  username: YXBp',
        educationalNote: 'Secrets store base64-encoded data. Decode with: echo "b2xkcGFzc3dvcmQ=" | base64 -d. This reveals "oldpassword" -- clearly the password was changed but the secret was not updated.',
        hint: 'Use kubectl get secret <name> -o yaml',
      },
      {
        instruction: 'Fix the secret by updating the password. Encode the new password "newsecurepass" in base64 first.',
        expectedCommand: 'echo -n "newsecurepass" | base64',
        simulatedOutput: 'bmV3c2VjdXJlcGFzcw==',
        educationalNote: 'Always use echo -n (no newline) when encoding for K8s secrets. A trailing newline would be part of the password and cause auth failures!',
        hint: 'Use echo -n with base64 encoding',
      },
      {
        instruction: 'Now restart the deployment to pick up the updated secret.',
        expectedCommand: 'kubectl rollout restart deployment api-server',
        simulatedOutput: 'deployment.apps/api-server restarted',
        educationalNote: 'kubectl rollout restart triggers a rolling restart without changing the spec. This forces pods to re-read secrets and configmaps.',
        hint: 'Use kubectl rollout restart',
      },
    ],
  },
  {
    id: 'scenario-docker-debug',
    title: 'Docker Container Won\'t Start',
    description: 'Your Docker container exits immediately after starting. Find and fix the issue.',
    category: 'docker',
    difficulty: 'medium',
    emoji: '🐳',
    xpReward: 75,
    steps: [
      {
        instruction: 'Check if any containers are running or have exited recently.',
        expectedCommand: 'docker ps -a',
        simulatedOutput: 'CONTAINER ID   IMAGE          STATUS                     NAMES\na1b2c3d4e5f6   myapp:latest   Exited (1) 30 seconds ago  myapp-web\nf6e5d4c3b2a1   postgres:15    Up 2 hours                 myapp-db',
        educationalNote: 'docker ps shows only running containers. Use -a (--all) to also see stopped/exited containers. Exit code 1 = generic error.',
        hint: 'Use docker ps with the -a flag',
      },
      {
        instruction: 'Check the logs of the exited container to see why it crashed.',
        expectedCommand: 'docker logs myapp-web',
        simulatedOutput: 'Node.js application starting...\nError: Cannot find module \'/app/server.js\'\n    at Module._resolveFilename (node:internal/modules/cjs/loader:1075:15)\nProcess exited with code 1',
        educationalNote: 'docker logs shows stdout/stderr output from a container, even after it has stopped. This is your first debugging tool.',
        hint: 'Use docker logs <container-name>',
      },
      {
        instruction: 'The entrypoint file is missing. Check what files are actually in the image.',
        expectedCommand: 'docker run --rm myapp:latest ls /app',
        simulatedOutput: 'Dockerfile\nnode_modules\npackage.json\nsrc\nindex.js',
        educationalNote: 'You can run a one-off command in an image with docker run --rm. --rm auto-removes the container after exit. The file is index.js not server.js!',
        hint: 'Use docker run --rm to execute a command in the image',
      },
      {
        instruction: 'Fix the Dockerfile CMD. Rebuild the image with the correct entrypoint.',
        expectedCommand: 'docker build -t myapp:latest .',
        simulatedOutput: 'Sending build context to Docker daemon  45.2MB\nStep 1/6 : FROM node:20-alpine\n ---> Using cache\nStep 6/6 : CMD ["node", "index.js"]\nSuccessfully built abc123def456\nSuccessfully tagged myapp:latest',
        educationalNote: 'Always verify your CMD/ENTRYPOINT matches actual file paths. A common issue is Dockerfile referencing files that don\'t exist in the build context.',
        hint: 'Use docker build -t <tag> .',
      },
      {
        instruction: 'Start the fixed container and verify it is running.',
        expectedCommand: 'docker run -d --name myapp-web -p 3000:3000 myapp:latest',
        simulatedOutput: 'b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7',
        educationalNote: '-d runs detached (background). --name gives it a friendly name. -p maps host:container ports. Always use -d for production services.',
        hint: 'Use docker run with -d, --name, and -p flags',
      },
    ],
  },
  {
    id: 'scenario-linux-diskfull',
    title: 'Server Disk Full',
    description: 'Production server is at 100% disk usage. Free up space before services crash.',
    category: 'linux',
    difficulty: 'medium',
    emoji: '🐧',
    xpReward: 75,
    steps: [
      {
        instruction: 'Check disk usage across all mounted filesystems.',
        expectedCommand: 'df -h',
        simulatedOutput: 'Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1       50G   49G  512M  99% /\ntmpfs           2G    0    2G    0%  /dev/shm',
        educationalNote: 'df -h shows filesystem disk space in human-readable format. 99% on / is critical -- services will fail when they can\'t write.',
        hint: 'Use df with the -h (human-readable) flag',
      },
      {
        instruction: 'Find which directories are consuming the most space.',
        expectedCommand: 'du -sh /* 2>/dev/null | sort -rh | head -10',
        simulatedOutput: '25G\t/var\n12G\t/home\n8G\t/usr\n2G\t/opt\n500M\t/tmp',
        educationalNote: 'du -sh shows directory sizes. sort -rh sorts by size descending. 2>/dev/null suppresses permission errors for restricted directories.',
        hint: 'Use du -sh with sort to find largest directories',
        alternativeCommands: ['du -sh /* | sort -rh | head -10'],
      },
      {
        instruction: '/var is the biggest. Drill into /var to find the culprit.',
        expectedCommand: 'du -sh /var/* | sort -rh | head -5',
        simulatedOutput: '22G\t/var/log\n2G\t/var/cache\n500M\t/var/lib\n100M\t/var/tmp',
        educationalNote: '22GB of logs! This is the #1 cause of disk full issues in production. Log rotation should prevent this.',
        hint: 'Run du -sh on /var/* subdirectories',
      },
      {
        instruction: 'Find the largest log files in /var/log.',
        expectedCommand: 'find /var/log -type f -size +100M -exec ls -lh {} +',
        simulatedOutput: '-rw-r--r-- 1 root root 18G /var/log/app/application.log\n-rw-r--r-- 1 root root 3.5G /var/log/syslog.1',
        educationalNote: 'find with -size +100M finds files larger than 100MB. The app log at 18GB is the main problem -- the application is logging too verbosely without rotation.',
        hint: 'Use find with -size flag to locate large files',
        alternativeCommands: ['find /var/log -size +100M'],
      },
      {
        instruction: 'Truncate the massive application log file to free space immediately.',
        expectedCommand: 'truncate -s 0 /var/log/app/application.log',
        simulatedOutput: '',
        educationalNote: 'truncate -s 0 empties a file without deleting it (preserving the file handle). If you rm a file while a process has it open, the space is NOT freed until the process closes it!',
        hint: 'Use truncate -s 0 to empty a file safely',
        alternativeCommands: ['> /var/log/app/application.log'],
      },
    ],
  },
  {
    id: 'scenario-git-revert',
    title: 'Revert a Bad Production Deploy',
    description: 'A buggy commit was pushed to main and deployed. Revert it without losing other work.',
    category: 'git',
    difficulty: 'hard',
    emoji: '📦',
    xpReward: 100,
    steps: [
      {
        instruction: 'Check the recent commit history to find the bad commit.',
        expectedCommand: 'git log --oneline -5',
        simulatedOutput: 'a1b2c3d (HEAD -> main) Merge: Add payment feature\ne4f5g6h Fix typo in README\n7h8i9j0 BUGGY: Update database config\nk1l2m3n Add user authentication\no4p5q6r Initial setup',
        educationalNote: 'git log --oneline shows compact history. -5 limits to last 5 commits. Identify the problematic commit by its message.',
        hint: 'Use git log --oneline to see recent history',
      },
      {
        instruction: 'Revert the buggy commit (7h8i9j0) without modifying history.',
        expectedCommand: 'git revert 7h8i9j0',
        simulatedOutput: '[main r1s2t3u] Revert "BUGGY: Update database config"\n 1 file changed, 3 insertions(+), 3 deletions(-)',
        educationalNote: 'git revert creates a NEW commit that undoes the changes. Unlike git reset, it does NOT rewrite history -- safe for shared branches like main.',
        hint: 'Use git revert <commit-hash>',
      },
      {
        instruction: 'Verify the revert was applied correctly.',
        expectedCommand: 'git log --oneline -3',
        simulatedOutput: 'r1s2t3u (HEAD -> main) Revert "BUGGY: Update database config"\na1b2c3d Merge: Add payment feature\ne4f5g6h Fix typo in README',
        educationalNote: 'The revert commit is now on top, undoing the buggy changes while preserving all history. This is the safe way to undo commits on shared branches.',
        hint: 'Use git log to verify the revert commit',
      },
      {
        instruction: 'Push the revert to remote to deploy the fix.',
        expectedCommand: 'git push origin main',
        simulatedOutput: 'Enumerating objects: 5, done.\nCounting objects: 100% (5/5), done.\nTo github.com:org/app.git\n   a1b2c3d..r1s2t3u  main -> main',
        educationalNote: 'This is safe because revert adds a commit -- no force push needed. The CI/CD pipeline will pick this up and deploy the fix automatically.',
        hint: 'Use git push origin main',
      },
    ],
  },
];
