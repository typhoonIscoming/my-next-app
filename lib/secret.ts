import 'server-only';

// 用 server-only 声明某模块仅服务器端可导入。如果在客户端组件中导入，将在开发或构建阶段抛错并阻止打包。

export async function getSecret() {
    return process.env.SECRET_VALUE;
}
