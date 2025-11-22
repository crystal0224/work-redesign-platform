# Work Redesign Platform - 프로덕션 배포 마스터 플랜

> **목표**: 실제 팀장 워크샵에서 30-50명의 팀장이 동시에 안전하게 사용할 수 있는 엔터프라이즈급 시스템 구축

**작성일**: 2025-11-22
**작성자**: Senior Engineering Team
**예상 소요 기간**: 3-4주 (단계별 병렬 작업 가능)

---

## 📊 현재 시스템 분석 (As-Is)

### ✅ 구축된 기반
- **Backend**: TypeScript + Express + Prisma ORM + PostgreSQL + Redis + Socket.IO
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Database Schema**: 완전히 정의됨 (User, Team, WorkshopSession, Task, AI Analysis)
- **Docker**: Production 환경 docker-compose 설정 완료
- **모니터링 스택**: Prometheus + Grafana + Loki (optional profiles)
- **API Documentation**: 기본 구조 존재

### ⚠️ 해결 필요 사항
1. **멀티테넌시**: 현재 단일 워크샵 세션 기반, 동시 다중 사용자 격리 필요
2. **인증/권한**: SK SSO 통합 미완성
3. **클라우드 배포**: 로컬 환경만 존재
4. **확장성**: 수평 확장 미구현
5. **모니터링**: 선택적 프로파일, 프로덕션 필수 설정 필요
6. **CI/CD**: 파이프라인 미구성
7. **백업**: 자동 백업 전략 없음
8. **성능**: 부하 테스트 미실시

---

## 🎯 Phase 1: 멀티테넌시 및 인증 시스템 (Week 1)

### 1.1 멀티테넌시 아키텍처 설계 ⭐⭐⭐

**문제**: 여러 팀장이 동시에 독립적인 워크샵 세션을 진행해야 함

**해결 방안**: Session-based Multi-tenancy (이미 Prisma schema에 기반 구조 존재)

#### 구현 작업
- [ ] **세션 격리 미들웨어 구현**
  ```typescript
  // backend/src/middleware/session-isolation.ts
  export const sessionIsolationMiddleware = async (req, res, next) => {
    const sessionId = req.headers['x-session-id'] || req.query.sessionId;
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    // Verify session exists and user has access
    const session = await prisma.workshopSession.findFirst({
      where: {
        id: sessionId,
        OR: [
          { createdBy: req.user.id },
          { participants: { some: { id: req.user.id } } }
        ]
      }
    });

    if (!session) {
      return res.status(403).json({ error: 'Access denied to this session' });
    }

    req.sessionContext = session;
    next();
  };
  ```

- [ ] **동시 세션 관리 서비스**
  - Redis를 활용한 세션 상태 관리
  - 세션별 리소스 사용량 추적
  - 최대 동시 세션 제한 (50개)

- [ ] **데이터베이스 쿼리 필터링**
  - 모든 DB 조회에 sessionId 필터 자동 적용
  - Prisma middleware를 활용한 자동 격리

- [ ] **Socket.IO 네임스페이스 분리**
  ```typescript
  // 각 워크샵 세션마다 독립적인 Socket 네임스페이스
  io.of(`/workshop/${sessionId}`).on('connection', (socket) => {
    // Session-specific real-time communication
  });
  ```

**예상 소요**: 3-4일
**우선순위**: 🔴 Critical

---

### 1.2 SK SSO 통합 및 인증 시스템 ⭐⭐⭐

**목표**: 기업 SSO를 통한 안전한 인증 및 세션 관리

