# APISec Training · OWASP API Security Labs

A trainer-side reference platform for running hands-on OWASP API Security Top 10 (2023) workshops using [crAPI](https://github.com/OWASP/crAPI) and Burp Suite Community Edition.

## What this is

A single-page HTML reference guide covering all 10 OWASP API Security categories (API1–API10), each mapped to real crAPI challenges with full reproduction steps — from reconnaissance to working exploit to remediation guidance. Written so a trainer can run labs live on screen without rehearsal.

> **Trainer-only material.** There is a [separate platform for trainees](https://bishalcpgn.github.io/DevSecOps-Training-Genese-API-Security-Labs-Trainees-Guide-/#welcome). It will be shared with trainees after training is over.



## Lab modules

| # | OWASP Category | crAPI Challenges |
|---|---------------|-----------------|
| API1 | Broken Object Level Authorization | #1 |
| API2 | Broken Authentication | #3, #15 (JWT forgery) |
| API3 | Broken Object Property Level Authorization | #8, #9 |
| API4 | Unrestricted Resource Use | #6 |
| API5 | Broken Function Level Authorization | #7 |
| API6 | Sensitive Business Flows | #9 (automated) |
| API7 | Server-Side Request Forgery | #11 |
| API8 | Security Misconfiguration | #14 |
| API9 | Improper Inventory Management | #3 (embedded) |
| API10 | Unsafe API Consumption | #12 |

## Project structure

```
.
├── index.html       # Main trainer reference platform
├── css/
│   ├── style.css    # Layout and component styles
│   └── themes.css   # Light/dark theme variables
└── js/              # Progress tracking and UI logic
```

## References

- [OWASP API Security Top 10 (2023)](https://owasp.org/API-Security/editions/2023/en/0x00-header/)
- [OWASP crAPI](https://github.com/OWASP/crAPI)
- [crAPI Challenge List](https://owasp.org/crAPI/docs/challenges.html)
- [Burp Suite Community Edition](https://portswigger.net/burp/communitydownload)
