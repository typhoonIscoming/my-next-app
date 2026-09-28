# useSwap Hook 逻辑说明

本文档整理了 swap 相关 hook 的核心逻辑、参数含义、调用时机和注意事项，便于后续维护和扩展。

## 1. Hook 职责概述

`useSwap` 是一个集中处理代币交换的 hook，主要负责：

- 识别 ETH / WETH 地址别名
- 解析可用交易路径
- 计算和获取报价
- 检查 token 授权额度
- 执行 approve
- 组装 multicall 并发起真实 swap
- 追踪交易状态与 hash

对应文件：

- [app/[local]/(metaSwap)/metaswap/hooks/useSwap.ts](app/[local]/(metaSwap)/metaswap/hooks/useSwap.ts)

## 2. 关键类型说明

### 2.1 `SwapParams`

```ts
export interface SwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  slippage: number;
  indexPath?: number[];
  tokenInDecimals?: number;
  tokenOutDecimals?: number;
  tokenInName?: string;
  tokenInSupportsPermit?: boolean;
}
```

字段含义：

| 字段 | 含义 | 说明 |
| --- | --- | --- |
| `tokenIn` | 输入代币地址 | 需要卖出的 token |
| `tokenOut` | 输出代币地址 | 需要买入的 token |
| `amountIn` | 输入数量字符串 | 例如 `1.23`，最终转为 wei |
| `slippage` | 滑点 | 页面层传入，当前 hook 接收但未直接用于最小输出保护 |
| `indexPath` | 池索引路径 | 交易路径上的池索引 |
| `tokenInDecimals` | 输入 token 精度 | 若未传则从本地 token 配置兜底 |
| `tokenOutDecimals` | 输出 token 精度 | 若未传则从本地 token 配置兜底 |
| `tokenInName` | 输入 token 名称 | permit 签名用 |
| `tokenInSupportsPermit` | 是否支持 permit | 影响是否走 EIP-2612 签名路径 |

### 2.2 `QuoteResult`

```ts
interface QuoteResult {
  amountOut: string;
  priceImpact: string;
  simulated: boolean;
  indexPathUsed?: number[];
}
```

字段含义：

| 字段 | 含义 |
| --- | --- |
| `amountOut` | 输出 token 数量字符串 |
| `priceImpact` | 价格影响描述值 |
| `simulated` | 是否为模拟报价 |
| `indexPathUsed` | 真实使用的池索引路径 |

## 3. 常量说明

| 常量 | 含义 |
| --- | --- |
| `GAS_LIMIT_CAP` | gas 估算上限，防止过高估算导致异常 |
| `SWAP_GAS_FALLBACK` | swap fallback gas |
| `APPROVE_GAS_FALLBACK` | approve fallback gas |
| `MIN_SQRT_PRICE` | 最小 sqrt price 下限 |
| `MAX_SQRT_PRICE` | 最大 sqrt price 上限 |
| `LEGACY_WETH_ADDRESS` | 兼容旧版 WETH 地址 |

## 4. Hook 返回值说明

```ts
return {
  executeSwap,
  approveToken,
  getQuote,
  useTokenAllowance,
  isPending,
  isConfirming,
  isConfirmed,
  hash,
  lastSwapParams,
};
```

含义：

| 字段 | 含义 |
| --- | --- |
| `executeSwap` | 执行 swap 的核心函数 |
| `approveToken` | 执行 approve |
| `getQuote` | 拉取报价 |
| `useTokenAllowance` | 读取授权额度的 hook |
| `isPending` | 钱包提交中 |
| `isConfirming` | 交易确认中 |
| `isConfirmed` | 交易已确认 |
| `hash` | 交易 hash |
| `lastSwapParams` | 最近一次 swap 参数 |

## 5. 核心方法说明

### 5.1 `isEthLikeToken`

作用：

- 判断某个地址是否属于原生 ETH / wrapped ETH 相关资产
- 统一处理 ETH 与 WETH 的地址兼容问题

逻辑：

```ts
const normalized = tokenAddress.toLowerCase();
return (
  normalized === tokens.ETH.address.toLowerCase() ||
  normalized === (tokens.ETH.wrappedAddress as string).toLowerCase()
);
```

注意：

- 这里仅判断了标准 WETH 地址，不包含 legacy WETH 地址
- legacy 地址在 `getEthLikeAliases` 中单独处理

### 5.2 `getEthLikeAliases`

作用：

- 把 ETH / WETH 统一归一化到同一套地址集合，方便池匹配

示例：

- ETH 地址
- 当前包裹地址 WETH
- legacy WETH 地址

都归并为等价别名集合。

注意：