#### 구현 작업
- [ ] **SK SSO OAuth2.0 통합**
  ```typescript
  // backend/src/auth/sso.service.ts
  class SSOService {
    async authenticateWithSK(code: string): Promise<User> {
      // 1. Exchange code for access token
      const tokenResponse = await axios.post(
        `${process.env.SK_SSO_URL}/oauth/token`,
        {
          grant_type: 'authorization_code',
          code,
          client_id: process.env.SK_SSO_CLIENT_ID,
          client_secret: process.env.SK_SSO_CLIENT_SECRET,
          redirect_uri: process.env.SK_SSO_REDIRECT_URI
        }
      );

      // 2. Get user info
      const userInfo = await axios.get(
        `${process.env.SK_SSO_URL}/api/user`,
        {
          headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` }
        }
      );

      // 3. Create or update user in database
      const user = await prisma.user.upsert({
        where: { email: userInfo.data.email },
        update: {
          name: userInfo.data.name,
          department: userInfo.data.department,
          position: userInfo.data.position
        },
        create: {
          email: userInfo.data.email,
          name: userInfo.data.name,
          department: userInfo.data.department,
          position: userInfo.data.position,
          role: this.determineRole(userInfo.data)
        }
      });

      return user;
    }

    private determineRole(userInfo: any): UserRole {
      // Logic to determine if user is TEAM_LEADER or TEAM_MEMBER
      return userInfo.isLeader ? 'TEAM_LEADER' : 'TEAM_MEMBER';
    }
  }
  ```

- [ ] **JWT 기반 세션 관리**
  - Access Token (15분 유효)
  - Refresh Token (7일 유효, Redis에 저장)
  - Token rotation 구현

- [ ] **Role-Based Access Control (RBAC)**
  ```typescript
  enum Permission {
    CREATE_SESSION = 'session:create',
    MANAGE_SESSION = 'session:manage',
    VIEW_SESSION = 'session:view',
    MANAGE_TEAM = 'team:manage',
    ADMIN_PANEL = 'admin:access'
  }

  const rolePermissions = {
    TEAM_LEADER: [
      Permission.CREATE_SESSION,
      Permission.MANAGE_SESSION,
      Permission.MANAGE_TEAM,
      Permission.VIEW_SESSION
    ],
    TEAM_MEMBER: [
      Permission.VIEW_SESSION
    ],
    ADMIN: Object.values(Permission)
  };
  ```

- [ ] **인증 미들웨어 체인**
  ```typescript
  router.post('/workshops',
    authenticate,           // JWT 검증
    requireRole('TEAM_LEADER'), // 역할 확인
    rateLimit({ max: 10 }), // Rate limiting
    createWorkshopHandler
  );
  ```

**예상 소요**: 4-5일
**우선순위**: 🔴 Critical

---

### 1.3 사용자 경험 개선

- [ ] **팀장별 대시보드**
  - 진행 중인 워크샵 세션 목록
  - 과거 워크샵 히스토리
  - 팀 성과 대시보드

- [ ] **실시간 참여자 표시**
  - 현재 워크샵에 참여 중인 팀원 실시간 표시
  - 팀원 진행 상황 모니터링

- [ ] **세션 초대 기능**
  - 이메일/링크를 통한 팀원 초대
  - 초대 코드 생성 및 관리

**예상 소요**: 3일
**우선순위**: 🟡 High

---

## 🏗️ Phase 2: 인프라 및 배포 환경 (Week 1-2)

### 2.1 클라우드 인프라 선택 및 설계 ⭐⭐⭐

**권장 플랫폼**: AWS (기업 표준, 확장성, SK 계정 활용)

#### 아키텍처 설계

```
┌─────────────────────────────────────────────────────────────┐
│                      Route 53 (DNS)                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              CloudFront (CDN) + WAF                          │
│              - Static assets caching                         │
│              - DDoS protection                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│         Application Load Balancer (ALB)                      │
│         - SSL termination                                    │
│         - Health checks                                      │
│         - Auto-scaling target                                │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
    ┌─────────────────────┐    ┌─────────────────────┐
    │  ECS Fargate        │    │  ECS Fargate        │
    │  (Frontend)         │    │  (Backend API)      │
    │  - Next.js SSR      │    │  - Express + TS     │
    │  - Auto-scaling     │    │  - Socket.IO        │
    │  - 2-4 tasks        │    │  - 2-6 tasks        │
    └─────────────────────┘    └─────────────────────┘
                                           │
                ┌──────────────────────────┼──────────────────┐
                ▼                          ▼                  ▼
    ┌─────────────────┐      ┌──────────────────┐  ┌─────────────────┐
    │ RDS PostgreSQL  │      │ ElastiCache      │  │ S3 Bucket       │
    │ - Multi-AZ      │      │ (Redis)          │  │ - File uploads  │
    │ - Auto backup   │      │ - Session store  │  │ - Static assets │
    │ - Read replica  │      │ - Cache          │  │                 │
    └─────────────────┘      └──────────────────┘  └─────────────────┘

    ┌────────────────────────────────────────────────────────┐
    │               Monitoring & Logging                     │
    │  - CloudWatch (Metrics, Logs, Alarms)                  │
    │  - X-Ray (Distributed tracing)                         │
    │  - SNS (Alerting)                                      │
    └────────────────────────────────────────────────────────┘
```

#### 인프라 사양

**Production Environment**:
- **Frontend (ECS Fargate)**
  - Task: 2 vCPU, 4GB RAM
  - Min instances: 2
  - Max instances: 4
  - Target CPU: 70%

- **Backend (ECS Fargate)**
  - Task: 2 vCPU, 4GB RAM
  - Min instances: 2
  - Max instances: 6
  - Target CPU: 70%

- **RDS PostgreSQL**
  - Instance: db.t3.large (2 vCPU, 8GB RAM)
  - Storage: 100GB GP3 (Auto-scaling to 500GB)
  - Multi-AZ: Yes
  - Backup: Daily, 7-day retention

- **ElastiCache Redis**
  - Node type: cache.t3.medium (2 vCPU, 3.09GB)
  - Cluster mode: Enabled (2 shards, 1 replica each)

**예상 비용**: $500-800/월 (워크샵 운영 시)

---

### 2.2 Infrastructure as Code (Terraform) ⭐⭐

**목표**: 코드로 인프라 관리, 재현 가능한 배포

#### 디렉토리 구조
```
infrastructure/
├── terraform/
│   ├── environments/
│   │   ├── dev/
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── terraform.tfvars
│   │   ├── staging/
│   │   └── production/
│   ├── modules/
│   │   ├── vpc/
│   │   ├── ecs/
│   │   ├── rds/
│   │   ├── elasticache/
│   │   ├── alb/
│   │   ├── cloudfront/
│   │   └── monitoring/
│   └── README.md
└── scripts/
    ├── deploy.sh
    ├── rollback.sh
    └── health-check.sh
