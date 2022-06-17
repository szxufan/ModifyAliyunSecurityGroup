const $OpenApi = require("@alicloud/openapi-client");
const Ecs20140526 = require("@alicloud/ecs20140526");
const net = require("net");

const endpointList = {
  "cn-hangzhou": "ecs-cn-hangzhou.aliyuncs.com",
  "cn-shanghai": "ecs.cn-shanghai.aliyuncs.com",
};

const regionId = process.argv[2];
const securityGroupId = process.argv[3];
const description = process.argv[4];
const newIp = process.argv[5];
console.log(newIp);
const config = new $OpenApi.Config({
  // 您的AccessKey ID
  accessKeyId: "",
  // 您的AccessKey Secret
  accessKeySecret: "",
  endpoint: endpointList[regionId],
});
if (!net.isIPv4(newIp)) process.exit(1);
const client = new Ecs20140526.default(config);
const describeSecurityGroupAttributeRequest =
  new Ecs20140526.DescribeSecurityGroupAttributeRequest({
    securityGroupId,
    regionId,
  });
client
  .describeSecurityGroupAttribute(describeSecurityGroupAttributeRequest)
  .then(async (info) => {
    if (Array.isArray(info?.body?.permissions?.permission)) {
      const i = info.body.permissions.permission.findIndex(
        (d) => d.description === description
      );
      if (
        i >= 0 &&
        info.body.permissions.permission[i]?.sourceCidrIp !== newIp
      ) {
        const revokeSecurityGroupRequest =
          new Ecs20140526.RevokeSecurityGroupRequest({
            regionId,
            securityGroupId,
            ipProtocol: info.body.permissions.permission[i].ipProtocol,
            portRange: info.body.permissions.permission[i].portRange,
            sourceCidrIp: info.body.permissions.permission[i].sourceCidrIp,
          });
        const wt = client.revokeSecurityGroup(revokeSecurityGroupRequest);
        const authorizeSecurityGroupRequest =
          new Ecs20140526.AuthorizeSecurityGroupRequest({
            regionId,
            securityGroupId,
            ipProtocol: info.body.permissions.permission[i].ipProtocol,
            portRange: info.body.permissions.permission[i].portRange,
            sourceCidrIp: newIp,
            description,
          });
        await client.authorizeSecurityGroup(authorizeSecurityGroupRequest);
        await wt;
      }
    }
  })
  .then(() => process.exit(0));
