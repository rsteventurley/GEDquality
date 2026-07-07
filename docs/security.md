# Security Architecture

This documents the security posture of GEDquality and LLMquality as of the 2026-07-07
migration to us-east-1. Full design rationale and the exact commands used are in
LLMquality's repo: `docs/superpowers/specs/2026-07-07-us-east-1-alb-migration-design.md`
and `docs/superpowers/plans/2026-07-07-us-east-1-alb-migration-plan.md` (the two apps
share the same migration, planned and executed together).

## Before

Both apps ran as PM2 processes on a single shared EC2 instance in us-west-2, directly
reachable on their raw ports (3000, 3001) over plain HTTP at a public IP, with SSH
enabled and an IAM instance profile carrying broad `s3:*` access neither app used.

## After: how the two apps are organized now

```
Internet
   |
   v
[ALB: quality-apps-alb]  (public subnets, HTTPS:443 only, TLS via ACM cert)
   |-- Host: gedquality.researchllm.org --> [gedquality-tg :3001] --> [gedquality-app EC2] (private subnet)
   |-- Host: llmquality.researchllm.org --> [llmquality-tg :3000] --> [llmquality-app EC2] (private subnet)
```

- **One dedicated EC2 instance per app** (`gedquality-app`, `llmquality-app`), each in a
  private subnet of `ResearchPublicPrivateVPC` — no public IP, no route to the internet
  except outbound via the VPC's NAT Gateway.
- **A single ALB is the only internet-facing component.** It terminates TLS and routes
  by hostname to the correct app's target group. Neither app instance is reachable
  directly — only from the ALB, and only on that app's specific port.
- GEDquality runs under its own **systemd** service (`gedquality.service`), restarting
  automatically on crash or reboot.

## How this hardens security

**Network isolation.** The instance's security group (`GEDqualityAppSG`) allows inbound
traffic *only* from the ALB's security group, on port 3001 — nothing else, from nowhere
else. Previously the app was reachable directly from the internet on its raw port.

**No SSH, anywhere.** The instance has no SSH port open and no key pair assigned. All
administrative access goes through AWS Systems Manager Session Manager, which needs no
inbound security group rule at all — there's no long-lived SSH key to leak, rotate, or
brute-force.

**TLS everywhere in transit from the browser.** `gedquality.researchllm.org` is served
over HTTPS with a certificate issued and DNS-validated through ACM. The previous setup
served plain HTTP on a raw port.

**Least-privilege IAM.** The instance uses a shared IAM role,
`EC2_Research_Quality_WebService` (also used by llmquality-app), which grants only
`AmazonSSMManagedInstanceCore` — enough to be managed via SSM, nothing else. The
previous instance profile granted account-wide `s3:*` and `ec2:StopInstances`, neither
of which GEDquality's code ever uses (it has no AWS SDK dependency). If the app were
ever compromised via a malicious upload, the blast radius is now "can call SSM APIs,"
not "can read/write any S3 bucket in the account."

**App-level hardening was already in place.** GEDquality already had `helmet`
(security response headers, restrictive default CSP), `express-rate-limit` on its
upload/check endpoints, file-type enforcement (`.ged` only), and a 10MB upload cap —
this is the pattern LLMquality was brought up to match as part of this same migration.

**Automated failure detection.** A CloudWatch alarm (`gedquality-tg-unhealthy`) watches
the target group's `UnHealthyHostCount` and notifies an SNS topic (email) the moment
the app goes down — one notification per failure, not a flood, and a fresh one if it
recovers and fails again. Previously an outage would go unnoticed until someone
happened to check.

**Isolation from LLMquality.** Each app has its own instance, its own security group,
and its own target group. A crash, resource exhaustion, or compromise in one app has no
direct path to affecting the other — they only share the outer ALB and the IAM role
(which grants no meaningful privilege to begin with).

## What's deliberately not in place yet

**AWS WAF** is not attached to the ALB. See the "Web Application Firewall (WAF)"
section in this repo's `README.md` (and LLMquality's) for why, what would indicate it's
needed, and how to add it later — it's purely additive to the existing ALB, no
redesign required.

**No auto-scaling / multi-instance redundancy.** The target group has exactly one
instance. Acceptable at current traffic levels; the ALB/target-group pattern already
supports adding more instances later without any architectural change.