```

#### 핵심 Terraform 모듈

- [ ] **VPC 모듈**
  ```hcl
  # modules/vpc/main.tf
  resource "aws_vpc" "main" {
    cidr_block           = var.vpc_cidr
    enable_dns_hostnames = true
    enable_dns_support   = true

    tags = {
      Name        = "${var.project_name}-vpc-${var.environment}"
      Environment = var.environment
    }
  }

  # Public subnets (for ALB)
  resource "aws_subnet" "public" {
    count                   = length(var.public_subnet_cidrs)
    vpc_id                  = aws_vpc.main.id
    cidr_block              = var.public_subnet_cidrs[count.index]
    availability_zone       = var.availability_zones[count.index]
    map_public_ip_on_launch = true

    tags = {
      Name = "${var.project_name}-public-${count.index + 1}"
    }
  }

  # Private subnets (for ECS, RDS)
  resource "aws_subnet" "private" {
    count             = length(var.private_subnet_cidrs)
    vpc_id            = aws_vpc.main.id
    cidr_block        = var.private_subnet_cidrs[count.index]
    availability_zone = var.availability_zones[count.index]

    tags = {
      Name = "${var.project_name}-private-${count.index + 1}"
    }
  }
  ```

- [ ] **ECS Fargate 모듈**
  ```hcl
  # modules/ecs/main.tf
  resource "aws_ecs_cluster" "main" {
    name = "${var.project_name}-${var.environment}"

    setting {
      name  = "containerInsights"
      value = "enabled"
    }
  }

  resource "aws_ecs_task_definition" "backend" {
    family                   = "${var.project_name}-backend"
    network_mode             = "awsvpc"
    requires_compatibilities = ["FARGATE"]
    cpu                      = var.backend_cpu
    memory                   = var.backend_memory
    execution_role_arn       = aws_iam_role.ecs_execution_role.arn
    task_role_arn            = aws_iam_role.ecs_task_role.arn

    container_definitions = jsonencode([
      {
        name  = "backend"
        image = "${var.ecr_repository_url}:${var.image_tag}"

        portMappings = [
          {
            containerPort = 4000
            protocol      = "tcp"
          }
        ]

        environment = [
          { name = "NODE_ENV", value = var.environment },
          { name = "PORT", value = "4000" }
        ]

        secrets = [
          {
            name      = "DATABASE_URL"
            valueFrom = aws_secretsmanager_secret.database_url.arn
          },
          {
            name      = "ANTHROPIC_API_KEY"
            valueFrom = aws_secretsmanager_secret.anthropic_key.arn
          }
        ]

        logConfiguration = {
          logDriver = "awslogs"
          options = {
            "awslogs-group"         = aws_cloudwatch_log_group.backend.name
            "awslogs-region"        = var.aws_region
            "awslogs-stream-prefix" = "ecs"
          }
        }

        healthCheck = {
          command     = ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1"]
          interval    = 30
          timeout     = 5
          retries     = 3
          startPeriod = 60
        }
      }
    ])
  }

  resource "aws_ecs_service" "backend" {
    name            = "${var.project_name}-backend"
    cluster         = aws_ecs_cluster.main.id
    task_definition = aws_ecs_task_definition.backend.arn
    desired_count   = var.backend_min_capacity
    launch_type     = "FARGATE"

    network_configuration {
      subnets          = var.private_subnet_ids
      security_groups  = [aws_security_group.ecs_tasks.id]
      assign_public_ip = false
    }

    load_balancer {
      target_group_arn = aws_lb_target_group.backend.arn
      container_name   = "backend"
      container_port   = 4000
    }

    depends_on = [aws_lb_listener.https]
  }

  # Auto-scaling
  resource "aws_appautoscaling_target" "backend" {
    max_capacity       = var.backend_max_capacity
    min_capacity       = var.backend_min_capacity
    resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.backend.name}"
    scalable_dimension = "ecs:service:DesiredCount"
    service_namespace  = "ecs"
  }

  resource "aws_appautoscaling_policy" "backend_cpu" {
    name               = "${var.project_name}-backend-cpu"
    policy_type        = "TargetTrackingScaling"
    resource_id        = aws_appautoscaling_target.backend.resource_id
    scalable_dimension = aws_appautoscaling_target.backend.scalable_dimension
    service_namespace  = aws_appautoscaling_target.backend.service_namespace

    target_tracking_scaling_policy_configuration {
      target_value = 70.0

      predefined_metric_specification {
        predefined_metric_type = "ECSServiceAverageCPUUtilization"
      }

      scale_in_cooldown  = 300
      scale_out_cooldown = 60
    }
  }
  ```

- [ ] **RDS 모듈** (Multi-AZ, Auto-backup)
- [ ] **ElastiCache 모듈** (Redis Cluster)
- [ ] **ALB 모듈** (SSL, Health checks)
- [ ] **CloudFront 모듈** (CDN, WAF)
- [ ] **Secrets Manager 모듈** (API keys, credentials)

**예상 소요**: 5-7일
**우선순위**: 🔴 Critical

---

### 2.3 CI/CD 파이프라인 (GitHub Actions) ⭐⭐

#### GitHub Actions Workflow

```yaml
# .github/workflows/production-deploy.yml
name: Production Deployment

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  AWS_REGION: ap-northeast-2
  ECR_REPOSITORY_BACKEND: work-redesign-backend
  ECR_REPOSITORY_FRONTEND: work-redesign-frontend
  ECS_CLUSTER: work-redesign-production
  ECS_SERVICE_BACKEND: work-redesign-backend
  ECS_SERVICE_FRONTEND: work-redesign-frontend

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../frontend && npm ci

      - name: Run linting
        run: |
          cd backend && npm run lint
          cd ../frontend && npm run lint

      - name: Run type checking
        run: |
          cd backend && npm run type-check
          cd ../frontend && npm run type-check

      - name: Run tests
        run: |
          cd backend && npm run test:ci
          cd ../frontend && npm run test:ci

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info,./frontend/coverage/lcov.info

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [backend, frontend]

    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build, tag, and push image
        id: build-image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd ${{ matrix.service }}
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY_${{ matrix.service }}:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY_${{ matrix.service }}:$IMAGE_TAG
          echo "image=$ECR_REGISTRY/$ECR_REPOSITORY_${{ matrix.service }}:$IMAGE_TAG" >> $GITHUB_OUTPUT

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    environment: production

    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Run database migrations
        run: |
          # Run migrations in a temporary ECS task
          aws ecs run-task \
            --cluster ${{ env.ECS_CLUSTER }} \
            --task-definition migration-task \
            --launch-type FARGATE \
            --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_IDS],securityGroups=[$SG_ID]}" \
            --overrides '{"containerOverrides": [{"name": "migration", "command": ["npm", "run", "migrate:deploy"]}]}'

      - name: Deploy backend to ECS
        run: |
          aws ecs update-service \
            --cluster ${{ env.ECS_CLUSTER }} \
            --service ${{ env.ECS_SERVICE_BACKEND }} \
            --force-new-deployment

      - name: Deploy frontend to ECS
        run: |
          aws ecs update-service \
            --cluster ${{ env.ECS_CLUSTER }} \
            --service ${{ env.ECS_SERVICE_FRONTEND }} \
            --force-new-deployment

      - name: Wait for deployment
        run: |
          aws ecs wait services-stable \
            --cluster ${{ env.ECS_CLUSTER }} \
            --services ${{ env.ECS_SERVICE_BACKEND }} ${{ env.ECS_SERVICE_FRONTEND }}

      - name: Run health checks
        run: |
          ./scripts/health-check.sh

      - name: Notify Slack
        if: always()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "Production deployment ${{ job.status }}",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Deployment Status:* ${{ job.status }}\n*Commit:* ${{ github.sha }}\n*Author:* ${{ github.actor }}"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

  rollback:
    needs: deploy
    if: failure()
    runs-on: ubuntu-latest
    steps:
      - name: Automatic rollback
        run: |
          # Rollback to previous task definition
          ./scripts/rollback.sh
