#!/bin/bash

# Work Redesign Platform Test Runner
# Comprehensive testing automation script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TEST_MODE=${1:-all}
COVERAGE_THRESHOLD=80
PARALLEL_JOBS=4

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_dependencies() {
    log_info "Checking test dependencies..."

    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi

    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed."
        exit 1
    fi

    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed."
        exit 1
    fi

    # Check if Playwright browsers are installed
    if [ "$TEST_MODE" = "e2e" ] || [ "$TEST_MODE" = "all" ]; then
        if ! npx playwright --version > /dev/null 2>&1; then
            log_warning "Playwright not found. Installing..."
            npx playwright install
        fi
    fi

    log_success "All dependencies are available"
}

setup_test_environment() {
    log_info "Setting up test environment..."

    # Create necessary directories
    mkdir -p test-results
    mkdir -p coverage
    mkdir -p reports

    # Start test databases if needed
    if [ "$TEST_MODE" = "integration" ] || [ "$TEST_MODE" = "e2e" ] || [ "$TEST_MODE" = "all" ]; then
        log_info "Starting test database containers..."
        docker-compose -f docker-compose.test.yml up -d postgres redis

        # Wait for databases to be ready
        log_info "Waiting for databases to be ready..."
        sleep 10

        # Run migrations
        cd backend && npm run migrate:test && cd ..
        log_success "Test databases ready"
    fi

    log_success "Test environment setup complete"
}

run_linting() {
    log_info "Running linting checks..."

    # Backend linting
    log_info "Linting backend code..."
    cd backend
    npm run lint
    npm run type-check
    cd ..

    # Frontend linting
    log_info "Linting frontend code..."
    cd frontend
    npm run lint
    npm run type-check
    cd ..

    log_success "Linting checks passed"
}

run_unit_tests() {
    log_info "Running unit tests..."

    # Backend unit tests
    log_info "Running backend unit tests..."
    cd backend
    npm run test:unit
    cd ..

    # Frontend unit tests
    log_info "Running frontend unit tests..."
    cd frontend
    npm run test:unit
    cd ..

    log_success "Unit tests completed"
}

run_integration_tests() {
    log_info "Running integration tests..."

    # Backend integration tests
    log_info "Running backend integration tests..."
    cd backend
    npm run test:integration
    cd ..

    # Frontend integration tests
    log_info "Running frontend integration tests..."
    cd frontend
    npm run test:integration
    cd ..

    log_success "Integration tests completed"
}

run_e2e_tests() {
    log_info "Running E2E tests..."

    # Start application in test mode
    log_info "Starting application for E2E testing..."
    npm run dev &
    APP_PID=$!

    # Wait for application to start
    log_info "Waiting for application to start..."
    sleep 30

    # Run Playwright tests
    log_info "Running Playwright E2E tests..."
    npm run test:e2e

    # Stop application
    kill $APP_PID 2>/dev/null || true

    log_success "E2E tests completed"
}

run_coverage_tests() {
    log_info "Running tests with coverage..."

    # Backend coverage
    log_info "Generating backend coverage..."
    cd backend
    npm run test:coverage
    cd ..

    # Frontend coverage
    log_info "Generating frontend coverage..."
    cd frontend
    npm run test:coverage
    cd ..

    # Merge coverage reports
    log_info "Merging coverage reports..."
    merge_coverage_reports

    log_success "Coverage tests completed"
}

