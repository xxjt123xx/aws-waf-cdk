import { IResource, Stack, StackProps, Tags } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';

export interface AppProps extends cdk.StackProps {
  readonly appName: string;
  readonly account: string;
  readonly ipAdresses: string[];
}

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props?: AppProps) {
    super(scope, id, props);

    const scp: string = 'REGIONAL';

    this.appName = props?.appName || '';

    const ipf: string[] = props?.ipAdresses || [''];

    // Setup IP Set
    let assetName = `${this.appName}-ip-set`;
    const ipSet = new wafv2.CfnIPSet(this, assetName, {
      name: this.appName,
      scope: scp,
      ipAddressVersion: 'IPV4',
      addresses: ipf,
    });

    // Setup Rule Groups
    assetName = `${this.appName}-rule-group`;
    const ruleGroup = new wafv2.CfnRuleGroup(this, assetName, {
      name: this.appName,
      scope: scp,
      capacity: 100,
      visibilityConfig: {
        cloudWatchMetricsEnabled: false,
        metricName: assetName,
        sampledRequestsEnabled: false,
      },
      rules: [
        {
          name: `${this.appName}-ip-filter`,
          priority: 0,
          visibilityConfig: {
            cloudWatchMetricsEnabled: false,
            metricName: 'metricName',
            sampledRequestsEnabled: false,
          },
          action: {
            block: {},
          },
          statement: {
            ipSetReferenceStatement: {
              arn: ipSet.attrArn,
            },
          },
        },
      ],
    });

    // Setup WebACL
    assetName = `${this.appName}-webACL`;
    const webACL = new wafv2.CfnWebACL(this, `${assetName}-fn`, {
      name: this.appName,
      scope: scp,
      defaultAction: {
        allow: {},
      },
      rules: [
        {
          name: this.appName,
          priority: 1,
          statement: {
            ruleGroupReferenceStatement: {
              arn: ruleGroup.attrArn,
            },
          },
          overrideAction: { none: {} },
          visibilityConfig: {
            cloudWatchMetricsEnabled: false,
            metricName: assetName,
            sampledRequestsEnabled: false,
          },
        },
      ],
      visibilityConfig: {
        cloudWatchMetricsEnabled: false,
        metricName: assetName,
        sampledRequestsEnabled: false,
      },
    });
  }
  private appName: string;

  private addAppTag(resource: IResource) {
    Tags.of(resource).add('AppName', this.appName);
  }
}
