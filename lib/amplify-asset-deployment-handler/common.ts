import {
  IsCompleteResponse,
  OnEventResponse,
} from "@aws-cdk/custom-resources/lib/provider-framework/types";

export interface AmplifyJobId {
  /**
   * If this field is included in an event passed to "IsComplete", it means we
   * initiated an Amplify deployment that should be monitored using
   * amplify:GetJob
   */
  AmplifyJobId?: string;
}

export type ResourceEvent = AWSLambda.CloudFormationCustomResourceEvent &
  AmplifyJobId;

export abstract class ResourceHandler {
  protected readonly requestId: string;
  protected readonly logicalResourceId: string;
  protected readonly requestType: "Create" | "Update" | "Delete";
  protected readonly physicalResourceId?: string;
  protected readonly event: ResourceEvent;

  constructor(event: ResourceEvent) {
    this.requestType = event.RequestType;
    this.requestId = event.RequestId;
    this.logicalResourceId = event.LogicalResourceId;
    this.physicalResourceId = (event as any).PhysicalResourceId;
    this.event = event;
  }

  public onEvent() {
    switch (this.requestType) {
      case "Create":
        return this.onCreate();
      case "Update":
        return this.onUpdate();
      case "Delete":
        return this.onDelete();
    }

    throw new Error(`Invalid request type ${this.requestType}`);
  }

  public isComplete() {
    switch (this.requestType) {
      case "Create":
        return this.isCreateComplete();
      case "Update":
        return this.isUpdateComplete();
      case "Delete":
        return this.isDeleteComplete();
    }

    throw new Error(`Invalid request type ${this.requestType}`);
  }

  protected log(x: any) {
    console.log(JSON.stringify(x, undefined, 2));
  }

  protected abstract async onCreate(): Promise<OnEventResponse>;
  protected abstract async onDelete(): Promise<OnEventResponse | void>;
  protected abstract async onUpdate(): Promise<
    (OnEventResponse & AmplifyJobId) | void
  >;
  protected abstract async isCreateComplete(): Promise<IsCompleteResponse>;
  protected abstract async isDeleteComplete(): Promise<IsCompleteResponse>;
  protected abstract async isUpdateComplete(): Promise<IsCompleteResponse>;
}
