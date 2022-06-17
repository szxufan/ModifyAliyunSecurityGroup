# ModifyAliyunSecurityGroup
## 安装:
npm install
## 用法:
在安全组加入需要更新的规则，需要设置一个安全组内独一无二的描述。

当IP发生变化时调用此命令，此命令会更新符合这个描述的规则。

node ./modifySecurityGroup/index.js \<region\> <安全组ID> <描述> \<IP\>
