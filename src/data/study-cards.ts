export interface StudyCard {
  id: string;
  title: string;
  explanation: string;
  codeExample?: string;
  proTip: string;
  commonMistake: string;
}

export interface LevelStudyContent {
  levelId: string;
  cards: StudyCard[];
}

export const studyContent: LevelStudyContent[] = [
  {
    levelId: 'linux',
    cards: [
      {
        id: 'linux-permissions',
        title: 'File Permissions (chmod)',
        explanation: 'Linux uses a 3-tier permission model: Owner, Group, Others. Each tier has Read (4), Write (2), Execute (1) bits. Use chmod to change permissions numerically (755) or symbolically (u+x).',
        codeExample: 'chmod 755 script.sh    # rwxr-xr-x\nchmod u+x file.sh      # Add execute for owner\nls -la                 # View permissions',
        proTip: 'Remember: 7=rwx, 6=rw-, 5=r-x, 4=r--. Scripts need execute permission to run directly.',
        commonMistake: 'Using chmod 777 in production gives everyone full access -- a serious security risk.',
      },
      {
        id: 'linux-processes',
        title: 'Process Management',
        explanation: 'Every running program is a process with a unique PID. Use ps/top/htop to view, kill/killall to terminate. Signals: SIGTERM (15) = graceful stop, SIGKILL (9) = force kill.',
        codeExample: 'ps aux | grep nginx    # Find nginx process\nkill -15 1234          # Graceful stop\nkill -9 1234           # Force kill\nhtop                   # Interactive viewer',
        proTip: 'Always try SIGTERM before SIGKILL. SIGKILL skips cleanup and can leave orphaned resources.',
        commonMistake: 'Using kill -9 as the first resort instead of allowing graceful shutdown with SIGTERM.',
      },
      {
        id: 'linux-pipes-redirect',
        title: 'Pipes and Redirection',
        explanation: 'The pipe (|) sends stdout of one command to stdin of the next. Redirect with > (overwrite), >> (append), 2> (stderr), &> (both). This is the heart of Unix philosophy.',
        codeExample: 'cat log.txt | grep ERROR | wc -l\ncommand > output.txt 2>&1    # Both stdout+stderr\necho "data" >> file.txt      # Append',
        proTip: 'Use tee to both display output AND write to a file: command | tee output.log',
        commonMistake: 'Using > when you meant >> will overwrite the entire file contents.',
      },
      {
        id: 'linux-users-groups',
        title: 'Users and Groups',
        explanation: 'Linux is multi-user. Root (UID 0) has full access. Regular users use sudo for elevated privileges. Groups control shared access to files.',
        codeExample: 'useradd -m newuser     # Create user with home\npasswd newuser         # Set password\nusermod -aG docker bob # Add bob to docker group\nwhoami                 # Current user',
        proTip: 'Always use -aG with usermod to ADD to groups. Without -a, it replaces all groups!',
        commonMistake: 'Running everything as root instead of using sudo for specific commands.',
      },
      {
        id: 'linux-filesystem',
        title: 'Filesystem Hierarchy',
        explanation: '/etc = configs, /var = variable data/logs, /home = user dirs, /tmp = temporary, /opt = optional software, /proc = virtual kernel info, /dev = device files.',
        codeExample: 'df -h         # Disk space per filesystem\ndu -sh /var   # Directory size\nlsblk         # Block devices\nmount         # Mounted filesystems',
        proTip: 'The /proc filesystem is virtual -- it exposes kernel and process info as files. Try cat /proc/cpuinfo.',
        commonMistake: 'Filling up /var/log without log rotation -- this can crash services that need to write.',
      },
    ],
  },
  {
    levelId: 'bash',
    cards: [
      {
        id: 'bash-variables',
        title: 'Variables and Quoting',
        explanation: 'Variables: VAR="value" (no spaces around =). Access with $VAR or ${VAR}. Double quotes allow expansion, single quotes are literal. Always quote variables to handle spaces.',
        codeExample: 'NAME="DevOps"\necho "Hello $NAME"     # Hello DevOps\necho \'Hello $NAME\'     # Hello $NAME\necho "${NAME}_user"    # DevOps_user',
        proTip: 'Always use "${VAR}" with double quotes to prevent word splitting and globbing issues.',
        commonMistake: 'Spaces around = in assignment: VAR = "value" is wrong, VAR="value" is correct.',
      },
      {
        id: 'bash-conditionals',
        title: 'Conditionals (if/test)',
        explanation: 'Use [[ ]] for conditions. String: ==, !=. Numbers: -eq, -ne, -lt, -gt. Files: -f (exists file), -d (exists dir), -z (empty string).',
        codeExample: 'if [[ -f "/etc/nginx/nginx.conf" ]]; then\n  echo "Config exists"\nelif [[ -z "$CONFIG" ]]; then\n  echo "No config variable set"\nelse\n  echo "Using default"\nfi',
        proTip: 'Use [[ ]] instead of [ ] -- it handles spaces and special characters more safely.',
        commonMistake: 'Missing spaces inside brackets: [["$x"=="y"]] is wrong, [[ "$x" == "y" ]] is correct.',
      },
      {
        id: 'bash-loops',
        title: 'Loops (for/while)',
        explanation: 'for loops iterate over lists/ranges. while loops run until condition is false. Use break to exit, continue to skip iteration.',
        codeExample: 'for f in *.log; do\n  echo "Processing $f"\ndone\n\nfor i in {1..5}; do echo $i; done\n\nwhile read -r line; do\n  echo "$line"\ndone < input.txt',
        proTip: 'Use while read for processing files line by line -- it handles whitespace correctly.',
        commonMistake: 'Using for line in $(cat file) breaks on whitespace. Use while read instead.',
      },
      {
        id: 'bash-functions',
        title: 'Functions and Exit Codes',
        explanation: 'Functions group reusable logic. Every command returns an exit code: 0 = success, non-zero = failure. $? holds the last exit code. Use set -e to exit on errors.',
        codeExample: 'check_service() {\n  systemctl is-active "$1" > /dev/null 2>&1\n  return $?\n}\n\nif check_service nginx; then\n  echo "nginx is running"\nfi',
        proTip: 'Start scripts with set -euo pipefail for strict error handling in production.',
        commonMistake: 'Forgetting that functions use positional args ($1, $2) not named parameters.',
      },
      {
        id: 'bash-debugging',
        title: 'Debugging Scripts',
        explanation: 'Use set -x to print every command as it executes (trace mode). Use set -e to stop on first error. Use shellcheck for static analysis.',
        codeExample: '#!/bin/bash\nset -euxo pipefail  # strict + debug\n\n# Or debug specific section:\nset -x\nproblematic_function\nset +x',
        proTip: 'Install shellcheck and run it on every script -- it catches 90% of common bash mistakes.',
        commonMistake: 'Not using set -e in production scripts, allowing silent failures to propagate.',
      },
    ],
  },
  {
    levelId: 'git',
    cards: [
      {
        id: 'git-basics',
        title: 'Git Workflow Basics',
        explanation: 'Git has 3 areas: Working directory, Staging area (index), Repository. git add moves to staging, git commit saves to repo. Use git status constantly.',
        codeExample: 'git status              # See current state\ngit add -A              # Stage all changes\ngit commit -m "message" # Commit staged\ngit log --oneline       # Compact history',
        proTip: 'Commit early and often with meaningful messages. Each commit should be one logical change.',
        commonMistake: 'Giant commits with "fix stuff" messages -- impossible to review or revert cleanly.',
      },
      {
        id: 'git-branching',
        title: 'Branching and Merging',
        explanation: 'Branches are cheap pointers to commits. Create branches for features, merge back to main. Fast-forward merge = no merge commit. 3-way merge = merge commit.',
        codeExample: 'git checkout -b feature/login\n# ... make changes, commit ...\ngit checkout main\ngit merge feature/login\ngit branch -d feature/login',
        proTip: 'Use git rebase for a clean linear history on feature branches before merging to main.',
        commonMistake: 'Working directly on main/master instead of feature branches.',
      },
      {
        id: 'git-conflicts',
        title: 'Resolving Merge Conflicts',
        explanation: 'Conflicts happen when two branches modify the same lines. Git marks conflicts with <<<<<<< / ======= / >>>>>>> markers. Resolve by editing, then add and commit.',
        codeExample: '<<<<<<< HEAD\nmy changes\n=======\ntheir changes\n>>>>>>> feature-branch\n\n# After resolving:\ngit add resolved-file.txt\ngit commit',
        proTip: 'Use git mergetool with a visual tool like VS Code for complex conflicts.',
        commonMistake: 'Blindly accepting "theirs" or "ours" without understanding the changes.',
      },
      {
        id: 'git-stash',
        title: 'Stash and Cherry-pick',
        explanation: 'git stash saves uncommitted changes temporarily. git cherry-pick copies a specific commit to your branch. Both are essential for flexible workflows.',
        codeExample: 'git stash                    # Save WIP\ngit stash pop                # Restore WIP\ngit cherry-pick abc123       # Copy commit\ngit stash list               # View stashes',
        proTip: 'Name your stashes: git stash push -m "WIP: login feature" for easy identification.',
        commonMistake: 'Forgetting about stashed changes -- use git stash list regularly to check.',
      },
    ],
  },
  {
    levelId: 'docker',
    cards: [
      {
        id: 'docker-concepts',
        title: 'Images vs Containers',
        explanation: 'An image is a read-only template (like a class). A container is a running instance (like an object). Images are built from Dockerfiles. Containers are created from images.',
        codeExample: 'docker build -t myapp:v1 .   # Build image\ndocker run -d myapp:v1       # Start container\ndocker ps                    # List running\ndocker images                # List images',
        proTip: 'Always tag images with versions (myapp:v1.2.3), never rely only on :latest in production.',
        commonMistake: 'Using :latest tag in production -- it is mutable and can change unexpectedly.',
      },
      {
        id: 'docker-dockerfile',
        title: 'Writing Efficient Dockerfiles',
        explanation: 'Order matters! Put rarely-changing instructions first for better layer caching. Use multi-stage builds to reduce image size. COPY before RUN npm install.',
        codeExample: 'FROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM node:20-alpine\nCOPY --from=builder /app/dist ./dist\nCMD ["node", "dist/index.js"]',
        proTip: 'Use .dockerignore to exclude node_modules, .git, and other unnecessary files from context.',
        commonMistake: 'COPY . . before npm install breaks layer caching -- any code change re-downloads deps.',
      },
      {
        id: 'docker-networking',
        title: 'Container Networking',
        explanation: 'Docker creates a default bridge network. Containers on the same network can reach each other by name. Use -p to map host:container ports.',
        codeExample: 'docker network create mynet\ndocker run -d --name db --network mynet postgres\ndocker run -d --name app --network mynet -p 3000:3000 myapp\n# app can reach db at hostname "db"',
        proTip: 'Use Docker Compose for multi-container setups -- it handles networking automatically.',
        commonMistake: 'Exposing database ports to the host when only app containers need access.',
      },
      {
        id: 'docker-volumes',
        title: 'Volumes and Persistence',
        explanation: 'Containers are ephemeral -- data is lost when removed. Volumes persist data outside containers. Named volumes are managed by Docker, bind mounts map host paths.',
        codeExample: 'docker volume create pgdata\ndocker run -v pgdata:/var/lib/postgresql/data postgres\n\n# Bind mount (development):\ndocker run -v $(pwd):/app myapp',
        proTip: 'Use named volumes for databases, bind mounts for development code hot-reloading.',
        commonMistake: 'Running databases without volumes -- all data is lost when the container stops.',
      },
    ],
  },
  {
    levelId: 'ansible',
    cards: [
      {
        id: 'ansible-basics',
        title: 'Playbooks and Modules',
        explanation: 'Ansible automates via playbooks (YAML). Playbooks contain plays, plays contain tasks. Tasks use modules (apt, copy, service, etc.). Ansible is agentless -- it uses SSH.',
        codeExample: '- name: Configure web server\n  hosts: webservers\n  become: yes\n  tasks:\n    - name: Install nginx\n      apt:\n        name: nginx\n        state: present\n    - name: Start nginx\n      service:\n        name: nginx\n        state: started',
        proTip: 'Always use state: present/absent/started -- modules are idempotent when you use states.',
        commonMistake: 'Using shell/command modules when a proper module exists (e.g., shell: apt-get install instead of apt module).',
      },
      {
        id: 'ansible-inventory',
        title: 'Inventory and Groups',
        explanation: 'The inventory defines managed hosts. Group hosts by role (webservers, databases). Use group_vars and host_vars for environment-specific configuration.',
        codeExample: '[webservers]\nweb1 ansible_host=10.0.1.10\nweb2 ansible_host=10.0.1.11\n\n[databases]\ndb1 ansible_host=10.0.2.10\n\n[production:children]\nwebservers\ndatabases',
        proTip: 'Use dynamic inventory scripts for cloud environments (AWS, GCP) instead of static files.',
        commonMistake: 'Hardcoding IPs instead of using DNS names or dynamic inventory.',
      },
      {
        id: 'ansible-roles',
        title: 'Roles and Galaxy',
        explanation: 'Roles organize playbooks into reusable components with standard directory structure: tasks/, handlers/, templates/, files/, vars/, defaults/, meta/.',
        codeExample: 'ansible-galaxy init myrole\n# Structure:\n# myrole/\n#   tasks/main.yml\n#   handlers/main.yml\n#   templates/\n#   defaults/main.yml\n#   vars/main.yml',
        proTip: 'Put defaults in defaults/main.yml (overridable) and fixed values in vars/main.yml.',
        commonMistake: 'Not using roles for repeated code -- leads to massive unmanageable playbooks.',
      },
    ],
  },
  {
    levelId: 'kubernetes',
    cards: [
      {
        id: 'k8s-architecture',
        title: 'Cluster Architecture',
        explanation: 'Control plane: API Server (gateway), etcd (state store), Scheduler (pod placement), Controller Manager (reconciliation loops). Worker nodes: kubelet (pod lifecycle), kube-proxy (networking).',
        codeExample: 'kubectl cluster-info\nkubectl get nodes\nkubectl get componentstatuses\nkubectl get pods -n kube-system',
        proTip: 'The API Server is the ONLY component that talks to etcd. Everything goes through the API.',
        commonMistake: 'Confusing the scheduler (assigns pods to nodes) with the kubelet (runs pods on nodes).',
      },
      {
        id: 'k8s-pods-deployments',
        title: 'Pods, Deployments, Services',
        explanation: 'Pod = smallest unit (1+ containers). Deployment = manages ReplicaSets (scaling, rolling updates). Service = stable endpoint for pods (ClusterIP, NodePort, LoadBalancer).',
        codeExample: 'kubectl create deployment web --image=nginx --replicas=3\nkubectl expose deployment web --port=80 --type=LoadBalancer\nkubectl get pods,svc\nkubectl scale deployment web --replicas=5',
        proTip: 'Never create bare pods -- always use Deployments for automatic restart and scaling.',
        commonMistake: 'Using kubectl run for production instead of declarative YAML manifests.',
      },
      {
        id: 'k8s-troubleshooting',
        title: 'Troubleshooting Pods',
        explanation: 'Pending = scheduling issue. CrashLoopBackOff = app crashing. ImagePullBackOff = wrong image. Use describe for events, logs for app output.',
        codeExample: 'kubectl describe pod <name>    # Events/errors\nkubectl logs <pod>             # App stdout\nkubectl logs <pod> --previous  # Crashed container\nkubectl exec -it <pod> -- sh   # Shell access\nkubectl get events --sort-by=.lastTimestamp',
        proTip: 'Always check events first: kubectl get events --sort-by=.lastTimestamp shows the timeline.',
        commonMistake: 'Only checking logs when the issue is scheduling (Pending) -- describe shows the real reason.',
      },
      {
        id: 'k8s-configmaps-secrets',
        title: 'ConfigMaps and Secrets',
        explanation: 'ConfigMaps store non-sensitive config as key-value pairs. Secrets store sensitive data (base64-encoded, NOT encrypted by default). Both can be mounted as volumes or env vars.',
        codeExample: 'kubectl create configmap app-config --from-literal=DB_HOST=postgres\nkubectl create secret generic db-creds --from-literal=password=s3cret\n\n# In pod spec:\nenvFrom:\n  - configMapRef:\n      name: app-config',
        proTip: 'Enable encryption at rest for Secrets and consider external secret managers (Vault, AWS SM).',
        commonMistake: 'Treating Secrets as encrypted -- they are only base64-encoded by default.',
      },
    ],
  },
  {
    levelId: 'terraform',
    cards: [
      {
        id: 'tf-workflow',
        title: 'Terraform Workflow',
        explanation: 'init = download providers. plan = preview changes. apply = execute changes. destroy = remove everything. State tracks what Terraform manages.',
        codeExample: 'terraform init          # Download providers\nterraform plan          # Preview changes\nterraform apply         # Execute plan\nterraform destroy       # Remove all resources',
        proTip: 'Always run plan before apply. In CI/CD, save the plan: terraform plan -out=tfplan.',
        commonMistake: 'Running terraform apply without reviewing the plan first.',
      },
      {
        id: 'tf-state',
        title: 'State Management',
        explanation: 'State maps config to real resources. Local state = terraform.tfstate file. Remote state (S3+DynamoDB) enables team collaboration with locking to prevent conflicts.',
        codeExample: 'terraform {\n  backend "s3" {\n    bucket         = "my-tf-state"\n    key            = "prod/terraform.tfstate"\n    region         = "us-east-1"\n    dynamodb_table = "tf-locks"\n  }\n}',
        proTip: 'Never commit terraform.tfstate to git -- it may contain secrets. Use remote backends.',
        commonMistake: 'Multiple people running apply simultaneously without state locking.',
      },
      {
        id: 'tf-modules',
        title: 'Modules and Reusability',
        explanation: 'Modules group resources into reusable packages. Use input variables for customization, outputs for passing values. Source from local paths, Git, or Terraform Registry.',
        codeExample: 'module "vpc" {\n  source  = "terraform-aws-modules/vpc/aws"\n  version = "5.0.0"\n\n  name = "my-vpc"\n  cidr = "10.0.0.0/16"\n}',
        proTip: 'Pin module versions in production. Use for_each with modules for multiple instances.',
        commonMistake: 'Not pinning module versions -- updates can introduce breaking changes.',
      },
    ],
  },
  {
    levelId: 'aws',
    cards: [
      {
        id: 'aws-iam',
        title: 'IAM: Users, Roles, Policies',
        explanation: 'IAM controls WHO can do WHAT on WHICH resources. Users = humans with credentials. Roles = assumed by services (no credentials). Policies = JSON permission documents.',
        codeExample: '{\n  "Effect": "Allow",\n  "Action": ["s3:GetObject", "s3:PutObject"],\n  "Resource": "arn:aws:s3:::mybucket/*"\n}',
        proTip: 'Follow least privilege: start with no permissions and add only what is needed.',
        commonMistake: 'Using "Action": "*" and "Resource": "*" -- gives full admin access to everything.',
      },
      {
        id: 'aws-networking',
        title: 'VPC, Subnets, Security Groups',
        explanation: 'VPC = isolated network. Public subnets have internet access (via IGW). Private subnets use NAT Gateway for outbound. Security Groups are stateful firewalls per instance.',
        codeExample: 'VPC: 10.0.0.0/16\n  Public Subnet:  10.0.1.0/24 -> IGW\n  Private Subnet: 10.0.2.0/24 -> NAT GW\n\nSecurity Group: Allow inbound 443 from 0.0.0.0/0',
        proTip: 'Security Groups are stateful (return traffic auto-allowed). NACLs are stateless.',
        commonMistake: 'Putting databases in public subnets or opening 0.0.0.0/0 on SSH port 22.',
      },
      {
        id: 'aws-compute',
        title: 'EC2 vs Lambda vs ECS',
        explanation: 'EC2 = virtual servers (you manage OS). Lambda = serverless functions (event-driven, pay per invocation). ECS/EKS = container orchestration. Choose based on workload type.',
        codeExample: 'EC2:    Long-running, full control\nLambda: Event-driven, < 15min, auto-scale\nECS:    Containerized apps, Fargate=serverless\nEKS:    Kubernetes on AWS',
        proTip: 'Lambda cold starts add latency. Use provisioned concurrency for latency-sensitive functions.',
        commonMistake: 'Using EC2 for everything when Lambda or containers would be simpler and cheaper.',
      },
    ],
  },
  {
    levelId: 'cicd',
    cards: [
      {
        id: 'cicd-pipeline',
        title: 'Pipeline Structure',
        explanation: 'A CI/CD pipeline automates: Build -> Test -> Scan -> Deploy. CI runs on every commit (fast feedback). CD deploys automatically or with approval gates.',
        codeExample: '# GitHub Actions example:\non: push\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm ci\n      - run: npm test\n      - run: npm run build',
        proTip: 'Keep pipelines fast (< 10 min). Parallelize tests, cache dependencies aggressively.',
        commonMistake: 'Skipping tests in CI to save time -- defeats the entire purpose of CI.',
      },
      {
        id: 'cicd-deployment-strategies',
        title: 'Deployment Strategies',
        explanation: 'Rolling: gradual replacement (default K8s). Blue-Green: two environments, switch traffic. Canary: small % first, then full rollout. Recreate: all at once (downtime).',
        codeExample: 'Rolling:    V1 V1 V1 -> V1 V1 V2 -> V1 V2 V2 -> V2 V2 V2\nBlue-Green: Blue(V1) live -> Green(V2) ready -> Switch\nCanary:     1% V2 -> 10% V2 -> 50% V2 -> 100% V2',
        proTip: 'Always have a rollback plan. Canary is safest for high-traffic production systems.',
        commonMistake: 'No rollback strategy -- when deployments fail, you need to recover fast.',
      },
      {
        id: 'cicd-gitops',
        title: 'GitOps',
        explanation: 'GitOps uses Git as the single source of truth. Infra and app configs stored in Git. A reconciler (ArgoCD, Flux) ensures cluster state matches Git state.',
        codeExample: '# ArgoCD Application:\napiVersion: argoproj.io/v1alpha1\nkind: Application\nspec:\n  source:\n    repoURL: https://github.com/org/k8s-configs\n    path: production\n  destination:\n    server: https://kubernetes.default.svc',
        proTip: 'Separate app code repos from deployment config repos for cleaner GitOps workflows.',
        commonMistake: 'Manually running kubectl apply in production instead of going through Git.',
      },
    ],
  },
  {
    levelId: 'openshift',
    cards: [
      {
        id: 'openshift-vs-k8s',
        title: 'OpenShift vs Kubernetes',
        explanation: 'OpenShift IS Kubernetes + enterprise features: built-in CI/CD (Tekton), image registry, Routes (like Ingress), SCCs (security), Operator Hub, web console.',
        codeExample: 'oc new-project myapp\noc new-app nodejs~https://github.com/org/app\noc expose svc/app    # Create a Route\noc get routes        # External URL',
        proTip: 'The oc CLI is kubectl-compatible -- all kubectl commands work with oc too.',
        commonMistake: 'Ignoring SCCs (Security Context Constraints) -- they are stricter than vanilla K8s.',
      },
      {
        id: 'openshift-builds',
        title: 'BuildConfigs and S2I',
        explanation: 'Source-to-Image (S2I) builds container images from source code without Dockerfiles. BuildConfigs define the build process. ImageStreams track image versions.',
        codeExample: 'oc new-build nodejs~https://github.com/org/app\noc start-build myapp\noc logs build/myapp-1\noc get imagestreams',
        proTip: 'Use ImageStream triggers to auto-deploy when a new image is built.',
        commonMistake: 'Not linking BuildConfig outputs to ImageStreams -- missing auto-deployment triggers.',
      },
    ],
  },
  {
    levelId: 'devops',
    cards: [
      {
        id: 'devops-culture',
        title: 'DevOps Culture and Practices',
        explanation: 'DevOps is a culture, not a tool. Key practices: CI/CD, IaC, monitoring, incident response, blameless postmortems, shared ownership, automation of everything repetitive.',
        codeExample: '# The CALMS framework:\nC - Culture (collaboration)\nA - Automation (CI/CD, IaC)\nL - Lean (reduce waste)\nM - Measurement (metrics)\nS - Sharing (knowledge)',
        proTip: 'The best DevOps metric is DORA: deployment frequency, lead time, MTTR, change failure rate.',
        commonMistake: 'Thinking DevOps is just "developers doing operations" or buying a tool.',
      },
      {
        id: 'devops-monitoring',
        title: 'Monitoring and Observability',
        explanation: 'The 3 pillars: Metrics (Prometheus), Logs (ELK/Loki), Traces (Jaeger). SLIs measure service health, SLOs set targets, SLAs are contractual agreements.',
        codeExample: 'SLI: HTTP request latency p99\nSLO: p99 latency < 200ms for 99.9% of time\nSLA: If SLO breached, customer gets credits\n\n# Error budget = 100% - SLO = 0.1%',
        proTip: 'Alert on SLO burn rate, not individual metrics. This reduces alert fatigue dramatically.',
        commonMistake: 'Alerting on every spike instead of sustained SLO violations -- causes alert fatigue.',
      },
    ],
  },
];

export const getStudyContentForLevel = (levelId: string): StudyCard[] => {
  const content = studyContent.find(s => s.levelId === levelId);
  return content?.cards || [];
};
