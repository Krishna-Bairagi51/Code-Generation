import { BaseProvider } from '~/lib/modules/llm/base-provider';
import type { ModelInfo } from '~/lib/modules/llm/types';
import type { LanguageModelV1 } from 'ai';
import type { IProviderSetting } from '~/types/model';
import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';

interface AWSBedRockConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
}

export default class AmazonBedrockProvider extends BaseProvider {
  name = 'AmazonBedrock';
  getApiKeyLink = 'https://console.aws.amazon.com/iam/home';

  config = {
    apiTokenKey: 'AWS_BEDROCK_CONFIG',
  };

  staticModels: ModelInfo[] = [
    {
      name: 'us.anthropic.claude-opus-4-5-20251101-v1:0',
      label: 'Claude Opus 4.5 (200K)',
      provider: 'AmazonBedrock',
      maxTokenAllowed: 200000,
    },
    {
      name: 'us.anthropic.claude-haiku-4-5-20251001-v1:0',
      label: 'Claude Haiku 4.5 (200K)',
      provider: 'AmazonBedrock',
      maxTokenAllowed: 200000,
    },
    {
      name: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
      label: 'Claude 3.5 Sonnet v2 (200K)',
      provider: 'AmazonBedrock',
      maxTokenAllowed: 200000,
    },
    {
      name: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
      label: 'Claude 3.5 Sonnet (200K)',
      provider: 'AmazonBedrock',
      maxTokenAllowed: 200000,
    },
    {
      name: 'anthropic.claude-3-sonnet-20240229-v1:0',
      label: 'Claude 3 Sonnet (200K)',
      provider: 'AmazonBedrock',
      maxTokenAllowed: 200000,
    },
    {
      name: 'anthropic.claude-3-haiku-20240307-v1:0',
      label: 'Claude 3 Haiku (200K)',
      provider: 'AmazonBedrock',
      maxTokenAllowed: 200000,
    },
    {
      name: 'amazon.nova-pro-v1:0',
      label: 'Amazon Nova Pro (300K)',
      provider: 'AmazonBedrock',
      maxTokenAllowed: 300000,
    },
    {
      name: 'amazon.nova-lite-v1:0',
      label: 'Amazon Nova Lite (300K)',
      provider: 'AmazonBedrock',
      maxTokenAllowed: 300000,
    },
    {
      name: 'mistral.mistral-large-2402-v1:0',
      label: 'Mistral Large (128K)',
      provider: 'AmazonBedrock',
      maxTokenAllowed: 128000,
    },
  ];

  private _parseAndValidateConfig(apiKey: string, serverEnv?: any): AWSBedRockConfig {
    // First, try to use separate environment variables (more reliable for Docker)
    const envRegion = serverEnv?.AWS_BEDROCK_REGION || process.env.AWS_BEDROCK_REGION;
    const envAccessKey = serverEnv?.AWS_BEDROCK_ACCESS_KEY_ID || process.env.AWS_BEDROCK_ACCESS_KEY_ID;
    const envSecretKey = serverEnv?.AWS_BEDROCK_SECRET_ACCESS_KEY || process.env.AWS_BEDROCK_SECRET_ACCESS_KEY;
    const envSessionToken = serverEnv?.AWS_BEDROCK_SESSION_TOKEN || process.env.AWS_BEDROCK_SESSION_TOKEN;

    if (envRegion && envAccessKey && envSecretKey) {
      return {
        region: envRegion,
        accessKeyId: envAccessKey,
        secretAccessKey: envSecretKey,
        ...(envSessionToken && { sessionToken: envSessionToken }),
      };
    }

    // Fallback to JSON config
    let parsedConfig: AWSBedRockConfig;

    try {
      parsedConfig = JSON.parse(apiKey);
    } catch {
      throw new Error(
        'Invalid AWS Bedrock configuration. Either set AWS_BEDROCK_REGION, AWS_BEDROCK_ACCESS_KEY_ID, AWS_BEDROCK_SECRET_ACCESS_KEY as separate env vars, or provide AWS_BEDROCK_CONFIG as valid JSON.',
      );
    }

    const { region, accessKeyId, secretAccessKey, sessionToken } = parsedConfig;

    if (!region || !accessKeyId || !secretAccessKey) {
      throw new Error(
        'Missing required AWS credentials. Configuration must include region, accessKeyId, and secretAccessKey.',
      );
    }

    return {
      region,
      accessKeyId,
      secretAccessKey,
      ...(sessionToken && { sessionToken }),
    };
  }

  getModelInstance(options: {
    model: string;
    serverEnv: any;
    apiKeys?: Record<string, string>;
    providerSettings?: Record<string, IProviderSetting>;
  }): LanguageModelV1 {
    const { model, serverEnv, apiKeys, providerSettings } = options;

    const { apiKey } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings: providerSettings?.[this.name],
      serverEnv: serverEnv as any,
      defaultBaseUrlKey: '',
      defaultApiTokenKey: 'AWS_BEDROCK_CONFIG',
    });

    if (!apiKey) {
      // Check if separate env vars are set before throwing error
      const envRegion = serverEnv?.AWS_BEDROCK_REGION || process.env.AWS_BEDROCK_REGION;
      const envAccessKey = serverEnv?.AWS_BEDROCK_ACCESS_KEY_ID || process.env.AWS_BEDROCK_ACCESS_KEY_ID;
      const envSecretKey = serverEnv?.AWS_BEDROCK_SECRET_ACCESS_KEY || process.env.AWS_BEDROCK_SECRET_ACCESS_KEY;

      if (!envRegion || !envAccessKey || !envSecretKey) {
        throw new Error(`Missing API key for ${this.name} provider`);
      }
    }

    const config = this._parseAndValidateConfig(apiKey || '{}', serverEnv);
    const bedrock = createAmazonBedrock(config);

    return bedrock(model);
  }
}