- 这一步是为了修复“同一资产因地址别名不同而无法找到池”的问题
- 如果不统一，交易对可能会被识别失败

### 5.3 `getDefaultSqrtPriceLimit`

作用：

- 根据 tokenIn / tokenOut 的大小关系生成默认 `sqrtPriceLimitX96`

逻辑：

```ts
const zeroForOne = tokenIn.toLowerCase() < tokenOut.toLowerCase();
return zeroForOne ? MIN_SQRT_PRICE + 1n : MAX_SQRT_PRICE - 1n;
```

注意：

- `sqrt price limit` 方向必须与真实交易方向一致
- 若方向算错，可能导致交易失败或触发 SPL 异常

### 5.4 `resolveAvailableRoute`

作用：

- 根据输入输出 token 在合约中查找可用 pool
- 最终返回 `tokenIn`、`tokenOut` 和 `indexPath`

逻辑要点：

1. 读取 `poolManager.getAllPools()`
2. 归一化处理 ETH/WETH 别名
3. 找出匹配的 pool
4. 挑选最优路线并返回 `indexPath`

注意：

- 这里默认取匹配池的第一条，不一定是最优路由
- 如果前端或后端已有更准确的路由策略，应优先采用

### 5.5 `estimateGasWithCap`

作用：

- 估算合约 gas，并加上保守上限保护
- 遇到估算失败时回退到固定 fallback gas

关键逻辑：

```ts
const buffered = (estimated * 12n) / 10n;
return buffered > GAS_LIMIT_CAP ? GAS_LIMIT_CAP : buffered;
```

注意：

- 这是为了防止 gas 估算过高导致交易无法发出
- fallback gas 适合兜底，但不一定最优

### 5.6 `getQuote`

作用：

- 通过 `/api/quote` 获取交易报价
- 处理 token decimals 缺失问题，并返回 `amountOut`、`priceImpact` 等

接口调用参数：

```ts
{
  tokenIn: actualTokenIn,
  tokenOut: actualTokenOut,
  amountIn: amountInWei.toString(),
  indexPath: params.indexPath ?? [0],
  sqrtPriceLimitX96: sqrtPriceLimitX96.toString(),
}
```

注意：

- 如果 `amountIn` 为空或为 0，直接返回 `null`
- 业务错误不抛异常，而是返回 `null`，由调用方判断是否提示
- `tokenOutDecimals` 会优先使用上层传参，其次本地配置，否则默认为 18

### 5.7 `useTokenAllowance`

作用：

- 读取某个 token 对 swap router 的 allowance
- 用于 UI 判断是否需要先 `Approve`

注意：

- 若 token 是 ETH / WETH，则不需要读取 allowance
- 如果使用 permit，则也不一定需要前置 approval

### 5.8 `approveToken`

作用：

- 对 token 执行 `approve`，授权给 swap router

核心逻辑：

1. 解析金额为 wei
2. 估算 gas
3. 调用 `writeContract` 发起 approve

注意：

- 如果钱包未连接，则直接返回
- 当 `allowance` 不足时，页面通常要先触发 approve

### 5.9 `executeSwap`

作用：

- 这是真正的 swap 执行入口
- 会先报价、再校验路径，再拼装交易 calldata，最终使用 `multicall` 发起交易

#### 5.9.1 执行前的准备

执行逻辑大致如下：

1. 判断钱包连接状态
2. 按 token 精度解析 `amountInWei`
3. 调用 `getQuote` 获取估算结果
4. 判断输入 token 是否原生 ETH
5. 归一化实际 tokenIn / tokenOut
6. 解析可用路由与池索引路径
7. 确定最小输出约束和最终 `indexPath`

#### 5.9.2 路径选择逻辑

代码会优先使用报价返回的 `indexPathUsed`，如果有效则用它，否则回退到调用方传入的 `params.indexPath`。

注意：

- 这里的路径必须与链上 `resolveAvailableRoute` 结果保持一致
- 否则可能导致交易路径不一致，影响实际执行结果

#### 5.9.3 链上二次报价

```ts
amountOutWei = await publicClient.readContract({
  functionName: 'quoteExactInput',
  args: [{ ... }],
})
```

作用：

- 在发起真实交易前，再做一次链上模拟报价
- 减少前端 API 报价和真实链上结果差异

注意：

- 如果链上报价失败，会回退到 API 报价值
- 若 `amountOutWei <= 0n`，则直接阻止交易发送

#### 5.9.4 `minAmountOut` 逻辑

当前实现：

```ts
const minAmountOut = 0n;
```

说明：

- 这是一种“测试模式/临时放宽”策略
- 目的是避免因为报价偏差导致 `Slippage exceeded`
- 生产环境中通常需要根据 `slippage` 精确计算最小输出