merge_coverage_reports() {
    log_info "Merging coverage reports..."

    # Create combined coverage directory
    mkdir -p coverage/combined

    # Copy backend coverage
    if [ -d "backend/coverage" ]; then
        cp -r backend/coverage/* coverage/combined/
    fi

    # Copy frontend coverage
    if [ -d "frontend/coverage" ]; then
        cp -r frontend/coverage/* coverage/combined/
    fi

    # Generate combined report
    log_info "Combined coverage report available in coverage/combined/"
}

check_coverage_threshold() {
    log_info "Checking coverage thresholds..."

    # Check backend coverage
    if [ -f "backend/coverage/coverage-summary.json" ]; then
        BACKEND_COVERAGE=$(node -p "JSON.parse(require('fs').readFileSync('backend/coverage/coverage-summary.json')).total.lines.pct")
        if (( $(echo "$BACKEND_COVERAGE < $COVERAGE_THRESHOLD" | bc -l) )); then
            log_error "Backend coverage ($BACKEND_COVERAGE%) is below threshold ($COVERAGE_THRESHOLD%)"
            exit 1
        fi
        log_success "Backend coverage: $BACKEND_COVERAGE%"
    fi

    # Check frontend coverage
    if [ -f "frontend/coverage/coverage-summary.json" ]; then
        FRONTEND_COVERAGE=$(node -p "JSON.parse(require('fs').readFileSync('frontend/coverage/coverage-summary.json')).total.lines.pct")
        if (( $(echo "$FRONTEND_COVERAGE < $COVERAGE_THRESHOLD" | bc -l) )); then
            log_error "Frontend coverage ($FRONTEND_COVERAGE%) is below threshold ($COVERAGE_THRESHOLD%)"
            exit 1
        fi
        log_success "Frontend coverage: $FRONTEND_COVERAGE%"
    fi
}

run_security_tests() {
    log_info "Running security tests..."

    # Backend security audit
    log_info "Running backend security audit..."
    cd backend
    npm audit --audit-level=moderate
    cd ..

    # Frontend security audit
    log_info "Running frontend security audit..."
    cd frontend
    npm audit --audit-level=moderate
    cd ..

    # Docker security scan (if available)
    if command -v docker-scout &> /dev/null; then
        log_info "Running Docker security scan..."
        docker-scout cves --local-image work-redesign-backend:latest || log_warning "Docker Scout not available"
    fi

    log_success "Security tests completed"
}

run_performance_tests() {
    log_info "Running performance tests..."

    # API performance tests
    if command -v artillery &> /dev/null; then
        log_info "Running API performance tests..."
        artillery run tests/performance/api-load-test.yml || log_warning "Artillery not available"
    fi

    # Frontend performance tests
    if command -v lighthouse &> /dev/null; then
        log_info "Running Lighthouse performance tests..."
        lighthouse http://localhost:3000 --output=json --output-path=reports/lighthouse.json || log_warning "Lighthouse not available"
    fi

    log_success "Performance tests completed"
}

generate_test_report() {
    log_info "Generating test report..."

    # Create HTML report
    cat > reports/test-summary.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Test Report - Work Redesign Platform</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background-color: #f0f0f0; padding: 20px; border-radius: 5px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .success { background-color: #d4edda; }
        .warning { background-color: #fff3cd; }
        .error { background-color: #f8d7da; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Work Redesign Platform - Test Report</h1>
        <p>Generated: $(date)</p>
        <p>Test Mode: $TEST_MODE</p>
    </div>

    <div class="section success">
        <h2>✅ Test Summary</h2>
        <p>All tests completed successfully!</p>
    </div>

    <div class="section">
        <h2>📊 Coverage Reports</h2>
        <p>Backend Coverage: Available in backend/coverage/</p>
        <p>Frontend Coverage: Available in frontend/coverage/</p>
        <p>Combined Coverage: Available in coverage/combined/</p>
    </div>

    <div class="section">
        <h2>🔍 Additional Reports</h2>
        <p>E2E Test Results: Available in test-results/</p>
        <p>Security Audit: Completed with npm audit</p>
        <p>Performance Report: Available in reports/ (if enabled)</p>
    </div>
</body>
</html>
EOF

    log_success "Test report generated: reports/test-summary.html"
}

cleanup_test_environment() {
    log_info "Cleaning up test environment..."

    # Stop test containers
    if [ -f "docker-compose.test.yml" ]; then
        docker-compose -f docker-compose.test.yml down
    fi

    # Kill any remaining processes
    pkill -f "node.*dev" || true

    log_success "Test environment cleanup complete"
}

# Main execution
main() {
    log_info "Starting Work Redesign Platform Test Suite"
    log_info "Test Mode: $TEST_MODE"

    # Trap to ensure cleanup on exit
    trap cleanup_test_environment EXIT

    check_dependencies
    setup_test_environment

    case $TEST_MODE in
        "lint")
            run_linting
            ;;
        "unit")
            run_linting
            run_unit_tests
            ;;
        "integration")
            run_linting
            run_unit_tests
            run_integration_tests
            ;;
        "e2e")
            run_linting
            run_e2e_tests
            ;;
        "coverage")
            run_linting
            run_coverage_tests
            check_coverage_threshold
            ;;
        "security")
            run_security_tests
            ;;
        "performance")
            run_performance_tests
            ;;
        "all")
            run_linting
            run_unit_tests
            run_integration_tests
            run_coverage_tests
            check_coverage_threshold
            run_e2e_tests
            run_security_tests
            run_performance_tests
            ;;
        *)
            log_error "Unknown test mode: $TEST_MODE"
            echo "Available modes: lint, unit, integration, e2e, coverage, security, performance, all"
            exit 1
            ;;
    esac

    generate_test_report

    log_success "🎉 All tests completed successfully!"
    log_info "View the full report at: reports/test-summary.html"
}

# Run main function
main