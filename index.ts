#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AppStack } from './lib/app-stack';
import * as dotenv from 'dotenv';
dotenv.config();

const app = new cdk.App();
const ipa : string = process.env.IPAddresses || '';

new AppStack(app, process.env.APP_NAME + '-app-stack', {
  appName: process.env.APP_NAME || '',
  account: process.env.ACCOUNT || '',
  ipAdresses: JSON.parse(ipa),
  env: {
    account: process.env.ACCOUNT,
    region: process.env.REGION,
  },
});
