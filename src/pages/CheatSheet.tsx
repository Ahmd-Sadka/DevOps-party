import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Search, BookOpen, Copy, Check } from 'lucide-react';

interface CheatSheetEntry {
  command: string;
  description: string;
  example: string;
  flags?: string;
}

interface CheatSheetCategory {
  id: string;
  name: string;
  emoji: string;
  entries: CheatSheetEntry[];
}

const CHEAT_SHEET_DATA: CheatSheetCategory[] = [
  {
    id: 'linux',
    name: 'Linux',
    emoji: '🐧',
    entries: [
      { command: 'ls -la', description: 'List all files including hidden, with details', example: 'ls -la /etc/', flags: '-l (long), -a (all), -h (human-readable)' },
      { command: 'chmod', description: 'Change file permissions', example: 'chmod 755 script.sh', flags: '-R (recursive)' },
      { command: 'chown', description: 'Change file ownership', example: 'chown user:group file.txt', flags: '-R (recursive)' },
      { command: 'grep', description: 'Search text patterns in files', example: 'grep -r "error" /var/log/', flags: '-r (recursive), -i (case-insensitive), -n (line numbers)' },
      { command: 'find', description: 'Find files by criteria', example: 'find / -name "*.log" -size +100M', flags: '-name, -type, -size, -mtime, -exec' },
      { command: 'ps aux', description: 'List all running processes', example: 'ps aux | grep nginx' },
      { command: 'kill', description: 'Send signal to a process', example: 'kill -9 1234', flags: '-9 (SIGKILL), -15 (SIGTERM)' },
      { command: 'df -h', description: 'Show disk space usage', example: 'df -h /' },
      { command: 'du -sh', description: 'Show directory size', example: 'du -sh /var/log/*' },
      { command: 'top / htop', description: 'Interactive process monitor', example: 'htop' },
      { command: 'systemctl', description: 'Manage systemd services', example: 'systemctl restart nginx', flags: 'start, stop, restart, status, enable, disable' },
      { command: 'journalctl', description: 'View systemd logs', example: 'journalctl -u nginx -f', flags: '-u (unit), -f (follow), --since, --until' },
      { command: 'tail -f', description: 'Follow file output in real-time', example: 'tail -f /var/log/syslog', flags: '-n (lines), -f (follow)' },
      { command: 'curl', description: 'Transfer data from/to a server', example: 'curl -v https://api.example.com', flags: '-v (verbose), -o (output), -H (header), -X (method)' },
      { command: 'ssh', description: 'Secure shell remote login', example: 'ssh user@host -i key.pem', flags: '-i (identity file), -p (port), -L (tunnel)' },
      { command: 'scp', description: 'Secure copy files over SSH', example: 'scp file.txt user@host:/path/', flags: '-r (recursive), -P (port)' },
    ],
  },
  {
    id: 'git',
    name: 'Git',
    emoji: '🌱',
    entries: [
      { command: 'git init', description: 'Initialize a new Git repository', example: 'git init my-project' },
      { command: 'git clone', description: 'Clone a remote repository', example: 'git clone https://github.com/org/repo.git', flags: '--depth 1 (shallow)' },
      { command: 'git status', description: 'Show working tree status', example: 'git status' },
      { command: 'git add', description: 'Stage changes for commit', example: 'git add -A', flags: '-A (all), -p (patch/interactive)' },
      { command: 'git commit', description: 'Record changes to the repository', example: 'git commit -m "feat: add login"', flags: '-m (message), --amend' },
      { command: 'git branch', description: 'List, create, or delete branches', example: 'git branch feature/login', flags: '-d (delete), -a (all)' },
      { command: 'git checkout', description: 'Switch branches or restore files', example: 'git checkout -b new-branch', flags: '-b (create+switch)' },
      { command: 'git merge', description: 'Merge branches together', example: 'git merge feature/login', flags: '--no-ff (no fast-forward)' },
      { command: 'git rebase', description: 'Reapply commits on top of another base', example: 'git rebase main' },
      { command: 'git stash', description: 'Temporarily save uncommitted changes', example: 'git stash push -m "WIP"', flags: 'push, pop, list, drop' },
      { command: 'git log', description: 'Show commit history', example: 'git log --oneline --graph', flags: '--oneline, --graph, --author' },
      { command: 'git reset', description: 'Reset HEAD to a specific state', example: 'git reset --soft HEAD~1', flags: '--soft (keep staged), --hard (discard all)' },
      { command: 'git revert', description: 'Create a new commit that undoes changes', example: 'git revert abc1234' },
      { command: 'git cherry-pick', description: 'Apply a specific commit to current branch', example: 'git cherry-pick abc1234' },
    ],
  },
  {
    id: 'docker',
    name: 'Docker',
    emoji: '🐳',
    entries: [
      { command: 'docker build', description: 'Build an image from a Dockerfile', example: 'docker build -t myapp:v1 .', flags: '-t (tag), -f (dockerfile), --no-cache' },
      { command: 'docker run', description: 'Create and start a container', example: 'docker run -d -p 8080:80 --name web nginx', flags: '-d (detach), -p (port), -v (volume), -e (env), --rm' },
      { command: 'docker ps', description: 'List running containers', example: 'docker ps -a', flags: '-a (all), -q (quiet/IDs only)' },
      { command: 'docker exec', description: 'Run a command in a running container', example: 'docker exec -it web bash', flags: '-it (interactive terminal)' },
      { command: 'docker logs', description: 'View container logs', example: 'docker logs -f web', flags: '-f (follow), --tail N' },
      { command: 'docker stop', description: 'Stop a running container', example: 'docker stop web' },
      { command: 'docker rm', description: 'Remove a stopped container', example: 'docker rm -f web', flags: '-f (force)' },
      { command: 'docker images', description: 'List images', example: 'docker images' },
      { command: 'docker rmi', description: 'Remove an image', example: 'docker rmi myapp:v1' },
      { command: 'docker-compose up', description: 'Start services defined in docker-compose.yml', example: 'docker-compose up -d', flags: '-d (detach), --build, --scale' },
      { command: 'docker volume', description: 'Manage volumes', example: 'docker volume create mydata', flags: 'create, ls, rm, inspect' },
      { command: 'docker network', description: 'Manage networks', example: 'docker network create mynet', flags: 'create, ls, connect, disconnect' },
      { command: 'docker system prune', description: 'Remove unused data', example: 'docker system prune -a', flags: '-a (all), --volumes' },
    ],
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes',
    emoji: '☸️',
    entries: [
      { command: 'kubectl get', description: 'List resources', example: 'kubectl get pods -n default', flags: '-n (namespace), -o wide/yaml/json, -A (all namespaces)' },
      { command: 'kubectl describe', description: 'Show detailed info about a resource', example: 'kubectl describe pod mypod' },
      { command: 'kubectl apply', description: 'Apply configuration from file', example: 'kubectl apply -f deployment.yaml', flags: '-f (file), -k (kustomize)' },
      { command: 'kubectl delete', description: 'Delete resources', example: 'kubectl delete pod mypod', flags: '--grace-period=0 --force' },
      { command: 'kubectl logs', description: 'View pod logs', example: 'kubectl logs mypod -c mycontainer', flags: '-f (follow), --previous, -c (container)' },
      { command: 'kubectl exec', description: 'Execute command in a container', example: 'kubectl exec -it mypod -- bash', flags: '-it (interactive), -c (container)' },
      { command: 'kubectl scale', description: 'Scale a deployment', example: 'kubectl scale deploy web --replicas=5' },
      { command: 'kubectl rollout', description: 'Manage rollouts', example: 'kubectl rollout restart deploy web', flags: 'status, history, undo, restart' },
      { command: 'kubectl port-forward', description: 'Forward local port to pod', example: 'kubectl port-forward svc/web 8080:80' },
      { command: 'kubectl create secret', description: 'Create a secret', example: 'kubectl create secret generic db-pass --from-literal=pw=s3cret' },
      { command: 'kubectl get events', description: 'View cluster events', example: 'kubectl get events --sort-by=.lastTimestamp' },
      { command: 'kubectl top', description: 'Show resource usage', example: 'kubectl top pods', flags: 'pods, nodes' },
    ],
  },
  {
    id: 'terraform',
    name: 'Terraform',
    emoji: '🏗️',
    entries: [
      { command: 'terraform init', description: 'Initialize working directory, download providers', example: 'terraform init' },
      { command: 'terraform plan', description: 'Preview changes before applying', example: 'terraform plan -out=tfplan', flags: '-out (save plan), -var' },
      { command: 'terraform apply', description: 'Apply infrastructure changes', example: 'terraform apply tfplan', flags: '-auto-approve, -var' },
      { command: 'terraform destroy', description: 'Destroy all managed infrastructure', example: 'terraform destroy', flags: '-target (specific resource)' },
      { command: 'terraform state', description: 'Manage state file', example: 'terraform state list', flags: 'list, show, mv, rm' },
      { command: 'terraform import', description: 'Import existing resource into state', example: 'terraform import aws_instance.web i-1234567890' },
      { command: 'terraform output', description: 'Show output values', example: 'terraform output vpc_id' },
      { command: 'terraform fmt', description: 'Format config files', example: 'terraform fmt -recursive' },
      { command: 'terraform validate', description: 'Validate configuration syntax', example: 'terraform validate' },
    ],
  },
  {
    id: 'ansible',
    name: 'Ansible',
    emoji: '🤖',
    entries: [
      { command: 'ansible-playbook', description: 'Run an Ansible playbook', example: 'ansible-playbook site.yml -i inventory', flags: '-i (inventory), -l (limit), -t (tags), --check' },
      { command: 'ansible', description: 'Run ad-hoc commands', example: 'ansible all -m ping', flags: '-m (module), -a (arguments), -b (become)' },
      { command: 'ansible-galaxy', description: 'Manage roles from Galaxy', example: 'ansible-galaxy install geerlingguy.docker', flags: 'init, install, list' },
      { command: 'ansible-vault', description: 'Encrypt/decrypt sensitive data', example: 'ansible-vault encrypt secrets.yml', flags: 'encrypt, decrypt, view, edit' },
      { command: 'ansible-inventory', description: 'Show inventory information', example: 'ansible-inventory --list -i inventory.yml', flags: '--list, --graph' },
    ],
  },
  {
    id: 'aws-cli',
    name: 'AWS CLI',
    emoji: '☁️',
    entries: [
      { command: 'aws s3 ls', description: 'List S3 buckets or objects', example: 'aws s3 ls s3://mybucket/' },
      { command: 'aws s3 cp', description: 'Copy files to/from S3', example: 'aws s3 cp file.txt s3://mybucket/', flags: '--recursive' },
      { command: 'aws ec2 describe-instances', description: 'List EC2 instances', example: 'aws ec2 describe-instances --filters "Name=tag:Env,Values=prod"' },
      { command: 'aws iam list-users', description: 'List IAM users', example: 'aws iam list-users' },
      { command: 'aws sts get-caller-identity', description: 'Show current AWS identity', example: 'aws sts get-caller-identity' },
      { command: 'aws logs tail', description: 'Tail CloudWatch log group', example: 'aws logs tail /ecs/my-service --follow' },
      { command: 'aws eks update-kubeconfig', description: 'Configure kubectl for EKS', example: 'aws eks update-kubeconfig --name my-cluster' },
    ],
  },
];