```

**예상 소요**: 3-4일
**우선순위**: 🟡 High

---

## 🔒 Phase 3: 보안 및 성능 최적화 (Week 2)

### 3.1 보안 강화 ⭐⭐⭐

- [ ] **WAF (Web Application Firewall) 설정**
  ```hcl
  resource "aws_wafv2_web_acl" "main" {
    name  = "${var.project_name}-waf"
    scope = "REGIONAL"

    default_action {
      allow {}
    }

    # Rate limiting rule
    rule {
      name     = "RateLimitRule"
      priority = 1

      override_action {
        none {}
      }

      statement {
        rate_based_statement {
          limit              = 2000
          aggregate_key_type = "IP"
        }
      }

      visibility_config {
        cloudwatch_metrics_enabled = true
        metric_name                = "RateLimitRule"
        sampled_requests_enabled   = true
      }
    }

    # SQL Injection protection
    rule {
      name     = "SQLInjectionRule"
      priority = 2

      override_action {
        none {}
      }

      statement {
        managed_rule_group_statement {
          name        = "AWSManagedRulesSQLiRuleSet"
          vendor_name = "AWS"
        }
      }

      visibility_config {
        cloudwatch_metrics_enabled = true
        metric_name                = "SQLInjectionRule"
        sampled_requests_enabled   = true
      }
    }

    # XSS protection
    rule {
      name     = "XSSRule"
      priority = 3

      override_action {
        none {}
      }

      statement {
        managed_rule_group_statement {
          name        = "AWSManagedRulesKnownBadInputsRuleSet"
          vendor_name = "AWS"
        }
      }

      visibility_config {
        cloudwatch_metrics_enabled = true
        metric_name                = "XSSRule"
        sampled_requests_enabled   = true
      }
    }
  }
  ```

- [ ] **Secrets Management**
  - AWS Secrets Manager for all sensitive data
  - Automatic secret rotation
  - Encryption at rest and in transit

- [ ] **네트워크 보안**
  - Security groups (최소 권한 원칙)
  - Private subnets for backend/database
  - VPC endpoints (S3, ECR, Secrets Manager)
  - Network ACLs

- [ ] **데이터 암호화**
  - RDS encryption at rest (KMS)
  - S3 bucket encryption (SSE-S3)
  - SSL/TLS for all communications
  - ElastiCache encryption in-transit

- [ ] **컴플라이언스 및 감사**
  - CloudTrail 활성화 (모든 API 호출 기록)
  - Config rules (보안 정책 준수 확인)
  - GuardDuty (위협 탐지)
  - Security Hub (통합 보안 대시보드)

**예상 소요**: 3-4일
**우선순위**: 🔴 Critical

---

### 3.2 성능 최적화 ⭐⭐

- [ ] **데이터베이스 최적화**
  ```sql
  -- 인덱스 최적화
  CREATE INDEX idx_workshop_session_created_by ON workshop_sessions(created_by);
  CREATE INDEX idx_workshop_session_status ON workshop_sessions(status);
  CREATE INDEX idx_tasks_domain_id ON tasks(domain_id);
  CREATE INDEX idx_tasks_status ON tasks(status);
  CREATE INDEX idx_activity_logs_session_id_created_at ON activity_logs(session_id, created_at DESC);

  -- 복합 인덱스
  CREATE INDEX idx_tasks_project_status ON tasks(project_id, status);
  CREATE INDEX idx_workshop_participants ON workshop_sessions USING gin(participants);

  -- 파티셔닝 (대용량 로그 테이블)
  CREATE TABLE activity_logs_2025_q4 PARTITION OF activity_logs
    FOR VALUES FROM ('2025-10-01') TO ('2025-12-31');
  ```

- [ ] **캐싱 전략**
  ```typescript
  // backend/src/cache/strategy.ts
  class CacheStrategy {
    // 1. 세션 데이터 캐싱 (Redis)
    async getSession(sessionId: string) {
      const cacheKey = `session:${sessionId}`;
      const cached = await redis.get(cacheKey);

      if (cached) {
        return JSON.parse(cached);
      }

      const session = await prisma.workshopSession.findUnique({
        where: { id: sessionId },
        include: { domains: true, participants: true }
      });

      await redis.setex(cacheKey, 600, JSON.stringify(session)); // 10분 TTL
      return session;
    }

    // 2. AI 분석 결과 캐싱
    async cacheAIResponse(key: string, response: any, ttl: number = 3600) {
      await redis.setex(`ai:${key}`, ttl, JSON.stringify(response));
    }

    // 3. 사용자 권한 캐싱
    async getUserPermissions(userId: string) {
      const cacheKey = `permissions:${userId}`;
      // ... similar pattern
    }
  }
  ```

- [ ] **Connection Pooling**
  ```typescript
  // Prisma connection pool 설정
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")

    // Connection pool 설정
    pool_size = 20
    connection_limit = 100
    pool_timeout = 30
  }
  ```

- [ ] **API Response 압축**
  ```typescript
  import compression from 'compression';
  app.use(compression());
  ```

- [ ] **CDN 활용**
  - CloudFront로 정적 리소스 배포
  - Edge caching 설정
  - GZIP/Brotli 압축

- [ ] **이미지 최적화**
  - Next.js Image 컴포넌트 사용
  - WebP 포맷 변환
  - Lazy loading

**예상 소요**: 3-4일
**우선순위**: 🟡 High

---

### 3.3 확장성 설계 ⭐⭐

- [ ] **수평 확장 (Auto-scaling)**
  - ECS Service Auto-scaling (CPU/Memory 기반)
  - RDS Read Replica (읽기 부하 분산)
  - ElastiCache Cluster mode (샤딩)

- [ ] **부하 분산**
  - Application Load Balancer
  - Sticky sessions (WebSocket 지원)
  - Health checks

- [ ] **비동기 작업 처리**
  ```typescript
  // SQS + Lambda for heavy tasks
  class AsyncJobService {
    async enqueueAIAnalysis(analysisRequest: any) {
      await sqs.sendMessage({
        QueueUrl: process.env.AI_ANALYSIS_QUEUE_URL,
        MessageBody: JSON.stringify(analysisRequest)
      });
    }
  }
  ```

**예상 소요**: 2-3일
**우선순위**: 🟡 High

---

## 📊 Phase 4: 모니터링 및 운영 체계 (Week 3)

### 4.1 종합 모니터링 시스템 ⭐⭐⭐

#### CloudWatch 대시보드 설정

```typescript
// infrastructure/monitoring/cloudwatch-dashboard.json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "title": "Backend API Latency (P50, P95, P99)",
        "metrics": [
          ["AWS/ECS", "TargetResponseTime", { "stat": "p50" }],
          ["...", { "stat": "p95" }],
          ["...", { "stat": "p99" }]
        ],
        "period": 60,
        "region": "ap-northeast-2"
      }
    },
    {
      "type": "metric",
      "properties": {
        "title": "Active Workshop Sessions",
        "metrics": [
          ["WorkRedesign", "ActiveSessions"]
        ]
      }
    },
    {
      "type": "metric",
      "properties": {
        "title": "Database Connections",
        "metrics": [
          ["AWS/RDS", "DatabaseConnections"]
        ]
      }
    },
    {
      "type": "metric",
      "properties": {
        "title": "Redis Cache Hit Rate",
        "metrics": [
          ["AWS/ElastiCache", "CacheHitRate"]
        ]
      }
    },
    {
      "type": "metric",
      "properties": {
        "title": "AI API Calls & Latency",
        "metrics": [
          ["WorkRedesign", "AnthropicAPICalls"],
          ["WorkRedesign", "AnthropicAPILatency"]
        ]
      }
    }
  ]
}
```

- [ ] **커스텀 메트릭 수집**
  ```typescript
  // backend/src/monitoring/metrics.ts
  import { CloudWatch } from 'aws-sdk';

  class MetricsCollector {
    private cloudwatch: CloudWatch;

    async recordWorkshopSessionCreated() {
      await this.cloudwatch.putMetricData({
        Namespace: 'WorkRedesign',
        MetricData: [{
          MetricName: 'WorkshopSessionsCreated',
          Value: 1,
          Unit: 'Count',
          Timestamp: new Date()
        }]
      }).promise();
    }

    async recordAIAPICall(duration: number, success: boolean) {
      await this.cloudwatch.putMetricData({
        Namespace: 'WorkRedesign',
        MetricData: [
          {
            MetricName: 'AnthropicAPICalls',
            Value: 1,
            Unit: 'Count',
            Dimensions: [{ Name: 'Status', Value: success ? 'Success' : 'Failure' }]
          },
          {
            MetricName: 'AnthropicAPILatency',
            Value: duration,
            Unit: 'Milliseconds'
          }
        ]
      }).promise();
    }

    async recordActiveUsers(count: number) {
      await this.cloudwatch.putMetricData({
        Namespace: 'WorkRedesign',
        MetricData: [{
          MetricName: 'ActiveUsers',
          Value: count,
          Unit: 'Count'
        }]
      }).promise();
    }
  }
  ```

- [ ] **알람 설정**
  ```hcl
  # CPU 사용률 알람
  resource "aws_cloudwatch_metric_alarm" "ecs_cpu_high" {
    alarm_name          = "backend-cpu-utilization-high"
    comparison_operator = "GreaterThanThreshold"
    evaluation_periods  = "2"
    metric_name         = "CPUUtilization"
    namespace           = "AWS/ECS"
    period              = "60"
    statistic           = "Average"
    threshold           = "80"
    alarm_description   = "This metric monitors ECS CPU utilization"
    alarm_actions       = [aws_sns_topic.alerts.arn]

    dimensions = {
      ClusterName = aws_ecs_cluster.main.name
      ServiceName = aws_ecs_service.backend.name
    }
  }

  # 데이터베이스 연결 수 알람
  resource "aws_cloudwatch_metric_alarm" "rds_connections_high" {
    alarm_name          = "rds-connections-high"
    comparison_operator = "GreaterThanThreshold"
    evaluation_periods  = "2"
    metric_name         = "DatabaseConnections"
    namespace           = "AWS/RDS"
    period              = "60"
    statistic           = "Average"
    threshold           = "80"
    alarm_description   = "RDS connections approaching limit"
    alarm_actions       = [aws_sns_topic.alerts.arn]
  }

  # API 에러율 알람
  resource "aws_cloudwatch_metric_alarm" "api_error_rate" {
    alarm_name          = "api-error-rate-high"
    comparison_operator = "GreaterThanThreshold"
    evaluation_periods  = "2"
    metric_name         = "5XXError"
    namespace           = "AWS/ApplicationELB"
    period              = "300"
    statistic           = "Sum"
    threshold           = "10"
    alarm_description   = "API error rate is too high"
    alarm_actions       = [aws_sns_topic.alerts.arn]
  }
  ```

- [ ] **로그 집계 및 분석**
  - CloudWatch Logs Insights 쿼리 작성
  - 로그 retention 정책 설정
  - 에러 로그 자동 알림

- [ ] **분산 추적 (X-Ray)**
  ```typescript
  import AWSXRay from 'aws-xray-sdk-core';
  import AWS from 'aws-sdk';

  const tracedAWS = AWSXRay.captureAWS(AWS);
  const tracedHTTP = AWSXRay.captureHTTPsGlobal(require('http'));

  // Express middleware
  app.use(AWSXRay.express.openSegment('WorkRedesignAPI'));

  // ... routes ...

  app.use(AWSXRay.express.closeSegment());
  ```

**예상 소요**: 4-5일
**우선순위**: 🔴 Critical

---

### 4.2 알림 및 On-call 체계 ⭐

- [ ] **SNS 토픽 설정**
  - Critical alerts → PagerDuty/OpsGenie
  - Warning alerts → Slack
  - Info alerts → Email

- [ ] **Slack 통합**
  ```typescript
  class SlackNotifier {
    async sendDeploymentNotification(status: 'success' | 'failure', details: any) {
      await axios.post(process.env.SLACK_WEBHOOK_URL, {
        text: `Deployment ${status}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Deployment Status:* ${status}\n*Version:* ${details.version}\n*Environment:* production`
            }
          }
        ]
      });
    }

    async sendErrorAlert(error: Error, context: any) {
      // Send critical errors to Slack
    }

    async sendWorkshopMetrics(metrics: any) {
      // Daily summary of workshop activities
    }
  }
  ```

- [ ] **On-call Runbook 작성**
  - 장애 대응 절차
  - Rollback 절차
  - 에스컬레이션 정책
  - 일반적인 문제 해결 가이드

**예상 소요**: 2일
**우선순위**: 🟡 High

---

### 4.3 백업 및 재해 복구 ⭐⭐

- [ ] **자동 백업 설정**
  ```hcl
  # RDS 자동 백업
  resource "aws_db_instance" "main" {
    # ... other settings ...

    backup_retention_period = 7
    backup_window          = "03:00-04:00"  # UTC
    maintenance_window     = "Mon:04:00-Mon:05:00"

    # Point-in-time recovery
    enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

    # Multi-AZ for high availability
    multi_az = true
  }

  # S3 백업 (파일 업로드)
  resource "aws_s3_bucket_versioning" "files" {
    bucket = aws_s3_bucket.files.id

    versioning_configuration {
      status = "Enabled"
    }
  }

  resource "aws_s3_bucket_lifecycle_configuration" "files" {
    bucket = aws_s3_bucket.files.id

    rule {
      id     = "archive-old-versions"
      status = "Enabled"

      noncurrent_version_transition {
        noncurrent_days = 30
        storage_class   = "GLACIER"
      }

      noncurrent_version_expiration {
        noncurrent_days = 90
      }
    }
  }
  ```

- [ ] **재해 복구 계획**
  - RTO (Recovery Time Objective): 1시간
  - RPO (Recovery Point Objective): 15분
  - 정기적인 복구 훈련 (월 1회)
  - 백업 검증 자동화

- [ ] **Cross-region 복제** (선택적)
  - S3 Cross-region replication
  - RDS Read Replica (다른 리전)

**예상 소요**: 2-3일
**우선순위**: 🟡 High

---

## 🧪 Phase 5: 사전 테스트 및 런칭 준비 (Week 3-4)

### 5.1 부하 테스트 ⭐⭐⭐

**목표**: 50명의 동시 사용자가 원활하게 워크샵 진행 가능

#### 시나리오 설계

```typescript
// tests/load/workshop-load-test.ts
import { check, sleep } from 'k6';
import http from 'k6/http';
import ws from 'k6/ws';

