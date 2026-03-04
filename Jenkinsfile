pipeline {
  agent any

  environment {
    REPO_DIR = "/opt/orderdp/repo-dispatch"
    SERVICE  = "orderDP-dispatch-api"

    GIT_URL  = "git@github.com:esats/OrderDispatcher.DispatchService.git"
    BRANCH   = "master"
  }

  stages {

    stage('Checkout') {
      steps {
        sh '''
          set -euo pipefail

          mkdir -p "$REPO_DIR"

          if [ -d "$REPO_DIR/.git" ]; then
            cd "$REPO_DIR"
            git remote set-url origin "$GIT_URL"
            git fetch --all --prune
            git checkout "$BRANCH" || git checkout -b "$BRANCH"
            git reset --hard "origin/$BRANCH"
            git clean -fd
          else
            rm -rf "$REPO_DIR"/*
            git clone --branch "$BRANCH" --single-branch "$GIT_URL" "$REPO_DIR"
          fi

          cd "$REPO_DIR"
          echo "Commit:"
          git rev-parse --short HEAD

          echo "Repo top-level:"
          ls -la
        '''
      }
    }

    stage('Install & Build') {
      steps {
        sh '''
          set -euo pipefail

          cd "$REPO_DIR"

          echo "Node version: $(node -v)"
          echo "NPM version:  $(npm -v)"

          npm install

          npm run build

          echo "Build output:"
          ls -la "$REPO_DIR/dist/"
        '''
      }
    }

    stage('Restart service') {
      steps {
        sh '''
          set -euo pipefail
          sudo -n /usr/bin/systemctl restart "$SERVICE"
          sudo -n /usr/bin/systemctl status "$SERVICE" --no-pager
        '''
      }
    }
  }
}
