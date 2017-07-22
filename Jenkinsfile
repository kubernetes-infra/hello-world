#!groovy

properties([
  parameters([
    string(
      name: 'K8S_CLUSTER',
      defaultValue: 'kubernetes.demo',
      description: 'The Kubernetes Cluster you want to deploy to',
    ),
  ])
])

node('jenkins-docker-3') {
  ws {
    try {
      def conf = [
        NAME: 'kubernetes-infra/hello-world',
        TAG: "${env.BRANCH_NAME}-${env.BUILD_NUMBER}",
        REGISTRY: 'k8sinfra.azurecr.io',
        VERSION: 'v1.0.0',
        HOSTNAME: 'hello-world.evry.fun',
        DEPLOY: 'true',
      ]

      stage('Checkout') {
        checkout scm
      }

      stage('Install') {
        docker.image('node:8-alpine').inside() {
          sh 'yarn install --development'
        }
      }

      stage('Lint') {
        docker.image('node:8-alpine').inside() {
          sh 'yarn run lint'
        }
      }

      stage('Test') {
        docker.image('node:8-alpine').inside() {
          sh 'yarn run test'
        }
      }

      stage('Prune') {
        docker.image('node:8-alpine').inside() {
          sh 'yarn install --production'
        }
      }

      stage('Docker Build') {
        conf.DOCKER_IMAGE = "${conf.REGISTRY}/${conf.NAME}:${conf.TAG}"
        image = docker.build(conf.DOCKER_IMAGE)
      }

      stage('Docker Push') {
        docker.withRegistry("https://${conf.REGISTRY}", conf.REGISTRY) {
          image.push()
        }
      }

      stage("Deploy") {
        def Boolean dryrun = conf.DEPLOY != 'true'

        kubernetesDeploy(conf, [k8sCluster: env.K8S_CLUSTER, dryrun: dryrun])
      }
    } catch (InterruptedException e) {
      throw e
    } catch (e) {
      throw e
    } finally {
      step([$class: 'WsCleanup'])
      // Wait for Jenkins asynchronous resource disposer to pick up before we
      // close the connection to the worker node.
      sleep 10
    }
  }
}