export const options = {
  stages: [
    { duration: '2m', target: 10 },   // Ramp up to 10 users
    { duration: '5m', target: 30 },   // Ramp up to 30 users
    { duration: '10m', target: 50 },  // Peak load - 50 concurrent users
    { duration: '5m', target: 50 },   // Stay at 50 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // 95% of requests < 2s
    http_req_failed: ['rate<0.01'],     // Error rate < 1%
    'ws_session_duration': ['p(95)<30000'], // WebSocket session < 30s
  },
};

export default function() {
  // 1. 로그인
  const loginRes = http.post(`${__ENV.API_URL}/auth/login`, JSON.stringify({
    email: `team-leader-${__VU}@sk.com`,
    password: 'test-password'
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(loginRes, {
    'login successful': (r) => r.status === 200,
  });

  const authToken = loginRes.json('token');

  // 2. 워크샵 세션 생성
  const createSessionRes = http.post(
    `${__ENV.API_URL}/workshops`,
    JSON.stringify({
      title: `Load Test Workshop ${__VU}`,
      domains: ['Domain 1', 'Domain 2', 'Domain 3']
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
    }
  );

  check(createSessionRes, {
    'session created': (r) => r.status === 201,
  });

  const sessionId = createSessionRes.json('id');

  // 3. WebSocket 연결 (실시간 업데이트)
  const wsUrl = `${__ENV.WS_URL}/workshop/${sessionId}`;
  const wsRes = ws.connect(wsUrl, { headers: { Authorization: `Bearer ${authToken}` } }, function(socket) {
    socket.on('open', () => {
      socket.send(JSON.stringify({ type: 'join', sessionId }));
    });

    socket.on('message', (data) => {
      const message = JSON.parse(data);
      check(message, {
        'received message': (m) => m.type !== undefined,
      });
    });

    socket.setTimeout(() => {
      socket.close();
    }, 30000);
  });

  // 4. 파일 업로드 시뮬레이션
  const fileData = open('./test-files/sample-tasks.docx', 'b');
  const uploadRes = http.post(
    `${__ENV.API_URL}/workshops/${sessionId}/upload`,
    {
      file: http.file(fileData, 'sample-tasks.docx'),
    },
    {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
    }
  );

  check(uploadRes, {
    'file uploaded': (r) => r.status === 200,
  });

  // 5. AI 업무 추출 요청
  const extractRes = http.post(
    `${__ENV.API_URL}/workshops/${sessionId}/extract-tasks`,
    JSON.stringify({}),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
    }
  );

  check(extractRes, {
    'tasks extracted': (r) => r.status === 200,
  });

  sleep(5);

  // 6. AI 컨설팅 대화
  const chatRes = http.post(
    `${__ENV.API_URL}/consulting/chat`,
    JSON.stringify({
      sessionId,
      message: 'How can I automate customer email classification?'
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
    }
  );

  check(chatRes, {
    'AI response received': (r) => r.status === 200,
  });

  sleep(2);
}
```

#### 실행 및 분석

```bash
# K6 설치
brew install k6  # macOS
# or
sudo apt-get install k6  # Ubuntu

# 부하 테스트 실행
k6 run --out cloud tests/load/workshop-load-test.ts

# Grafana로 결과 시각화
k6 run --out influxdb=http://localhost:8086/k6 tests/load/workshop-load-test.ts
```

**측정 지표**:
- API 응답 시간 (P50, P95, P99)
- 에러율
- 동시 WebSocket 연결 수
- 데이터베이스 쿼리 성능
- Redis 캐시 히트율
- CPU/Memory 사용률

**예상 소요**: 3-4일
**우선순위**: 🔴 Critical

---

### 5.2 보안 테스트 ⭐⭐

- [ ] **OWASP Top 10 취약점 검사**
  - SQL Injection
  - XSS (Cross-Site Scripting)
  - CSRF (Cross-Site Request Forgery)
  - Authentication/Authorization 우회
  - Sensitive data exposure

- [ ] **침투 테스트**
  - 외부 보안 컨설팅 업체 활용
  - 또는 OWASP ZAP 자동 스캔

- [ ] **의존성 취약점 스캔**
  ```bash
  # npm audit
  npm audit --production

  # Snyk 통합
  snyk test
  snyk monitor
  ```

**예상 소요**: 2-3일
**우선순위**: 🔴 Critical

---

### 5.3 사용자 인수 테스트 (UAT) ⭐⭐

- [ ] **베타 테스트 계획**
  - 5-10명의 실제 팀장 초대
  - Staging 환경에서 실제 워크샵 진행
  - 피드백 수집 및 개선

- [ ] **체크리스트**
  - [ ] 로그인 및 인증 정상 작동
  - [ ] 워크샵 세션 생성 및 관리
  - [ ] 파일 업로드 및 분석
  - [ ] AI 컨설팅 품질
  - [ ] 워크플로우 설계 기능
  - [ ] 결과 다운로드 (PDF, Excel)
  - [ ] 실시간 업데이트 (WebSocket)
  - [ ] 모바일 반응형 디자인

- [ ] **성능 SLA 검증**
  - 페이지 로드 시간 < 3초
  - API 응답 시간 < 1초 (P95)
  - AI 분석 완료 시간 < 30초
  - 파일 업로드 성공률 > 99%

**예상 소요**: 3-4일
**우선순위**: 🔴 Critical

---

### 5.4 런칭 체크리스트 ⭐⭐⭐

#### 기술적 준비
- [ ] 프로덕션 환경 배포 완료
- [ ] DNS 설정 완료 (예: workshop.work-redesign.sk.com)
- [ ] SSL 인증서 설치 및 검증
- [ ] 모니터링 대시보드 설정 완료
- [ ] 알림 설정 완료
- [ ] 백업 자동화 검증
- [ ] CI/CD 파이프라인 테스트
- [ ] 부하 테스트 통과
- [ ] 보안 검사 통과
- [ ] 로그 수집 및 분석 시스템 작동

#### 운영 준비
- [ ] On-call 담당자 지정
- [ ] Runbook 문서 작성
- [ ] 장애 대응 프로세스 정의
- [ ] 롤백 절차 검증
- [ ] 사용자 가이드 작성
- [ ] FAQ 준비
- [ ] 지원 채널 구축 (Slack, 이메일)

#### 데이터 준비
- [ ] 프로덕션 데이터베이스 마이그레이션
- [ ] 초기 사용자 계정 생성
- [ ] 권한 설정 검증
- [ ] 샘플 데이터 준비 (데모용)

#### 커뮤니케이션
- [ ] 팀장들에게 사전 안내 이메일 발송
- [ ] 워크샵 일정 조율
- [ ] 사용 가이드 배포
- [ ] 기술 지원팀 대기

**예상 소요**: 2-3일
**우선순위**: 🔴 Critical

---

## 📅 전체 일정 요약

| Phase | 작업 내용 | 소요 기간 | 우선순위 |
|-------|---------|---------|---------|
| **Phase 1** | 멀티테넌시 및 인증 시스템 | 7-10일 | 🔴 Critical |
| **Phase 2** | 인프라 및 배포 환경 | 10-14일 | 🔴 Critical |
| **Phase 3** | 보안 및 성능 최적화 | 7-10일 | 🔴 Critical |
| **Phase 4** | 모니터링 및 운영 체계 | 6-8일 | 🔴 Critical |
| **Phase 5** | 사전 테스트 및 런칭 준비 | 8-10일 | 🔴 Critical |
| **총계** | | **38-52일** (5.5-7.5주) | |

**병렬 작업 가능 시 단축**: 3-4주

---

## 💰 예상 비용 (월간)

### AWS 인프라 비용
| 서비스 | 사양 | 월 비용 (USD) |
|--------|------|--------------|
| ECS Fargate (Backend) | 2 vCPU, 4GB x 2-6 tasks | $150-450 |
| ECS Fargate (Frontend) | 2 vCPU, 4GB x 2-4 tasks | $100-300 |
| RDS PostgreSQL | db.t3.large, Multi-AZ | $200 |
| ElastiCache Redis | cache.t3.medium x 2 | $100 |
| ALB | 1 ALB | $25 |
| CloudFront | 500GB transfer | $50 |
| S3 | 100GB storage, 10K requests | $10 |
| Secrets Manager | 10 secrets | $5 |
| CloudWatch | Logs, metrics, alarms | $30 |
| **Total** | | **$670-1,170/월** |

### 외부 서비스 비용
| 서비스 | 월 비용 (USD) |
|--------|--------------|
| Anthropic Claude API | $500-1,000 (워크샵 빈도에 따라) |
| DataDog (Optional) | $150 |
| PagerDuty (Optional) | $40 |
| **Total** | **$690-1,190/월** |

**전체 월간 비용**: $1,360-2,360
**워크샵 미운영 시** (최소 인프라만 유지): $300-400/월

---

## 🎯 성공 지표 (KPI)

### 기술적 지표
- **가용성**: 99.5% 이상 (월 3.6시간 이하 다운타임)
- **API 응답 시간**: P95 < 1초
- **페이지 로드 시간**: P95 < 3초
- **에러율**: < 0.1%
- **동시 사용자**: 50명 이상 지원

### 비즈니스 지표
- **워크샵 완료율**: > 90%
- **사용자 만족도**: > 4.0/5.0
- **AI 분석 정확도**: > 85%
- **시스템 안정성**: 0건의 critical incident

---

## 🚀 단계별 시작 가이드

### Week 1: 기반 구축
```bash
# 1. 브랜치 생성
git checkout -b production/multi-tenancy

# 2. 멀티테넌시 구현
cd backend/src/middleware
# session-isolation.ts 작성

# 3. SK SSO 통합
cd backend/src/auth
# sso.service.ts 작성

# 4. 테스트
npm run test
npm run test:integration
```

### Week 2: 인프라 구축
```bash
# 1. Terraform 초기화
cd infrastructure/terraform/environments/production
terraform init

# 2. 인프라 프로비저닝
terraform plan
terraform apply

# 3. Docker 이미지 빌드
docker build -t work-redesign-backend:latest ./backend
docker build -t work-redesign-frontend:latest ./frontend

# 4. ECR 푸시
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin {account-id}.dkr.ecr.ap-northeast-2.amazonaws.com
docker push {account-id}.dkr.ecr.ap-northeast-2.amazonaws.com/work-redesign-backend:latest
```

### Week 3: 모니터링 & 테스트
```bash
# 1. 모니터링 설정
cd monitoring
terraform apply

# 2. 부하 테스트
k6 run --vus 50 --duration 10m tests/load/workshop-load-test.ts

# 3. 보안 스캔
npm audit
snyk test
```

### Week 4: 런칭 준비
```bash
# 1. UAT 환경 배포
git checkout -b release/v1.0.0
./scripts/deploy-staging.sh

# 2. 베타 테스트
# - 팀장 5-10명 초대
# - 피드백 수집

# 3. 프로덕션 배포
./scripts/deploy-production.sh

# 4. 헬스체크
./scripts/health-check.sh
```

---

## 📚 추가 참고 자료

### 문서
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)
- [Prisma Production Checklist](https://www.prisma.io/docs/guides/performance-and-optimization/production-checklist)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

### 도구
- [K6 Load Testing](https://k6.io/)
- [OWASP ZAP](https://www.zaproxy.org/)
- [AWS Cost Explorer](https://aws.amazon.com/aws-cost-management/aws-cost-explorer/)

---

## ✅ 최종 점검

프로덕션 배포 전 반드시 확인:

1. [ ] 모든 환경 변수 설정 완료
2. [ ] Secrets 안전하게 관리 (Secrets Manager)
3. [ ] 백업 자동화 검증
4. [ ] 모니터링 알람 테스트
5. [ ] 롤백 절차 검증
6. [ ] On-call 담당자 지정
7. [ ] 사용자 가이드 배포
8. [ ] 부하 테스트 통과
9. [ ] 보안 검사 통과
10. [ ] 팀장들에게 사전 안내

---

**작성 완료일**: 2025-11-22
**다음 리뷰**: 매주 월요일 오전 10시
**문의**: engineering-team@sk.com
