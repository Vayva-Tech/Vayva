#!/bin/bash

# Notification Engine Deployment Script
# Deploys the notification engine to production Kubernetes cluster

set -e

echo "🚀 Starting Notification Engine Deployment..."

# Variables
NAMESPACE="vayva-production"
DEPLOYMENT_NAME="notification-engine"
IMAGE_NAME="vayva/notification-engine"
TAG=${1:-latest}

echo "📦 Building Docker image..."
docker build -t ${IMAGE_NAME}:${TAG} -f ./packages/notification-engine/Dockerfile .

echo "📤 Pushing to container registry..."
docker push ${IMAGE_NAME}:${TAG}

echo "🔄 Deploying to Kubernetes..."
kubectl apply -f ./deployment/notification-engine-deployment.yaml

echo "🔍 Checking deployment status..."
kubectl rollout status deployment/${DEPLOYMENT_NAME} -n ${NAMESPACE}

echo "📊 Deployment completed successfully!"
echo "Image: ${IMAGE_NAME}:${TAG}"
echo "Namespace: ${NAMESPACE}"

# Health check
echo "🩺 Performing health check..."
sleep 30
kubectl get pods -n ${NAMESPACE} -l app=notification-engine

echo "✅ Notification Engine deployment complete!"