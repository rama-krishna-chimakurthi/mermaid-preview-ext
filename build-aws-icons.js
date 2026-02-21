#!/usr/bin/env node
/**
 * build-aws-icons.js
 * Installs aws-icons npm package locally, then reads SVGs directly from disk.
 * No HTTP failures. Run: node build-aws-icons.js
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Install aws-icons locally if not present
if (!fs.existsSync("./node_modules/aws-icons")) {
  console.log("📦 Installing aws-icons...");
  execSync("npm install aws-icons", { stdio: "inherit" });
}

const BASE = "./node_modules/aws-icons/icons";

// Short name -> relative path inside icons/
const ICONS = {
  // Compute
  ec2: "architecture-service/AmazonElasticContainerRegistry.svg",
  lambda: "architecture-service/AWSLambda.svg",
  ecs: "architecture-service/AmazonElasticContainerService.svg",
  eks: "architecture-service/AmazonElasticKubernetesService.svg",
  fargate: "architecture-service/AWSFargate.svg",
  elastic_beanstalk: "architecture-service/AWSElasticBeanstalk.svg",
  batch: "architecture-service/AWSBatch.svg",
  lightsail: "architecture-service/AmazonLightsail.svg",
  app_runner: "architecture-service/AWSAppRunner.svg",
  outposts: "architecture-service/AWSOutpostsservers.svg",
  // Storage
  s3: "architecture-service/AmazonSimpleStorageService.svg",
  efs: "architecture-service/AmazonEFS.svg",
  fsx: "architecture-service/AmazonFSx.svg",
  glacier: "architecture-service/AmazonSimpleStorageServiceGlacier.svg",
  ebs: "architecture-service/AWSElasticBeanstalk.svg",
  storage_gateway: "architecture-service/AWSStorageGateway.svg",
  backup: "architecture-service/AWSBackup.svg",
  // Database
  rds: "architecture-service/AmazonRDS.svg",
  dynamodb: "architecture-service/AmazonDynamoDB.svg",
  aurora: "architecture-service/AmazonAurora.svg",
  elasticache: "architecture-service/AmazonElastiCache.svg",
  redshift: "architecture-service/AmazonRedshift.svg",
  neptune: "architecture-service/AmazonNeptune.svg",
  documentdb: "architecture-service/AmazonDocumentDB.svg",
  keyspaces: "architecture-service/AmazonKeyspaces.svg",
  timestream: "architecture-service/AmazonTimestream.svg",
  qldb: "architecture-service/AmazonQuantumLedgerDatabase.svg",
  memorydb: "architecture-service/AmazonMemoryDB.svg",
  // Networking
  vpc: "architecture-service/AmazonVirtualPrivateCloud.svg",
  cloudfront: "architecture-service/AmazonCloudFront.svg",
  route53: "architecture-service/AmazonRoute53.svg",
  api_gateway: "architecture-service/AmazonAPIGateway.svg",
  elb: "architecture-service/ElasticLoadBalancing.svg",
  transit_gateway: "architecture-service/AWSTransitGateway.svg",
  direct_connect: "architecture-service/AWSDirectConnect.svg",
  vpn: "architecture-service/AWSClientVPN.svg",
  global_accelerator: "architecture-service/AWSGlobalAccelerator.svg",
  privatelink: "architecture-service/AWSPrivateLink.svg",
  app_mesh: "architecture-service/AWSAppMesh.svg",
  cloud_map: "architecture-service/AWSCloudMap.svg",
  // Security
  iam: "architecture-service/AWSIdentityandAccessManagement.svg",
  cognito: "architecture-service/AmazonCognito.svg",
  kms: "architecture-service/AWSKeyManagementService.svg",
  secrets_manager: "architecture-service/AWSSecretsManager.svg",
  waf: "architecture-service/AWSWAF.svg",
  shield: "architecture-service/AWSShield.svg",
  guardduty: "architecture-service/AmazonGuardDuty.svg",
  inspector: "architecture-service/AmazonInspector.svg",
  macie: "architecture-service/AmazonMacie.svg",
  security_hub: "architecture-service/AWSSecurityHub.svg",
  acm: "architecture-service/AWSCertificateManager.svg",
  iam_identity_center: "architecture-service/AWSIAMIdentityCenter.svg",
  detective: "architecture-service/AmazonDetective.svg",
  network_firewall: "architecture-service/AWSNetworkFirewall.svg",
  // Messaging
  sqs: "architecture-service/AmazonSimpleQueueService.svg",
  sns: "architecture-service/AmazonSimpleNotificationService.svg",
  eventbridge: "architecture-service/AmazonEventBridge.svg",
  mq: "architecture-service/AmazonMQ.svg",
  kinesis: "architecture-service/AmazonKinesis.svg",
  step_functions: "architecture-service/AWSStepFunctions.svg",
  appsync: "architecture-service/AWSAppSync.svg",
  ses: "architecture-service/AmazonSimpleEmailService.svg",
  pinpoint: "architecture-service/AmazonPinpoint.svg",
  // Analytics
  athena: "architecture-service/AmazonAthena.svg",
  emr: "architecture-service/AmazonEMR.svg",
  glue: "architecture-service/AWSGlue.svg",
  quicksight: "architecture-service/AmazonQuickSight.svg",
  opensearch: "architecture-service/AmazonOpenSearchService.svg",
  lake_formation: "architecture-service/AWSLakeFormation.svg",
  msk: "architecture-service/AmazonManagedStreamingforApacheKafka.svg",
  firehose: "architecture-service/AmazonDataFirehose.svg",
  data_exchange: "architecture-service/AWSDataExchange.svg",
  // ML / AI
  sagemaker: "architecture-service/AmazonSageMaker.svg",
  bedrock: "architecture-service/AmazonBedrock.svg",
  rekognition: "architecture-service/AmazonRekognition.svg",
  textract: "architecture-service/AmazonTextract.svg",
  comprehend: "architecture-service/AmazonComprehend.svg",
  lex: "architecture-service/AmazonLex.svg",
  polly: "architecture-service/AmazonPolly.svg",
  translate: "architecture-service/AmazonTranslate.svg",
  transcribe: "architecture-service/AmazonTranscribe.svg",
  forecast: "architecture-service/AmazonForecast.svg",
  personalize: "architecture-service/AmazonPersonalize.svg",
  kendra: "architecture-service/AmazonKendra.svg",
  q: "architecture-service/AmazonQ.svg",
  // DevOps
  cloudwatch: "architecture-service/AmazonCloudWatch.svg",
  cloudtrail: "architecture-service/AWSCloudTrail.svg",
  cloudformation: "architecture-service/AWSCloudFormation.svg",
  codepipeline: "architecture-service/AWSCodePipeline.svg",
  codebuild: "architecture-service/AWSCodeBuild.svg",
  codecommit: "architecture-service/AWSCodeCommit.svg",
  codedeploy: "architecture-service/AWSCodeDeploy.svg",
  systems_manager: "architecture-service/AWSSystemsManager.svg",
  config: "architecture-service/AWSConfig.svg",
  organizations: "architecture-service/AWSOrganizations.svg",
  cdk: "architecture-service/AWSCloudDevelopmentKit.svg",
  xray: "architecture-service/AWSXRay.svg",
  trusted_advisor: "architecture-service/AWSTrustedAdvisor.svg",
  cost_explorer: "architecture-service/AWSCostExplorer.svg",
  control_tower: "architecture-service/AWSControlTower.svg",
  // Containers
  ecr: "architecture-service/AmazonElasticContainerRegistry.svg",
  // IoT
  iot_core: "architecture-service/AWSIoTCore.svg",
  iot_greengrass: "architecture-service/AWSIoTGreengrass.svg",
};

function parse(svg) {
  const vb = svg.match(/viewBox=["']([^"']+)["']/);
  let w = 48,
    h = 48;
  if (vb) {
    const p = vb[1]
      .trim()
      .split(/[\s,]+/)
      .map(Number);
    if (p.length === 4) {
      w = p[2];
      h = p[3];
    }
  }
  const body = svg
    .replace(/^[\s\S]*?<svg[^>]*>/i, "")
    .replace(/<\/svg>\s*$/i, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return { body, width: w, height: h };
}

// Find the actual filename (case-insensitive, handles slight name differences)
function findFile(dir, name) {
  const full = path.join(BASE, dir, name);
  if (fs.existsSync(full)) return full;

  // Try listing dir and finding case-insensitive match
  const dirPath = path.join(BASE, dir);
  if (!fs.existsSync(dirPath)) return null;
  const files = fs.readdirSync(dirPath);
  const lower = name.toLowerCase();
  const match = files.find((f) => f.toLowerCase() === lower);
  return match ? path.join(dirPath, match) : null;
}

function main() {
  console.log("🔨 Building aws-icons.json from local npm package...\n");

  // Show what's actually available for failed icons
  const failed18 = [
    "ecs",
    "eks",
    "outposts",
    "s3",
    "glacier",
    "ebs",
    "qldb",
    "vpc",
    "iam",
    "kms",
    "sso",
    "sqs",
    "sns",
    "ses",
    "opensearch",
    "msk",
    "firehose",
    "ecr",
  ];
  console.log(
    "🔍 Searching for correct filenames for previously failed icons...",
  );
  const archDir = path.join(BASE, "architecture-service");
  if (fs.existsSync(archDir)) {
    const allFiles = fs.readdirSync(archDir);
    for (const name of failed18) {
      // search for any file containing the service name
      const keyword = name.replace(/_/g, "").toLowerCase();
      const matches = allFiles.filter((f) =>
        f
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
          .includes(keyword),
      );
      console.log(
        `  ${name}: ${matches.slice(0, 3).join(", ") || "NOT FOUND"}`,
      );
    }
  }
  console.log("");

  const icons = {},
    failed = [],
    entries = Object.entries(ICONS);
  for (let i = 0; i < entries.length; i++) {
    const [name, filePath] = entries[i];
    const [dir, file] = filePath.split("/");
    process.stdout.write(
      `[${String(i + 1).padStart(3)}/${entries.length}] ${name.padEnd(22)}`,
    );
    try {
      const fullPath = findFile(dir, file);
      if (!fullPath) throw new Error(`Not found: ${filePath}`);
      const svg = fs.readFileSync(fullPath, "utf8");
      const { body, width, height } = parse(svg);
      if (!body) throw new Error("empty body");
      icons[name] = { width, height, body };
      console.log("✅");
    } catch (e) {
      console.log(`❌  ${e.message}`);
      failed.push(name);
    }
  }

  fs.writeFileSync("aws-icons.json", JSON.stringify({ prefix: "aws", icons }));
  const kb = (fs.statSync("aws-icons.json").size / 1024).toFixed(1);
  console.log(
    `\n✅ ${Object.keys(icons).length} icons  ❌ ${failed.length} failed  📦 ${kb} KB`,
  );
  if (failed.length) console.log("Failed:", failed.join(", "));
  console.log("\n📋 Example .mmd usage:");
  console.log("  architecture-beta");
  console.log("    service fn(aws:lambda)[Lambda]");
  console.log("    service db(aws:dynamodb)[DynamoDB]");
  console.log("    service api(aws:api_gateway)[API Gateway]");
  console.log("    service store(aws:s3)[S3]");
}

main();
