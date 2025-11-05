#!/bin/bash

# Work Redesign Platform Deployment Script
# Usage: ./deploy.sh [environment] [action]
# Example: ./deploy.sh production deploy

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-development}
ACTION=${2:-deploy}
PROJECT_NAME="work-redesign-platform"

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

check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    # Check if environment file exists
    if [ "$ENVIRONMENT" = "production" ] && [ ! -f ".env.production" ]; then
        log_error "Production environment file (.env.production) not found."
        log_info "Copy .env.example to .env.production and configure it."
        exit 1
    fi

    log_success "Prerequisites check passed"
}

setup_environment() {
    log_info "Setting up environment for $ENVIRONMENT..."

    # Copy appropriate environment file
    if [ "$ENVIRONMENT" = "production" ]; then
        cp .env.production .env
        log_info "Using production environment"
    elif [ "$ENVIRONMENT" = "staging" ]; then
        cp .env.staging .env
        log_info "Using staging environment"
    else
        cp .env.example .env
        log_info "Using development environment"
    fi

    # Create necessary directories
    mkdir -p logs/nginx
    mkdir -p nginx/ssl

    # Set permissions
    chmod +x scripts/*.sh

    log_success "Environment setup completed"
}

build_images() {
    log_info "Building Docker images..."

    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f docker-compose.prod.yml build --no-cache
    else
        docker-compose build --no-cache
    fi

    log_success "Docker images built successfully"
}

deploy_application() {
    log_info "Deploying application..."

    if [ "$ENVIRONMENT" = "production" ]; then
        # Production deployment
        log_info "Starting production deployment..."

        # Pull latest images
        docker-compose -f docker-compose.prod.yml pull

        # Start services
        docker-compose -f docker-compose.prod.yml up -d

        # Wait for services to be healthy
        log_info "Waiting for services to be ready..."
        sleep 30

        # Run database migrations
        log_info "Running database migrations..."
        docker-compose -f docker-compose.prod.yml exec -T backend npm run migrate:deploy

        # Check health
        check_health_production

    else
        # Development deployment
        log_info "Starting development deployment..."

        # Start services
        docker-compose up -d

        # Wait for services
        sleep 15

        # Run migrations
        docker-compose exec -T backend npm run migrate

        # Seed database
        docker-compose exec -T backend npm run seed

        # Check health
        check_health_development
    fi

    log_success "Application deployed successfully"
}

check_health_production() {
    log_info "Checking production health..."

    # Check backend health
    if curl -f http://localhost/health > /dev/null 2>&1; then
        log_success "Backend is healthy"
    else
        log_error "Backend health check failed"
        show_logs
        exit 1
    fi

    # Check frontend
    if curl -f http://localhost > /dev/null 2>&1; then
        log_success "Frontend is healthy"
    else
        log_error "Frontend health check failed"
        show_logs
        exit 1
    fi
}

check_health_development() {
    log_info "Checking development health..."

    # Check backend health
    if curl -f http://localhost:4000/health > /dev/null 2>&1; then
        log_success "Backend is healthy"
    else
        log_error "Backend health check failed"
        show_logs
        exit 1
    fi

    # Check frontend
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log_success "Frontend is healthy"
    else
        log_error "Frontend health check failed"
        show_logs
        exit 1
    fi
}

show_logs() {
    log_info "Showing recent logs..."

    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f docker-compose.prod.yml logs --tail=50
    else
        docker-compose logs --tail=50
    fi
}

stop_application() {
    log_info "Stopping application..."

    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f docker-compose.prod.yml down
    else
        docker-compose down
    fi

    log_success "Application stopped"
}

cleanup() {
    log_info "Cleaning up..."

    # Remove unused Docker resources
    docker system prune -f

    # Remove unused volumes (with confirmation)
    read -p "Do you want to remove unused volumes? This will delete data! (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker volume prune -f
        log_warning "Unused volumes removed"
    fi

    log_success "Cleanup completed"
}

backup_data() {
    log_info "Creating data backup..."

    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"

    # Backup database
    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U $DB_USER $DB_NAME > "$BACKUP_DIR/database.sql"
    else
        docker-compose exec -T postgres pg_dump -U workredesign work_redesign > "$BACKUP_DIR/database.sql"
    fi

    # Backup uploaded files (if any)
    if [ -d "uploads" ]; then
        cp -r uploads "$BACKUP_DIR/"
    fi

    # Backup environment file
    cp .env "$BACKUP_DIR/"

    log_success "Backup created at $BACKUP_DIR"
}

show_status() {
    log_info "Application status:"

    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f docker-compose.prod.yml ps
    else
        docker-compose ps
    fi
}

show_help() {
    echo "Work Redesign Platform Deployment Script"
    echo ""
    echo "Usage: $0 [environment] [action]"
    echo ""
    echo "Environments:"
    echo "  development  - Development environment (default)"
    echo "  staging      - Staging environment"
    echo "  production   - Production environment"
    echo ""
    echo "Actions:"
    echo "  deploy       - Deploy the application (default)"
    echo "  build        - Build Docker images only"
    echo "  stop         - Stop the application"
    echo "  restart      - Restart the application"
    echo "  logs         - Show application logs"
    echo "  status       - Show service status"
    echo "  backup       - Create data backup"
    echo "  cleanup      - Clean up unused Docker resources"
    echo "  help         - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                           # Deploy development environment"
    echo "  $0 production deploy         # Deploy to production"
    echo "  $0 production stop           # Stop production services"
    echo "  $0 development logs          # Show development logs"
}

# Main execution
main() {
    case $ACTION in
        deploy)
            check_prerequisites
            setup_environment
            build_images
            deploy_application
            ;;
        build)
            check_prerequisites
            build_images
            ;;
        stop)
            stop_application
            ;;
        restart)
            stop_application
            sleep 5
            deploy_application
            ;;
        logs)
            show_logs
            ;;
        status)
            show_status
            ;;
        backup)
            backup_data
            ;;
        cleanup)
            cleanup
            ;;
        help)
            show_help
            ;;
        *)
            log_error "Unknown action: $ACTION"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main

log_success "Deployment script completed!"

if [ "$ACTION" = "deploy" ]; then
    echo ""
    log_info "Application URLs:"
    if [ "$ENVIRONMENT" = "production" ]; then
        echo "  Frontend: http://localhost"
        echo "  Backend:  http://localhost/api"
        echo "  Health:   http://localhost/health"
    else
        echo "  Frontend: http://localhost:3000"
        echo "  Backend:  http://localhost:4000"
        echo "  Health:   http://localhost:4000/health"
    fi
    echo ""
    log_info "To view logs: ./deploy.sh $ENVIRONMENT logs"
    log_info "To check status: ./deploy.sh $ENVIRONMENT status"
fi