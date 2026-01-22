# Maintenance & Operations Guide

Guide for ongoing maintenance and operations of Advanced-LMS.

## Table of Contents

- [Daily Tasks](#daily-tasks)
- [Weekly Tasks](#weekly-tasks)
- [Monthly Tasks](#monthly-tasks)
- [Quarterly Tasks](#quarterly-tasks)
- [Database Maintenance](#database-maintenance)
- [Security Updates](#security-updates)
- [Backup Verification](#backup-verification)
- [Performance Monitoring](#performance-monitoring)
- [Log Management](#log-management)
- [Certificate Renewal](#certificate-renewal)
- [Dependency Updates](#dependency-updates)
- [Scaling Considerations](#scaling-considerations)

## Daily Tasks

### 1. Monitor Application Health

**Check Service Status:**
```bash
# Docker environment
docker-compose ps

# Verify all services healthy
curl https://yourdomain.com/health
curl https://api.yourdomain.com/health

# Check response times
time curl https://api.yourdomain.com/health
```

**Monitor Error Rates:**
```bash
# Check error logs for critical issues
tail -f /var/log/advanced-lms/error.log

# Count errors in last hour
grep -c ERROR /var/log/advanced-lms/error.log | tail -100

# Check application metrics
# - Response times
# - Error rates
# - Active users
```

### 2. Review Application Logs

**Backend Logs:**
```bash
# Docker
docker-compose logs --tail=100 backend

# Direct
tail -f /var/log/advanced-lms/combined.log

# Check for common issues:
# - Database connection errors
# - Redis timeouts
# - Authentication failures
# - Unhandled exceptions
```

**Frontend Logs:**
```bash
# Docker
docker-compose logs --tail=100 frontend

# Check for:
# - Build errors
# - API connection failures
# - Client-side errors
```

**Database Logs:**
```bash
# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-16-main.log

# Check for:
# - Slow queries
# - Connection errors
# - Lock waits
```

### 3. Monitor System Resources

**Server Resources:**
```bash
# CPU and Memory usage
htop
# or
top

# Docker container stats
docker stats

# Disk usage
df -h

# Alert if disk usage > 80%
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
  echo "WARNING: Disk usage at ${DISK_USAGE}%"
fi
```

**Database Resources:**
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check database size
SELECT pg_size_pretty(pg_database_size('advanced_lms_prod'));

-- Check largest tables
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
```

### 4. Verify Backup Completion

```bash
# Check last backup timestamp
ls -lth /var/backups/advanced-lms/ | head -5

# Verify backup file size (should not be 0)
du -h /var/backups/advanced-lms/db_backup_$(date +%Y%m%d)*.sql.gz

# Check backup logs
tail /var/log/db-backup.log
```

### 5. Monitor User Activity

**Check Active Users:**
```sql
-- Active sessions in last hour
SELECT COUNT(DISTINCT user_id) 
FROM audit_logs 
WHERE created_at > NOW() - INTERVAL '1 hour';

-- Recent enrollments
SELECT COUNT(*) 
FROM enrollments 
WHERE enrolled_at > NOW() - INTERVAL '24 hours';
```

## Weekly Tasks

### 1. Review Security Alerts

**Check for Security Vulnerabilities:**
```bash
# Backend
cd backend
npm audit

# Fix high/critical vulnerabilities
npm audit fix

# Frontend
cd frontend
npm audit
npm audit fix
```

**Review Failed Login Attempts:**
```sql
-- Check for suspicious login activity
SELECT 
  email,
  COUNT(*) as failed_attempts,
  MAX(created_at) as last_attempt
FROM audit_logs
WHERE action = 'login_failed'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY email
HAVING COUNT(*) > 10
ORDER BY failed_attempts DESC;
```

### 2. Verify Backups

**Test Backup Restoration:**
```bash
# Create test database
createdb advanced_lms_test

# Restore latest backup
gunzip -c /var/backups/advanced-lms/db_backup_latest.sql.gz | \
  psql -U lms_user -d advanced_lms_test

# Verify data integrity
psql -U lms_user -d advanced_lms_test -c "SELECT COUNT(*) FROM users;"

# Cleanup
dropdb advanced_lms_test
```

### 3. Review Performance Metrics

**Analyze Slow Queries:**
```sql
-- Enable pg_stat_statements extension (if not already)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Find slow queries
SELECT 
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100  -- queries slower than 100ms
ORDER BY mean_exec_time DESC
LIMIT 20;
```

**API Performance:**
```bash
# Check average response times from logs
# Use monitoring tool (New Relic, DataDog, etc.)

# Manual check
grep "Response-Time:" /var/log/nginx/access.log | \
  awk '{print $NF}' | \
  awk '{s+=$1; n++} END {print s/n}'
```

### 4. Clean Up Old Data

**Remove Old Logs:**
```bash
# Compress logs older than 7 days
find /var/log/advanced-lms -name "*.log" -mtime +7 -exec gzip {} \;

# Delete compressed logs older than 30 days
find /var/log/advanced-lms -name "*.log.gz" -mtime +30 -delete

# Rotate logs
logrotate /etc/logrotate.d/advanced-lms
```

**Clean Old Redis Data:**
```bash
# Connect to Redis
redis-cli

# Check memory usage
INFO memory

# Remove expired keys (if not auto-expiring)
KEYS "session:*" | xargs redis-cli DEL

# Check key count
DBSIZE
```

**Archive Old Records:**
```sql
-- Archive old audit logs (older than 90 days)
INSERT INTO audit_logs_archive
SELECT * FROM audit_logs
WHERE created_at < NOW() - INTERVAL '90 days';

DELETE FROM audit_logs
WHERE created_at < NOW() - INTERVAL '90 days';

-- Archive old notifications (read, older than 30 days)
DELETE FROM notifications
WHERE is_read = true
  AND created_at < NOW() - INTERVAL '30 days';
```

### 5. Check Certificate Expiry

```bash
# Check SSL certificate expiration
echo | openssl s_client -connect yourdomain.com:443 2>/dev/null | \
  openssl x509 -noout -dates

# Test Let's Encrypt renewal
sudo certbot renew --dry-run

# Should auto-renew, but verify:
sudo systemctl status certbot.timer
```

## Monthly Tasks

### 1. Update Dependencies

**Review Outdated Packages:**
```bash
# Backend
cd backend
npm outdated

# Update non-breaking changes
npm update

# Update specific package
npm install package-name@latest

# Frontend
cd frontend
npm outdated
npm update
```

**Test After Updates:**
```bash
# Run full test suite
npm test

# Build and verify
npm run build

# Deploy to staging first
# Verify functionality
# Then deploy to production
```

### 2. Database Optimization

**VACUUM and ANALYZE:**
```sql
-- Full vacuum (requires downtime)
VACUUM FULL;

-- Regular vacuum (no downtime)
VACUUM ANALYZE;

-- Check bloat
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
```

**Reindex Tables:**
```sql
-- Reindex all tables
REINDEX DATABASE advanced_lms_prod;

-- Or specific tables
REINDEX TABLE users;
REINDEX TABLE enrollments;
```

**Update Statistics:**
```sql
-- Update query planner statistics
ANALYZE;

-- For specific table
ANALYZE users;
```

### 3. Review and Rotate Secrets

**Rotate JWT Secrets:**
```bash
# Generate new secrets
NEW_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

# Update .env with new secret
# Keep old secret for grace period (7 days)
JWT_SECRET=$NEW_SECRET
JWT_SECRET_OLD=$OLD_SECRET

# After grace period, remove old secret
```

**Rotate Database Password:**
```sql
-- Create new password
ALTER USER lms_user WITH PASSWORD 'new_strong_password';

-- Update .env
DB_PASSWORD=new_strong_password

-- Restart application
docker-compose restart backend
```

### 4. Security Audit

**Review User Permissions:**
```sql
-- Check users with admin role
SELECT id, email, role, created_at
FROM users
WHERE role = 'admin';

-- Review recent permission changes
SELECT *
FROM audit_logs
WHERE action LIKE '%permission%'
  OR action LIKE '%role%'
ORDER BY created_at DESC
LIMIT 50;
```

**Review Access Logs:**
```bash
# Analyze nginx access logs
cat /var/log/nginx/access.log | \
  awk '{print $1}' | sort | uniq -c | sort -rn | head -20

# Check for suspicious patterns
grep -i "sql" /var/log/nginx/access.log
grep -i "script" /var/log/nginx/access.log
grep -i "../" /var/log/nginx/access.log
```

### 5. Performance Review

**Generate Performance Report:**
```sql
-- Course creation trend
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as courses_created
FROM courses
WHERE created_at > NOW() - INTERVAL '6 months'
GROUP BY month
ORDER BY month;

-- User growth
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as users_registered
FROM users
WHERE created_at > NOW() - INTERVAL '6 months'
GROUP BY month
ORDER BY month;

-- Enrollment trends
SELECT 
  DATE_TRUNC('month', enrolled_at) as month,
  COUNT(*) as enrollments
FROM enrollments
WHERE enrolled_at > NOW() - INTERVAL '6 months'
GROUP BY month
ORDER BY month;
```

## Quarterly Tasks

### 1. Disaster Recovery Test

**Full Backup and Restore Test:**
```bash
# 1. Create full backup
./scripts/backup-full.sh

# 2. Set up test environment
docker-compose -f docker-compose.test.yml up -d

# 3. Restore backup to test environment
gunzip -c /var/backups/latest.sql.gz | \
  psql -h test-db -U lms_user -d advanced_lms_test

# 4. Verify data integrity
psql -h test-db -U lms_user -d advanced_lms_test <<EOF
  SELECT COUNT(*) FROM users;
  SELECT COUNT(*) FROM courses;
  SELECT COUNT(*) FROM enrollments;
EOF

# 5. Test critical functionality
# - User login
# - Course enrollment
# - Quiz taking
# - Certificate generation

# 6. Document RTO (Recovery Time Objective)
# - How long did restore take?
# - Update DR plan if needed

# 7. Cleanup
docker-compose -f docker-compose.test.yml down -v
```

### 2. Capacity Planning

**Analyze Growth Trends:**
```sql
-- Database size growth
SELECT 
  pg_size_pretty(pg_database_size('advanced_lms_prod')) as current_size;

-- Projected growth (based on monthly increase)
-- Plan for capacity if approaching limits
```

**Server Resource Trends:**
```bash
# Review historical CPU/Memory usage
# From monitoring tools (DataDog, New Relic, etc.)

# Calculate average daily increase in:
# - Disk usage
# - Memory usage
# - Database size
# - Number of users

# Plan upgrades 3-6 months in advance
```

### 3. Security Penetration Test

**Run Security Scans:**
```bash
# OWASP ZAP scan
zap-cli quick-scan https://yourdomain.com

# Nmap port scan
nmap -sV yourdomain.com

# SSL/TLS test
testssl.sh yourdomain.com

# SQL injection test (use with caution)
sqlmap -u "https://api.yourdomain.com/api/courses" --batch

# Check for exposed secrets
# Use tools like truffleHog on repository
```

### 4. Performance Benchmarking

**Load Testing:**
```bash
# Install Apache Bench or Artillery
npm install -g artillery

# Create load test scenario
artillery quick --count 100 --num 10 https://yourdomain.com

# API load test
artillery quick --count 100 --num 10 \
  -H "Authorization: Bearer TOKEN" \
  https://api.yourdomain.com/api/courses

# Document results and compare with previous quarters
```

### 5. Documentation Review

**Update Documentation:**
- [ ] Review and update API documentation
- [ ] Update architecture diagrams
- [ ] Review troubleshooting guide (add new issues found)
- [ ] Update deployment procedures
- [ ] Review and update runbooks
- [ ] Update team contacts and escalation procedures

## Database Maintenance

### Regular Maintenance Script

Create `/usr/local/bin/db-maintenance.sh`:

```bash
#!/bin/bash
# Daily database maintenance

LOG_FILE="/var/log/db-maintenance.log"

echo "=== Database Maintenance Started: $(date) ===" >> $LOG_FILE

# Vacuum analyze
psql -U lms_user -d advanced_lms_prod -c "VACUUM ANALYZE;" >> $LOG_FILE 2>&1

# Update statistics
psql -U lms_user -d advanced_lms_prod -c "ANALYZE;" >> $LOG_FILE 2>&1

# Check for dead tuples
psql -U lms_user -d advanced_lms_prod -c "
  SELECT 
    schemaname, 
    relname, 
    n_dead_tup, 
    n_live_tup,
    ROUND(n_dead_tup::numeric / NULLIF(n_live_tup, 0) * 100, 2) as dead_percentage
  FROM pg_stat_user_tables
  WHERE n_dead_tup > 1000
  ORDER BY n_dead_tup DESC
  LIMIT 10;
" >> $LOG_FILE 2>&1

echo "=== Database Maintenance Completed: $(date) ===" >> $LOG_FILE
```

**Setup Cron:**
```bash
# Run daily at 3 AM
0 3 * * * /usr/local/bin/db-maintenance.sh
```

## Security Updates

### Update Strategy

**Critical Updates (Apply Immediately):**
- Security vulnerabilities (CVE with CVSS > 7.0)
- Zero-day exploits
- Database security patches

**High Priority (Within 48 hours):**
- Node.js security updates
- npm package vulnerabilities (high/critical)
- Framework security patches

**Medium Priority (Within 1 week):**
- npm package updates (moderate)
- OS security updates
- Minor dependency updates

**Low Priority (Monthly):**
- Feature updates
- Non-security patches
- Documentation updates

### Update Process

```bash
# 1. Check for updates
npm outdated
npm audit

# 2. Review changelog
# Check npm package page or GitHub releases

# 3. Test in development
git checkout -b update-dependencies
npm update
npm test

# 4. Deploy to staging
git push origin update-dependencies
# Verify on staging environment

# 5. Deploy to production
git checkout main
git merge update-dependencies
git push origin main
# Deploy using normal deployment process

# 6. Monitor for issues
# Watch logs for 24 hours after update
```

## Backup Verification

### Automated Backup Verification Script

Create `/usr/local/bin/verify-backup.sh`:

```bash
#!/bin/bash
# Verify latest backup integrity

BACKUP_DIR="/var/backups/advanced-lms"
LATEST_BACKUP=$(ls -t $BACKUP_DIR/db_backup_*.sql.gz | head -1)
TEST_DB="advanced_lms_verify"

echo "Verifying backup: $LATEST_BACKUP"

# Create test database
createdb $TEST_DB

# Restore backup
gunzip -c $LATEST_BACKUP | psql -U lms_user -d $TEST_DB

# Verify critical tables
TABLE_COUNT=$(psql -U lms_user -d $TEST_DB -t -c "
  SELECT COUNT(*) FROM information_schema.tables 
  WHERE table_schema = 'public';
")

USER_COUNT=$(psql -U lms_user -d $TEST_DB -t -c "SELECT COUNT(*) FROM users;")
COURSE_COUNT=$(psql -U lms_user -d $TEST_DB -t -c "SELECT COUNT(*) FROM courses;")

echo "Tables: $TABLE_COUNT"
echo "Users: $USER_COUNT"
echo "Courses: $COURSE_COUNT"

# Cleanup
dropdb $TEST_DB

if [ $TABLE_COUNT -gt 30 ] && [ $USER_COUNT -gt 0 ]; then
  echo "Backup verification PASSED"
  exit 0
else
  echo "Backup verification FAILED"
  exit 1
fi
```

**Run weekly:**
```bash
# Cron: Every Sunday at 4 AM
0 4 * * 0 /usr/local/bin/verify-backup.sh >> /var/log/backup-verify.log 2>&1
```

## Performance Monitoring

### Key Metrics to Track

1. **Response Time:**
   - API endpoints (p50, p95, p99)
   - Database queries
   - Page load time

2. **Throughput:**
   - Requests per second
   - Database transactions per second

3. **Error Rate:**
   - 4xx errors
   - 5xx errors
   - Database errors

4. **Resource Utilization:**
   - CPU usage
   - Memory usage
   - Disk I/O
   - Network I/O

5. **Application Metrics:**
   - Active users
   - Enrollments per day
   - Course completions
   - Quiz attempts

### Monitoring Tools Setup

**Prometheus + Grafana (Recommended):**
```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    volumes:
      - grafana-data:/var/lib/grafana
    ports:
      - "3003:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin

volumes:
  prometheus-data:
  grafana-data:
```

## Log Management

### Log Rotation Configuration

Create `/etc/logrotate.d/advanced-lms`:

```
/var/log/advanced-lms/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        docker-compose restart backend > /dev/null 2>&1 || true
    endscript
}
```

### Centralized Logging

**Using ELK Stack or alternatives:**
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Loki** (Grafana Loki)
- **Papertrail**
- **Loggly**
- **Splunk**

## Certificate Renewal

### Let's Encrypt Auto-Renewal

```bash
# Verify certbot timer is active
sudo systemctl status certbot.timer

# Test renewal
sudo certbot renew --dry-run

# Manual renewal (if needed)
sudo certbot renew

# Reload nginx after renewal
sudo systemctl reload nginx
```

### Certificate Expiry Monitoring

**Create monitoring script:**
```bash
#!/bin/bash
# /usr/local/bin/check-cert-expiry.sh

DOMAIN="yourdomain.com"
EXPIRY_DATE=$(echo | openssl s_client -connect $DOMAIN:443 2>/dev/null | \
  openssl x509 -noout -enddate | cut -d= -f2)

EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s)
NOW_EPOCH=$(date +%s)
DAYS_UNTIL_EXPIRY=$(( ($EXPIRY_EPOCH - $NOW_EPOCH) / 86400 ))

if [ $DAYS_UNTIL_EXPIRY -lt 30 ]; then
  echo "WARNING: SSL certificate expires in $DAYS_UNTIL_EXPIRY days"
  # Send alert email
  echo "Certificate expiring soon" | mail -s "SSL Alert" admin@yourdomain.com
fi
```

## Dependency Updates

### Update Strategy

1. **Review Updates Weekly**
2. **Test in Development**
3. **Deploy to Staging**
4. **Monitor for 24 Hours**
5. **Deploy to Production**

### Automated Dependency Checks

**Dependabot (GitHub):**
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/backend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10

  - package-ecosystem: "npm"
    directory: "/frontend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

**Renovate Bot:**
- Alternative to Dependabot
- More configuration options
- Supports monorepos

## Scaling Considerations

### When to Scale

**Indicators:**
- CPU usage > 70% sustained
- Memory usage > 80% sustained
- Response times increasing
- Database connections near max
- Disk space > 80% used

### Vertical Scaling (Scale Up)

**Upgrade Server Resources:**
```bash
# AWS: Change instance type
# DigitalOcean: Resize droplet
# Heroku: Upgrade dyno type

# Update resource limits in docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
```

### Horizontal Scaling (Scale Out)

**Load Balancer Setup:**
```nginx
# nginx load balancing
upstream backend_servers {
    least_conn;
    server backend1.internal:3001;
    server backend2.internal:3001;
    server backend3.internal:3001;
}

server {
    location /api {
        proxy_pass http://backend_servers;
    }
}
```

**Database Scaling:**
- **Read Replicas**: For read-heavy workloads
- **Connection Pooling**: PgBouncer
- **Sharding**: For massive scale (complex)

## Maintenance Windows

### Scheduled Maintenance

**Plan Maintenance Windows:**
- **Frequency**: Monthly or as needed
- **Duration**: 1-2 hours
- **Time**: Low-traffic period (2-4 AM local time)
- **Notification**: 7 days advance notice

**Maintenance Tasks:**
1. Apply critical updates
2. Database maintenance (VACUUM FULL)
3. Reindex databases
4. Server reboots
5. Major version upgrades

**Maintenance Checklist:**
- [ ] Notify users 7 days in advance
- [ ] Create full backup before maintenance
- [ ] Enable maintenance mode
- [ ] Perform updates
- [ ] Run smoke tests
- [ ] Disable maintenance mode
- [ ] Monitor for issues
- [ ] Send completion notification

## Monitoring Dashboard

### Recommended Metrics Dashboard

Create a dashboard showing:
1. **System Health:**
   - Server uptime
   - Application status
   - Database status
   - Redis status

2. **Performance:**
   - API response times
   - Database query times
   - Page load times

3. **Business Metrics:**
   - Active users (hourly/daily)
   - New registrations
   - Course enrollments
   - Quiz completions

4. **Errors:**
   - Error rate
   - Failed logins
   - Database errors

5. **Resources:**
   - CPU usage
   - Memory usage
   - Disk usage
   - Network traffic

## Additional Resources

- **Deployment Guide**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Troubleshooting**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Performance**: [../backend/PERFORMANCE_GUIDE.md](../backend/PERFORMANCE_GUIDE.md)
- **Security**: [../backend/SECURITY_HARDENING_GUIDE.md](../backend/SECURITY_HARDENING_GUIDE.md)

---

Regular maintenance ensures system reliability and security! 🔧
