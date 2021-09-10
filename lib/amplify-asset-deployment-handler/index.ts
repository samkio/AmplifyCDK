import { IsCompleteResponse } from "@aws-cdk/custom-resources/lib/provider-framework/types";
import * as aws from "aws-sdk";
import { AmplifyAssetDeploymentHandler } from "./handler";
import * as AWSLambda from "aws-lambda";

const AMPLIFY_ASSET_DEPLOYMENT_RESOURCE_TYPE = "Custom::AmplifyAssetDeployment";

aws.config.logger = console;

const amplify = new aws.Amplify();
const s3 = new aws.S3();

export async function onEvent(
  event: AWSLambda.CloudFormationCustomResourceEvent
) {
  const provider = createResourceHandler(event);
  return provider.onEvent();
}

export async function isComplete(
  event: AWSLambda.CloudFormationCustomResourceEvent
): Promise<IsCompleteResponse> {
  const provider = createResourceHandler(event);
  return provider.isComplete();
}

function createResourceHandler(
  event: AWSLambda.CloudFormationCustomResourceEvent
) {
  switch (event.ResourceType) {
    case AMPLIFY_ASSET_DEPLOYMENT_RESOURCE_TYPE:
      return new AmplifyAssetDeploymentHandler(amplify, s3, event);
    default:
      throw new Error(`Unsupported resource type "${event.ResourceType}`);
  }
}
