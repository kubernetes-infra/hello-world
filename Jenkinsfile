#!groovy

properties([
  parameters([
    string(
      name: 'K8S_CLUSTER',
      defaultValue: 'kubernetes.demo',
      description: 'The Kubernetes Cluster you want to deploy to',
    ),
    string(
      name: 'DOCKER_REGISTRY',
      defaultValue: 'k8sinfra.azurecr.io',
      description: 'The Docker Registry you want to push the Docker Image to',
    ),
    string(
      name: 'APP_HOSTNAME',
      defaultValue: 'hello-world.evry.fun',
      description: 'Resolvable DNS name for the application',
    ),
  ])
])

node('jenkins-docker-3') {
  ws {
    try {
      def conf = [
        NAME: 'kubernetes-infra/hello-world',
        TAG: "${env.BRANCH_NAME}-${env.BUILD_NUMBER}",
        VERSION: 'v1.0.0',
        HOSTNAME: env.APP_HOSTNAME,
        DEPLOY: 'true',
      ]

      stage('Checkout') {
        checkout scm
      }

      def nodeImage = 'node:8-alpine'
      def nodeArgs = [
        '-v /home/jenkins/.cache/yarn:/home/node/.cache/yarn'
      ].join(' ')

      stage('Install') {
        docker.image(nodeImage).inside(nodeArgs) {
          sh 'cd app && yarn install --development'
        }
      }

      parallel (
        "nsp": {
          stage('NSP') {
            docker.image(nodeImage).inside(nodeArgs) {
              sh 'cd app && yarn run nsp check'
            }
          }
        },

        "lint" : {
          stage('Lint') {
            docker.image(nodeImage).inside(nodeArgs) {
              sh 'cd app && yarn run lint'
            }
          }
        },

        "test" : {
          stage('Test') {
            docker.image(nodeImage).inside(nodeArgs) {
              sh 'cd app && yarn run test'
            }
          }
        }
      )

      stage('Prune') {
        docker.image(nodeImage).inside(nodeArgs) {
          sh 'cd app && yarn install --production'
        }
      }

      stage('Docker Build') {
        conf.DOCKER_IMAGE = "${DOCKER_REGISTRY}/${conf.NAME}:${conf.TAG}"
        image = docker.build(conf.DOCKER_IMAGE)
      }

      stage('Docker Push') {
        docker.withRegistry("https://${DOCKER_REGISTRY}", DOCKER_REGISTRY) {
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
