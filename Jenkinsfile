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

@Library('utils')

import no.evry.Docker

node('jenkins-docker-3') {
  // Make a clean workspace for the new build to prevent multiple concurrent
  // builds from polluting the others working directory.
  ws {

    // Wrap everything in a try/catch block in order to trap exceptions and
    // process them before exiting.
    try {

      def dconf = new Docker(this)

      def conf = [
        NAME: "kubernetes-infra/${dconf.imageName()}",
        TAG: dconf.buildTag(),
        VERSION: 'v1.0.0',
        HOSTNAME: env.APP_HOSTNAME,
        DEPLOY: 'true',
      ]

      def nodeImage = 'node:8-alpine'
      def nodeArgs = [
        '-v /home/jenkins/.cache/yarn:/home/node/.cache/yarn'
      ].join(' ')

      // Jenkins pipelines are "dumb" in that regards that it does not do
      // anything unless you explicitly tells it so. Here we checkout the
      // repository in order to the source code into the workspace.
      stage('Checkout') {
        checkout scm
      }

      // Install all packge dependencies specificed in package.json. We also
      // need to install development dependencies in order to build and test the
      // application. We will remove these later in the "Prune" stage.
      stage('Install') {
        docker.image(nodeImage).inside(nodeArgs) {
          sh 'cd app && yarn install --development'
        }
      }

      // Built all frontend assets required for running this application in
      // production. Here we are using the Grunt task runner, see Gruntfile for
      // how this is otherwise configured.
      stage('Build') {
        docker.image(nodeImage).inside(nodeArgs) {
          sh 'cd app && yarn run grunt'
        }
      }

      // Speed up builds by running multiple tasks in parallel. Keep in mind
      // that these tasks can not depend on each other and should not modify the
      // sharedstate of the workspace.
      parallel (

        // nsp (Node Security Project) is a security scanner for Node.js
        // packages. It will check against it's database for known
        // vulnerabilities and block any builds containing vulnerable packages.
        "nsp": {
          docker.image(nodeImage).inside(nodeArgs) {
            sh 'cd app && yarn run nsp check'
          }
        },

        // Syntax linting checks the style of the source code to make sure the
        // code follows a common standard. ESLint is the recommended tool for
        // all Node.js and JavaScript projects.
        "lint" : {
          docker.image(nodeImage).inside(nodeArgs) {
            sh 'cd app && yarn run lint'
          }
        },

        // Run the test suite for the application. In any normal project this is
        // the part that takes the most time. One should always stribe to
        // optimise the tests in order to make them execute faster; no one likes
        // to wait for them tests to complete!
        "test" : {
          docker.image(nodeImage).inside(nodeArgs) {
            sh 'cd app && yarn run test'
          }
        }
      )

      // Remove all development packages such that the node_modules directory
      // only contains packages needed for running the application in
      // production. This is to save space and ensure identical packages in
      // Jenkins and in production.
      stage('Prune') {
        docker.image(nodeImage).inside(nodeArgs) {
          sh 'cd app && yarn install --production'
        }
      }

      // Build the Docker Image, image tag should be unique to the build to
      // prevent building over other images. See the Dockerfile for how the
      // Docker Image is otherwise constructed.
      stage('Docker Build') {
        conf.DOCKER_REGISTRY = env.DOCKER_REGISTRY
        conf.DOCKER_IMAGE = "${conf.DOCKER_REGISTRY}/${conf.NAME}:${conf.TAG}"

        image = docker.build(conf.DOCKER_IMAGE)
      }

      // Push the newly built Docker Image to a Docker Registry of your choosing
      // in order to reach it later in the deployment stage.
      stage('Docker Push') {
        docker.withRegistry("https://${env.DOCKER_REGISTRY}", env.DOCKER_REGISTRY) {
          image.push()
        }
      }

      // Deploy the application to Kubernetes. See the Jenkins Utility repo for
      // more information about the kubernetesDeploy function and it's configs.
      stage("Deploy") {
        def Boolean dryrun = conf.DEPLOY != 'true'

        kubernetesDeploy(conf, [k8sCluster: env.K8S_CLUSTER, dryrun: dryrun])
      }

    // Catch abort build interrupts and possible handle them differently. They
    // should not be reported as build failures to Slack etc.
    } catch (InterruptedException e) {
      throw e

    // Catch all build failures and report them to Slack etc here.
    } catch (e) {
      throw e

    // Clean up the workspace before exiting. Wait for Jenkins' asynchronous
    // resource disposer to pick up before we close the connection to the worker
    // node.
    } finally {
      step([$class: 'WsCleanup'])
      sleep 10
    }
  }
}