#### 5.9.5 permit 与普通 ERC20 路径

代码区分：

- `isNativeTokenIn`：输入是不是 ETH
- `shouldUsePermit`：是否走 permit 签名

```ts
const shouldUsePermit =
  !isNativeTokenIn &&
  Boolean(params.tokenInSupportsPermit) &&
  Boolean(params.tokenInName);
```

如果不走 permit，则会预先检查：

- `balanceOf(address)`
- `allowance(address, router)`

注意：

- 若余额或 allowance 不足，会直接抛错，避免链上 TFF
- permit 路径利用签名后在 `multicallData` 中插入 `selfPermitIfNecessary`

#### 5.9.6 `multicallData` 组装

按顺序会追加：

1. `selfPermitIfNecessary`（若适用）
2. `wrapETH`（若输入是原生 ETH）
3. `exactInput`
4. `unwrapWETH9`（若输入或输出是原生 ETH）

最终调用：

```ts
writeContract({
  ...contractConfig.swapRouter,
  functionName: 'multicall',
  args: [multicallData],
  value,
  gas,
});
```

## 6. 关键注意事项

### 6.1 原生 ETH / WETH 扩展问题

这是 swap 流程中的重点：

- ETH 与 WETH 在很多地方不是同一个地址
- 但在交易逻辑中它们实际上是同一类资产
- 若未归一化处理，会出现“找不到池”“路径不一致”“quote 不对”的问题

### 6.2 `slippage` 当前未真正参与最小输出保护

当前代码中：

```ts
const minAmountOut = 0n;
```

说明：

- 页面传入 `slippage` 但这里并没有基于它计算最小输出
- 这是临时放宽逻辑，便于测试或规避报价误差
- 生产环境中应该恢复 `slippage` 逻辑来保证更强安全性

### 6.3 `indexPathUsed` 可能失效

它来自 quote 返回值；若返回的路径不是当前链上可用路径，代码会：

- 过滤无效路径
- 回退到可用路径

注意：

- 这种机制意在保证路由一致性，但如果后端和链上状态不同步，会存在延迟问题

### 6.4 `permit` 依赖 token 的 `name` 和 `supportsPermit`

```ts
Boolean(params.tokenInSupportsPermit) && Boolean(params.tokenInName)
```

注意：

- 如果 token 不支持 permit，必须走普通 approve + transferFrom
- 如果 `tokenInName` 缺失，permit 无法签名

### 6.5 非原生 token 必须检查余额和授权

在非 permit 路径中：

```ts
if (BigInt(balance) < amountInWei) { ... }
if (BigInt(allowance) < amountInWei) { ... }
```

这一步非常关键：

- 直接避免 `transferFrom failed`
- 能显著减少链上异常和无意义的 swap 请求

### 6.6 `amountOutWei` 可能为 0

如果链上报价为 0，则直接抛错：

```ts
throw new Error('报价为 0，已阻止交易以避免只 wrapETH 不成交');
```

原因：

- 这类交易通常没有交易价值，容易造成无意义操作
- 也能减少 “只 wrap ETH 不成交” 的误操作场景

## 7. 调用时序建议

通常调用顺序是：

1. `getQuote()` 获取报价
2. `useTokenAllowance()` 判断 allowance
3. 若需要，调用 `approveToken()`
4. 调用 `executeSwap()`

注意：

- `executeSwap` 内部会重复做报价和路径解析，因此不要在页面层重复做过多冗余逻辑
- 若页面层已经检查 `needsApproval`，仍建议保留 hook 内部的 balance / allowance 守卫，保证安全性

## 8. 后续优化建议

1. 恢复真实 `slippage` 最小输出逻辑
2. 统一 token 地址归一化策略，覆盖所有 legacy / alias 场景
3. 把 `permit` 的 nonce / deadline / signature 细化成独立 helper
4. 把 `multicall` 数据组装拆成更清晰的步骤，便于测试和排错
5. 补充 `getQuote` 的错误分类，例如：网络错误 / 业务错误 / 路径不可用
6. 增加更明确的交易失败提示，把钱包、链状态和合约错误做更细粒度区分

## 9. 总结

`useSwap` 是这个页面最核心的逻辑封装，几乎所有 swap 行为都集中在这里：

- 报价
- 授权
- 路径选择
- permit / multicall
- gas 控制
- 交易状态跟踪

它的实现已经具备较强的实战性，但有两个关键点需要持续关注：

- `slippage` 没有完全落地到最小输出保护
- ETH / WETH 路径归一化和路由选择仍需要持续校验与维护

这份说明适合作为后续重构、bug 修复和功能扩展的基础文档。
