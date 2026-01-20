#!/bin/bash

bindings=""

# Function to extract variable names from the TypeScript interface
extract_env_vars() {
  grep -oE '[A-Za-z_][A-Za-z0-9_]*:' worker-configuration.d.ts | sed 's/://'
}

# Function to properly escape value for shell
escape_value() {
  local val="$1"
  # Remove surrounding quotes if present
  val="${val#\"}"
  val="${val%\"}"
  val="${val#\'}"
  val="${val%\'}"
  echo "$val"
}

# First try to read from .env.local if it exists
if [ -f ".env.local" ]; then
  while IFS= read -r line || [ -n "$line" ]; do
    # Skip comments and empty lines
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "${line// }" ]] && continue
    
    # Extract name (everything before first =)
    name="${line%%=*}"
    # Extract value (everything after first =, preserving the rest including any = signs)
    value="${line#*=}"
    
    # Clean up the value
    value=$(escape_value "$value")
    
    # Skip if name or value is empty
    if [[ -n "$name" ]] && [[ -n "$value" ]]; then
      # Escape double quotes and backslashes in value for safe shell passing
      escaped_value="${value//\\/\\\\}"
      escaped_value="${escaped_value//\"/\\\"}"
      bindings="${bindings} --binding ${name}=\"${escaped_value}\""
    fi
  done < .env.local
else
  # If .env.local doesn't exist, use environment variables defined in .d.ts
  env_vars=($(extract_env_vars))
  # Generate bindings for each environment variable if it exists
  for var in "${env_vars[@]}"; do
    value="${!var}"
    if [ -n "$value" ]; then
      # Escape double quotes and backslashes in value for safe shell passing
      escaped_value="${value//\\/\\\\}"
      escaped_value="${escaped_value//\"/\\\"}"
      bindings="${bindings} --binding ${var}=\"${escaped_value}\""
    fi
  done
fi

# Trim leading/trailing whitespace
bindings="${bindings## }"
bindings="${bindings%% }"

echo "$bindings"
