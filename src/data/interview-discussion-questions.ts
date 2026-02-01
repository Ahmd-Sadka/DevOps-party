import { InterviewDiscussionQuestion } from '@/types/game';

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getShuffledDiscussionQuestions(
  category?: InterviewDiscussionQuestion['category']
): InterviewDiscussionQuestion[] {
  let list = interviewDiscussionQuestions;
  if (category) {
    list = list.filter((q) => q.category === category);
  }
  return shuffleArray(list);
}

export const interviewDiscussionQuestions: InterviewDiscussionQuestion[] = [
  // --- Linux ---
  {
    id: 'd-linux-hardlink-softlink',
    category: 'Linux',
    question: 'What is the difference between a hard link and a soft (symbolic) link?',
    hint: 'Think about inodes and what happens when you delete the original file.',
    answer:
      'A hard link shares the same inode as the original file — it’s another name for the same data on disk. Deleting the original does not remove the data while a hard link exists. A soft/symbolic link is a separate file that stores the path to the target; it can point across filesystems and to directories. If you delete the target, the symlink becomes a broken link.',
  },
  {
    id: 'd-linux-reverse-forward-proxy',
    category: 'Linux',
    question: 'Explain the difference between a reverse proxy and a forward proxy.',
    hint: 'Who is the proxy hiding or protecting — the client or the server?',
    answer:
      'Reverse proxy: sits in front of servers. The client talks to the proxy, which forwards requests to backend servers (e.g. nginx, load balancer). Used for load balancing, SSL termination, caching. Forward proxy: sits in front of clients. Clients use the proxy to reach the internet (e.g. corporate proxy). The server sees the proxy’s IP, not the client’s.',
  },
  {
    id: 'd-linux-404-troubleshoot',
    category: 'Linux',
    question: "Walk me through how you'd troubleshoot a 404 error on a web app you administer.",
    hint: 'Start from the request path, then server config, then filesystem.',
    answer:
      '1) Verify the exact URL/path the user is hitting. 2) Check web server config (nginx/apache): document root, location blocks, aliases. 3) Confirm the file or route exists on disk and that the process user has read permission. 4) For SPAs, check if the server is configured to serve index.html for client-side routes. 5) Check app logs and any reverse proxy in front.',
  },
  {
    id: 'd-linux-umask',
    category: 'Linux',
    question: 'What is umask and how does it affect new files and directories?',
    hint: 'It’s a mask — which bits are removed from the default permissions?',
    answer:
      'umask is a mask of permission bits that are removed from the default when creating files/dirs. Default file is 666, dir 777. umask 022 removes write for group and others (2 and 2), so new files get 644 and dirs 755. Set with umask 022 or in shell profile.',
  },
  {
    id: 'd-linux-boot',
    category: 'Linux',
    question: 'Describe the typical Linux boot sequence.',
    hint: 'From power-on to login: firmware → bootloader → kernel → init.',
    answer:
      'BIOS/UEFI runs → loads bootloader (e.g. GRUB) from disk → bootloader loads kernel and initramfs → kernel mounts root filesystem, runs init (usually systemd) → systemd brings up target (e.g. graphical or multi-user), starts services, and you get a login.',
  },
  {
    id: 'd-linux-swap',
    category: 'Linux',
    question: 'What is swap and what is it used for?',
    hint: 'Think about when physical RAM is full.',
    answer:
      'Swap is disk space used as virtual memory. When RAM is full, the kernel can move less-used pages to swap to free RAM. It prevents OOM when memory is tight (at the cost of slower access). Also used for hibernation (suspend-to-disk). free -h shows swap usage.',
  },
  {
    id: 'd-linux-inode',
    category: 'Linux',
    question: 'What is an inode and what is stored in it? Why is the filename stored separately?',
    hint: 'Think about hard links: one file, multiple names.',
    answer:
      'An inode stores file metadata: owner, group, size, timestamps, and pointers to data blocks. It does not store the filename. Directory entries map filenames to inodes. Storing the name separately allows hard links: multiple directory entries (names) pointing to the same inode.',
  },
  {
    id: 'd-linux-oom',
    category: 'Linux',
    question: "When the kernel starts the OOM killer, how does it choose which process to kill first?",
    hint: 'There’s a score; root and critical processes can be protected.',
    answer:
      'The kernel assigns an oom_score to each process based on memory usage and other factors. It can also use oom_score_adj (and oom_adj) so that critical processes (e.g. systemd) get a lower score. The process with the highest score is killed first. You can tune oom_score_adj to protect important workloads.',
  },
  {
    id: 'd-linux-sticky-bit',
    category: 'Linux',
    question: 'What does the sticky bit do on a directory (e.g. /tmp)?',
    hint: 'Who can delete files in a world-writable directory?',
    answer:
      'With the sticky bit set (e.g. chmod 1777 /tmp), only the owner of a file (and root) can delete or rename it, even though the directory is world-writable. Without it, anyone could delete anyone else’s files in /tmp.',
  },
  {
    id: 'd-linux-zombie',
    category: 'Linux',
    question: 'What is a zombie process and how do you get rid of it?',
    hint: 'It has exited but still appears in ps.',
    answer:
      'A zombie (state Z) is a process that has exited but whose exit status has not been reaped by its parent (via wait()). The kernel keeps a minimal entry until the parent waits. To remove it, the parent must call wait() — or if the parent is gone, init (PID 1) will reap it. Killing a zombie does nothing; you have to fix or kill the parent.',
  },
  // --- Bash ---
  {
    id: 'd-bash-shebang',
    category: 'Bash',
    question: 'If you don’t put a shebang on the first line of a script, what happens when you run it?',
    hint: 'How does the kernel know which interpreter to use?',
    answer:
      'Without a shebang, when you run ./script the kernel may run it with the default shell (often /bin/sh). If you run it as bash script.sh, the current shell runs it. So behavior depends on how you invoke it. Best practice: use #!/bin/bash (or #!/usr/bin/env bash) for portability.',
  },
  {
    id: 'd-bash-functions-no-effect',
    category: 'Bash',
    question: 'A script defines functions and runs without errors but does nothing. What are likely causes?',
    hint: 'Defining a function doesn’t run it; and what about stderr?',
    answer:
      '1) The functions are defined but never called — you need to actually call them. 2) Errors might be hidden: e.g. stderr redirected to /dev/null, or set -e not used so failures don’t exit. 3) The script might only source definitions; the part that calls them could be in a branch that’s not executed.',
  },
  {
    id: 'd-bash-2and1',
    category: 'Bash',
    question: 'What does 2>&1 mean in a shell command?',
    hint: 'File descriptors: 1 = stdout, 2 = stderr.',
    answer:
      '2>&1 redirects stderr (fd 2) to wherever stdout (fd 1) is going. So both stdout and stderr go to the same place (e.g. a file or pipe). Order matters: command 2>&1 > file sends stderr to the current stdout, then redirects stdout to file, so only stdout goes to file. Use command > file 2>&1 or command &> file to capture both.',
  },
  // --- Docker ---
  {
    id: 'd-docker-container-vm',
    category: 'Docker',
    question: 'What is the main difference between a container and a VM?',
    hint: 'Think about kernel and isolation.',
    answer:
      'Containers share the host kernel and use namespaces + cgroups for isolation. They start quickly and are lightweight. VMs run a full guest OS with their own kernel on virtualized hardware (hypervisor). VMs give stronger isolation but are heavier and slower to boot.',
  },
  {
    id: 'd-docker-entrypoint-cmd',
    category: 'Docker',
    question: 'What is the difference between ENTRYPOINT and CMD in a Dockerfile?',
    hint: 'One is the executable, the other is often overridable arguments.',
    answer:
      'ENTRYPOINT defines the main executable (often fixed). CMD provides default arguments to that executable. When you docker run <image> myarg, myarg replaces CMD. So you typically use ENTRYPOINT for the program and CMD for default args. You can override ENTRYPOINT with --entrypoint.',
  },
  {
    id: 'd-docker-reduce-size',
    category: 'Docker',
    question: 'How would you reduce Docker image size and build time?',
    hint: 'Layers, base image, and what you copy.',
    answer:
      'Use multi-stage builds so the final image only has runtime artifacts. Use smaller base images (alpine, -slim). Use .dockerignore to exclude unneeded files from the build context. Order Dockerfile so less-changing steps (e.g. apt install) come first to improve cache hit rate. Avoid installing unnecessary packages.',
  },
  {
    id: 'd-docker-flow',
    category: 'Docker',
    question: 'Describe the flow from docker run on the CLI to a running container.',
    hint: 'CLI → daemon → containerd → OCI runtime.',
    answer:
      'The docker CLI talks to the Docker daemon (dockerd). The daemon delegates to containerd for image and container lifecycle. containerd uses an OCI runtime (e.g. runc) to create the container (namespaces, cgroups, rootfs). So: CLI → dockerd → containerd → runc → container.',
  },
  // --- Kubernetes ---
  {
    id: 'd-k8s-components',
    category: 'Kubernetes',
    question: 'What are the main components of a Kubernetes cluster?',
    hint: 'Control plane vs nodes; who schedules and who runs pods?',
    answer:
      'Control plane: API server (front door), etcd (state), scheduler (assigns pods to nodes), controller-manager (reconciliation). Nodes: kubelet (runs pods, reports status), kube-proxy (networking), container runtime (containerd, CRI-O). Optional: cloud-controller-manager for cloud integration.',
  },
  {
    id: 'd-k8s-scheduler',
    category: 'Kubernetes',
    question: 'How does the scheduler decide which node to run a pod on?',
    hint: 'Filter then score.',
    answer:
      'Scheduler first filters out nodes that don’t satisfy pod requirements (resources, node affinity, taints/tolerations, etc.). Then it scores the remaining nodes (e.g. least requested, balanced allocation). The pod is bound to the node with the best score. kubelet on that node then runs the pod.',
  },
  {
    id: 'd-k8s-canary-blue-green',
    category: 'Kubernetes',
    question: 'What is the difference between canary and blue-green deployment?',
    hint: 'When do you switch traffic — all at once or gradually?',
    answer:
      'Blue-green: two full environments (blue = old, green = new). You switch 100% of traffic to green at once. Fast rollback by switching back. Canary: you route a small percentage of traffic to the new version, then increase if metrics look good. Lower blast radius but more operational complexity.',
  },
  {
    id: 'd-k8s-master-odd',
    category: 'Kubernetes',
    question: 'Why is it recommended to have an odd number of control plane nodes (e.g. 3, 5)?',
    hint: 'Think about etcd and quorum.',
    answer:
      'etcd uses Raft and needs a majority (quorum) to commit writes. With 3 nodes, 2 must agree — you can lose 1. With 4 nodes, you still need 3, so you can only lose 1 (same as 3). Odd numbers give you one more failure tolerance without the cost of an extra node; 3 is the common choice.',
  },
  {
    id: 'd-k8s-pod-pending',
    category: 'Kubernetes',
    question: 'A pod is stuck in Pending. How do you troubleshoot?',
    hint: 'kubectl describe pod and look at Events.',
    answer:
      'Run kubectl describe pod <name> and check Events. Common causes: insufficient CPU/memory on any node (reduce requests or add nodes), no node matches node affinity, no node has a matching toleration for taints, or PVC is stuck in Pending (e.g. no StorageClass or provisioner). Fix by adjusting pod spec or cluster resources.',
  },
  {
    id: 'd-k8s-cordon-drain',
    category: 'Kubernetes',
    question: 'What is the difference between kubectl cordon and kubectl drain?',
    hint: 'One only prevents new pods; the other also removes existing ones.',
    answer:
      'cordon: marks the node unschedulable so no new pods are placed on it. Existing pods keep running. drain: cordons the node and then evicts existing pods (respecting PDBs and graceful termination). Use drain when you need to take the node down for maintenance.',
  },
  {
    id: 'd-k8s-pdb',
    category: 'Kubernetes',
    question: 'What is a Pod Disruption Budget (PDB) and when is it used?',
    hint: 'Voluntary disruptions: drain, upgrade, scale-down.',
    answer:
      'A PDB limits how many pods of a given set can be unavailable at once (minAvailable or maxUnavailable). During voluntary disruptions (e.g. kubectl drain, node upgrade, cluster autoscaler scale-down), the eviction API respects PDBs so you don’t take down too many replicas and violate availability.',
  },
  {
    id: 'd-k8s-crd-operator',
    category: 'Kubernetes',
    question: 'What is a CRD and what is an operator?',
    hint: 'Custom resources and who manages their lifecycle.',
    answer:
      'A CRD (Custom Resource Definition) extends the Kubernetes API with new resource types (e.g. MyApp, Database). An operator is a controller that watches those custom resources and reconciles real-world state (e.g. create a DB, update config). It encodes operational knowledge in code.',
  },
  // --- Terraform ---
  {
    id: 'd-tf-state',
    category: 'Terraform',
    question: 'What is the Terraform state file and why is it important?',
    hint: 'It tracks what Terraform created in the real world.',
    answer:
      'State stores the mapping between your config and real resource IDs/attributes. Terraform uses it to plan changes (diff) and to update or destroy the right resources. Without it, Terraform wouldn’t know what already exists. For teams, use remote state (e.g. S3) with locking so only one apply runs at a time.',
  },
  {
    id: 'd-tf-import',
    category: 'Terraform',
    question: 'How do you bring an existing resource (created manually or in the console) under Terraform management?',
    hint: 'Import adds it to state; then you add the resource block.',
    answer:
      'Use terraform import <resource_address> <resource_id> to add the existing resource to state. Then add the corresponding resource block to your .tf so the config matches reality. Future applies will update the resource from config instead of recreating it.',
  },
  {
    id: 'd-tf-count-foreach',
    category: 'Terraform',
    question: 'What is the difference between count and for_each in Terraform?',
    hint: 'One uses an integer; the other uses a set or map.',
    answer:
      'count: creates N instances (e.g. count = 3 gives indices 0, 1, 2). Adding/removing an item in the middle can cause unnecessary churn. for_each: takes a set or map; each key gets one instance. Adding/removing a key only affects that instance, so it’s often better for lists of things.',
  },
  // --- CI/CD ---
  {
    id: 'd-cicd-meaning',
    category: 'CI/CD',
    question: 'What do CI and CD mean to you?',
    hint: 'Integration = build/test on every change; Delivery/Deployment = release automation.',
    answer:
      'CI (Continuous Integration): every code change triggers a build and tests (unit, lint, etc.) so you catch breakage early. CD can mean Continuous Delivery (always deployable, maybe manual release) or Continuous Deployment (every change that passes goes to production). Pipelines automate build, test, and deploy steps.',
  },
  {
    id: 'd-cicd-pipeline-speed',
    category: 'CI/CD',
    question: 'How would you make a CI/CD pipeline faster?',
    hint: 'Cache, parallelize, and only run what changed.',
    answer:
      'Cache dependencies (e.g. npm, pip, Docker layers). Run independent jobs in parallel (e.g. lint and test at the same time). Use smaller base images and multi-stage Docker builds. Only build/test what changed (path filters, incremental builds). Use faster runners or more of them. Avoid unnecessary steps.',
  },
  // --- Ansible ---
  {
    id: 'd-ansible-what',
    category: 'Ansible',
    question: 'What is Ansible and how does it differ from running shell scripts?',
    hint: 'Agentless, idempotent, declarative.',
    answer:
      'Ansible is agentless config management and automation: you run it from a control node over SSH (or WinRM). Playbooks are declarative (describe desired state) and tasks are usually idempotent (safe to run multiple times). It has modules for packages, files, services, etc., and handles inventory and templating. Scripts are imperative and often not idempotent.',
  },
  {
    id: 'd-ansible-role',
    category: 'Ansible',
    question: 'What is an Ansible role and when would you use one?',
    hint: 'Reusable unit of tasks, vars, handlers, files.',
    answer:
      'A role is a reusable unit with a standard layout: tasks/, handlers/, defaults/, vars/, files/, templates/, meta/. You use roles to organize playbooks and share logic (e.g. “nginx” role, “docker” role). Playbooks include roles with roles: or import_role. Roles can be shared via Galaxy or internal repos.',
  },
  // --- AWS ---
  {
    id: 'd-aws-ec2-vs-lambda',
    category: 'AWS',
    question: 'When would you choose EC2 over Lambda (or the other way around)?',
    hint: 'Long-running vs event-driven; control vs simplicity.',
    answer:
      'EC2: long-running or stateful workloads, full OS control, predictable performance, need for specific OS or network setup. Lambda: event-driven, short-lived (minutes), scale to zero, no server management; good for APIs, file processing, event handlers. Lambda has timeout and size limits; EC2 is more flexible but you manage the server.',
  },
  {
    id: 'd-aws-iam-best-practice',
    category: 'AWS',
    question: 'What IAM best practices would you recommend?',
    hint: 'Least privilege, no long-term keys in code, MFA.',
    answer:
      'Principle of least privilege: grant only the permissions needed. Prefer IAM roles (for EC2, Lambda, ECS) over long-term access keys. Avoid root; use MFA for humans. Rotate credentials; use temporary credentials (STS) where possible. Use conditions (e.g. MFA, IP) to restrict access. Prefer managed policies and avoid inline policies when reuse is needed.',
  },
  {
    id: 'd-aws-high-availability',
    category: 'AWS',
    question: 'How would you design for high availability on AWS?',
    hint: 'Multi-AZ, load balancing, health checks.',
    answer:
      'Use multiple Availability Zones (e.g. ALB across AZs, RDS Multi-AZ, EKS control plane multi-AZ). Put resources behind a load balancer (ALB/NLB) with health checks. Use Auto Scaling so unhealthy instances are replaced. For stateful systems, use managed services with built-in HA (RDS, ElastiCache) or design for failure (e.g. DynamoDB global tables).',
  },
  {
    id: 'd-aws-s3-consistency',
    category: 'AWS',
    question: 'What is S3’s consistency model for reads and writes?',
    hint: 'New and overwrite PUTs; eventual vs strong.',
    answer:
      'S3 now provides strong read-after-write consistency for all GET, PUT, DELETE, and LIST operations. So after a successful write, any read will see the latest data. (Historically, S3 had eventual consistency for overwrite PUTs and DELETEs; that’s no longer the case.)',
  },
  {
    id: 'd-aws-vpc-subnet',
    category: 'AWS',
    question: 'What is a VPC and how do public vs private subnets differ?',
    hint: 'Routing and internet gateway vs NAT.',
    answer:
      'VPC is your isolated network in AWS. Subnets are segments (often per AZ). Public subnet: has a route to an Internet Gateway (0.0.0.0/0 → igw-xxx); instances can get a public IP and be reached from the internet. Private subnet: no direct route to IGW; outbound traffic goes through a NAT Gateway/NAT instance if you add that route. DBs and app servers often live in private subnets.',
  },
  {
    id: 'd-aws-cost-optimization',
    category: 'AWS',
    question: 'What are some ways to optimize AWS costs?',
    hint: 'Right-sizing, reserved capacity, lifecycle, waste.',
    answer:
      'Right-size instances (use metrics to pick instance types). Use Reserved Instances or Savings Plans for steady workloads. Use Spot for fault-tolerant or interruptible workloads. Clean up unused resources (old EBS, snapshots, idle load balancers). Use S3 lifecycle policies and appropriate storage classes. Monitor with Cost Explorer and set budgets/alerts.',
  },
  // --- General DevOps ---
  {
    id: 'd-devops-culture',
    category: 'General DevOps',
    question: 'What does “DevOps culture” mean to you?',
    hint: 'Collaboration, ownership, feedback, automation.',
    answer:
      'It’s about breaking down silos between dev and ops: shared ownership of the full lifecycle, from code to production. Emphasizes automation (CI/CD, IaC), feedback loops (monitoring, blameless postmortems), and iterative improvement. “You build it, you run it” and reducing toil so teams can focus on reliability and features.',
  },
  {
    id: 'd-devops-incident',
    category: 'General DevOps',
    question: 'How do you approach incident response when production is down?',
    hint: 'Assess, communicate, mitigate, then fix root cause.',
    answer:
      '1) Acknowledge and assess impact (who/what is affected). 2) Communicate (status page, stakeholders, on-call). 3) Mitigate: restore service (rollback, scale up, failover, disable feature) even if it’s a workaround. 4) Fix root cause and add safeguards. 5) Post-incident review: what happened, what we’ll do differently, and follow-up actions.',
  },
  {
    id: 'd-devops-slo-sli',
    category: 'General DevOps',
    question: 'What are SLOs and SLIs? How would you use them?',
    hint: 'Indicator = metric; Objective = target.',
    answer:
      'SLI (Service Level Indicator) is a measurable metric (e.g. availability, latency, error rate). SLO (Service Level Objective) is a target for that metric (e.g. 99.9% availability). You choose a few SLIs that matter to users, set SLOs, monitor them, and use error budgets (how much “unreliability” is allowed) to decide when to focus on reliability vs new features.',
  },
  {
    id: 'd-devops-secrets',
    category: 'General DevOps',
    question: 'How would you manage secrets in a CI/CD pipeline and in production?',
    hint: 'Never in code; use a secret manager and short-lived credentials.',
    answer:
      'Never store secrets in code or plain config. Use a secret manager (e.g. HashiCorp Vault, AWS Secrets Manager, cloud provider secrets) and inject at runtime or in the pipeline. In CI/CD, use the platform’s secret store (e.g. GitHub Secrets, GitLab CI variables) and restrict access. Prefer short-lived credentials and IAM roles over long-term keys. Rotate regularly and audit access.',
  },
  {
    id: 'd-devops-observability',
    category: 'General DevOps',
    question: 'What do you consider “observability” and how does it differ from “monitoring”?',
    hint: 'Logs, metrics, traces; and asking new questions.',
    answer:
      'Monitoring often means watching known metrics and alerting when they break. Observability is the ability to understand system state from the outside using logs, metrics, and traces — and to ask new questions without changing code. You need structured logs, metrics (e.g. Prometheus), and distributed tracing to debug complex, distributed systems.',
  },
  {
    id: 'd-devops-blue-green-canary',
    category: 'General DevOps',
    question: 'When would you choose blue-green over canary (or vice versa)?',
    hint: 'Risk, rollback speed, and operational complexity.',
    answer:
      'Blue-green: simple, fast rollback (flip traffic back). Good when you want minimal risk window and can run two full environments. Canary: lower blast radius, catch issues with a small % of traffic before full rollout. Good when you can’t afford two full stacks or want to validate with real traffic. Canary needs good metrics and automation.',
  },
];

export const DISCUSSION_CATEGORIES: InterviewDiscussionQuestion['category'][] = [
  'Linux',
  'Bash',
  'Docker',
  'Kubernetes',
  'Terraform',
  'CI/CD',
  'Ansible',
  'AWS',
  'General DevOps',
];
