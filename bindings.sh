#!/bin/bash

bindings=""

# Function to extract variable names from the TypeScript interface
extract_env_vars() {
  grep -o '[A-Z_]\+:' worker-configuration.d.ts | sed 's/://'
}

# Additional env vars not in .d.ts but used by the app
EXTRA_VARS="AWS_BEDROCK_REGION AWS_BEDROCK_ACCESS_KEY_ID AWS_BEDROCK_SECRET_ACCESS_KEY AWS_BEDROCK_SESSION_TOKEN"

# In Docker, always prefer environment variables over file
# This handles --env-file passed to docker run
if [ "$RUNNING_IN_DOCKER" = "true" ]; then
  # Use environment variables from .d.ts
  env_vars=($(extract_env_vars))
  
  # Add extra vars
  env_vars+=($EXTRA_VARS)
  
  for var in "${env_vars[@]}"; do
    if [ -n "${!var}" ]; then
      bindings+="--binding ${var}=${!var} "
    fi
  done
# If not in Docker, try .env.local file first
elif [ -f ".env.local" ]; then
  while IFS= read -r line || [ -n "$line" ]; do
    if [[ ! "$line" =~ ^# ]] && [[ -n "$line" ]]; then
      name=$(echo "$line" | cut -d '=' -f 1)
      value=$(echo "$line" | cut -d '=' -f 2-)
      value=$(echo $value | sed 's/^"\(.*\)"$/\1/')
      bindings+="--binding ${name}=${value} "
    fi
  done < .env.local
else
  # Fallback: use environment variables
  env_vars=($(extract_env_vars))
  env_vars+=($EXTRA_VARS)
  
  for var in "${env_vars[@]}"; do
    if [ -n "${!var}" ]; then
      bindings+="--binding ${var}=${!var} "
    fi
  done
fi

bindings=$(echo $bindings | sed 's/[[:space:]]*$//')

echo $bindings