const CheatSheet = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    const searchLower = search.toLowerCase();
    return CHEAT_SHEET_DATA
      .filter(cat => !selectedCategory || cat.id === selectedCategory)
      .map(cat => ({
        ...cat,
        entries: cat.entries.filter(entry =>
          !search ||
          entry.command.toLowerCase().includes(searchLower) ||
          entry.description.toLowerCase().includes(searchLower) ||
          entry.example.toLowerCase().includes(searchLower)
        ),
      }))
      .filter(cat => cat.entries.length > 0);
  }, [search, selectedCategory]);

  const totalEntries = filteredData.reduce((sum, cat) => sum + cat.entries.length, 0);

  const handleCopy = (command: string) => {
    navigator.clipboard.writeText(command);
    setCopiedCommand(command);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Command Cheat Sheet</h1>
              <p className="text-xs text-muted-foreground">Quick reference for DevOps commands</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search commands... (e.g. kubectl logs, chmod, docker run)"
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl outline-none focus:border-primary transition-colors text-sm"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All ({totalEntries})
          </Button>
          {CHEAT_SHEET_DATA.map(cat => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            >
              {cat.emoji} {cat.name}
            </Button>
          ))}
        </div>

        {/* Results */}
        <div className="space-y-6">
          {filteredData.map(cat => (
            <div key={cat.id}>
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span>{cat.emoji}</span> {cat.name}
                <span className="text-xs text-muted-foreground font-normal">({cat.entries.length})</span>
              </h2>
              <div className="space-y-2">
                {cat.entries.map((entry, i) => (
                  <Card key={i} className="p-4 hover:border-primary/30 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-sm font-bold text-primary font-mono">{entry.command}</code>
                          <button
                            onClick={() => handleCopy(entry.example)}
                            className="p-1 rounded hover:bg-muted transition-colors"
                            title="Copy example"
                          >
                            {copiedCommand === entry.example ? (
                              <Check className="h-3 w-3 text-green-400" />
                            ) : (
                              <Copy className="h-3 w-3 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{entry.description}</p>
                        <pre className="text-xs font-mono bg-muted px-3 py-1.5 rounded overflow-x-auto">{entry.example}</pre>
                        {entry.flags && (
                          <p className="text-xs text-muted-foreground/60 mt-1.5">Flags: {entry.flags}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground">No commands found for "{search}"</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheatSheet;
