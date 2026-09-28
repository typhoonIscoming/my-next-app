# MetaSwap 页面逻辑说明

本文档用于说明当前页面的状态管理、报价流程、授权流程和交易提交流程，并对关键参数与注意事项进行说明。该页面对应的组件文件是 `page.tsx`，数据交互主要依赖 `useGetTokenOptions`、`useSwap` 和 `usePools`。

## 1. 页面职责概述

该页面是一个代币交换页面，核心能力包括：

- 选择输入币种和输出币种
- 输入卖出数量后自动拉取报价
- 识别 ETH / WETH 相关地址别名，统一做池子匹配
- 判断是否需要先授权 token
- 调用 swap hook 提交交易
- 展示余额、滑点设置、交易状态和错误信息

页面入口逻辑集中在 `MetaSwapPage` 组件中，使用多个 useState 和 useMemo 状态进行控制。

## 2. 关键状态参数含义

### 2.1 基础 UI 状态

| 变量名 | 类型 | 含义 | 说明 |
| --- | --- | --- | --- |
| `open` | boolean | 选择器弹层开关 | 当前页面中未明显用于核心逻辑，保留用于列表弹层控制。 |
| `showSettings` | boolean | 是否展示滑点设置区 | 用户控制 slippage 的 UI 开关。 |
| `fromToken` | Token | 输入代币 | 代币卖出方向。 |
| `toToken` | Token | 输出代币 | 代币买入方向。 |
| `fromAmount` | string | 输入金额 | 展示为用户输入字符串，后续按 decimals 转为 wei。 |
| `toAmount` | string | 预计输出金额 | 由报价接口返回，展示在“到”侧输入框。 |
| `slippage` | number | 滑点容忍度 | 单位为百分比，例如 0.5 表示 0.5%。 |
| `quoteError` | string \| null | 报价相关错误 | 当前报价失败时显示，可能来自不支持路径、余额不足、接口错误等。 |
| `isQuoting` | boolean | 是否正在报价 | 用于展示“获取报价中...”状态。 |
| `isSimulated` | boolean | 是否为模拟报价 | 当 API 返回的 `simulated` 为 true 时展示提醒。 |

### 2.2 钱包 / 余额状态

| 变量名 | 类型 | 含义 | 说明 |
| --- | --- | --- | --- |
| `address` | string \| undefined | 当前钱包地址 | 来自 `useAccount`。 |
| `isConnected` | boolean | 是否已连接钱包 | 控制是否允许交易、授权和报价。 |
| `nativeBalance` | Balance \| undefined | 原生币余额 | ETH 相关资产使用它。 |
| `fromTokenBalance` | Balance \| undefined | 输入代币余额 | 对非 ETH 代币读取。 |
| `toTokenBalance` | Balance \| undefined | 输出代币余额 | 对非 ETH 代币读取。 |

### 2.3 交易与授权状态

| 变量名 | 类型 | 含义 | 说明 |
| --- | --- | --- | --- |
| `allowance` | bigint \| undefined | 当前授权额度 | 读取 `useTokenAllowance` 返回值。 |
| `needsApproval` | boolean | 是否需要先授权 | 根据输入金额、allowance 和 token 支持 permit 的能力计算。 |
| `selectedIndexPath` | number[] | 当前选择的池索引路径 | 从 `primaryPoolIndex` 衍生出的路径数组。 |
| `primaryPoolIndex` | number | 最优池索引 | 从 liquidity 最大池中选出，作为当前交易的主要池。 |

## 3. 关键派生参数与计算逻辑

### 3.1 ETH / WETH 地址归一化

页面中定义了以下常量：

- `ETH_ADDRESS_LOWER`: 原生币地址小写形式
- `WETH_ADDRESS_LOWER`: wrapped ETH 的主地址
- `LEGACY_WETH_ADDRESS_LOWER`: 兼容旧 WETH 地址
- `WRAPPED_ETH_ALIASES`: WETH 的别名集合

这部分逻辑的目的是：

- 把 ETH、WETH、legacy WETH 统一看成同一类资产
- 避免在池子匹配阶段出现同一资产被当成不同 token
- 保证在跨地址格式下，池子仍然能被正确命中

关键函数：

- `isEthLikeAddress(tokenAddress)`
- `toComparableAddress(tokenAddress)`

### 3.2 `shouldShowQuote`

页面使用一个 `useMemo`：

- 当 `fromAmount` 为空或 <= 0 时，不拉取报价
- 仅在有效卖出数量存在时才展示到价、评估误差和输出金额

这样可以避免：

- 空输入下反复触发报价
- 依赖变动导致不断 setState
- UI 在未输入金额时闪烁或重复请求

### 3.3 `needsApproval`

该状态用于决定当前是否需要先执行 approve：

- 若输入币为原生 ETH，则不需要 allowance
- 若 `fromToken.supportsPermit` 为 true，则视为支持 permit，通常不需要前置 approve
- 若输入金额 <= 0，则无需授权
- 若 `allowance` 为空，默认视为需要 approval
- 若 allowance 小于 `parseUnits(fromAmount, fromToken.decimals)`，则需要授权

这一步非常关键，因为后续执行 `executeSwap` 时，如果 token 不是原生资产且没有足额 allowance，就可能触发 transferFrom 失败。

## 4. 核心方法说明

### 4.1 `handleFromAmountChange(value)`

作用：

- 更新输入金额状态 `fromAmount`
- 由 input 的 `onChange` 调用

注意：

- 这一步只更新本地文本，不直接做复杂校验
- 报价由 `useEffect` + `updateQuote` 自动触发

### 4.2 `handleSwapTokens()`

作用：

- 交换 from/to 代币位置
- 同步交换 `fromAmount` 和 `toAmount`
- 清空错误提示 `quoteError`

注意：

- 它只是把界面状态互换；不会立即进行链上交易
- 交换后必须重新触发报价，以保持输出金额正确

### 4.3 `handleApprove()`

作用：

- 调用 `approveToken(fromToken.address, fromAmount, fromToken.decimals)`
- 执行 approve 交易

注意：

- 若用户未输入金额，则直接返回
- 如果授权失败需要在 catch 中记录日志，不直接打断页面流程

### 4.4 `handleSwap()`

作用：

- 触发真正的交易提交
- 会验证：用户已连接钱包、输入金额存在、没有授权缺失、存在有效池路径
- 组装 swap 参数并调用 `executeSwap()`

调用参数结构：

| 字段 | 含义 |
| --- | --- |
| `tokenIn` | 输入代币地址 |
| `tokenOut` | 输出代币地址 |
| `amountIn` | 输入数量字符串 |
| `slippage` | 滑点 |
| `indexPath` | 选中的池索引路径 |
| `tokenInDecimals` | 输入代币精度 |
| `tokenOutDecimals` | 输出代币精度 |
| `tokenInName` | 输入代币名称，用于 permit 签名 |
| `tokenInSupportsPermit` | 是否支持 ERC2612 permit |

注意：

- 如果 `selectedIndexPath.length === 0`，页面会直接提示“未找到可用池子”
- 如果 `needsApproval` 为 true，则先要求用户授权，而不是直接 swap

### 4.5 `updateQuote()`

作用：

- 调用 `getQuote()` 获取估算价
- 返回值是 `{ amountOut, priceImpact, simulated, indexPathUsed }`
- 若成功，更新 `toAmount`；否则清空输出并记录错误

关键逻辑：

- 若 `fromAmount` 为空或 0，则清空 `toAmount` 和 `quoteError`
- 请求价格时传入：`fromToken`、`toToken`、`amountIn`、`slippage`、`indexPath`
- 结果保存在 `toAmount` 中以供展示

注意：

- 此函数是异步的，页面通过 `useEffect` 进行 debounce 控制
- 500ms 延迟用于避免用户输入时频繁请求
- 只有在 `shouldShowQuote` 为 true 时才执行

### 4.6 `useEffect` 里的报价防抖

作用：

- 监听 `fromAmount`、token、slippage 和 `primaryPoolIndex` 等依赖
- 500ms 后自动触发 `updateQuoteRef.current()`

关键目的：

- 抑制高频调用
- 避免用户快速输入导致反复拉取接口
- 降低无效状态更新和性能消耗

注意：

- 当输入为空时，effect 会直接 return，不会去请求报价
- 该逻辑依赖 `shouldShowQuote` 做前置判断，避免重复 setState

## 5. 交易状态展示

`TransactionStatus` 组件用于展示钱包/链上状态：

- `isPending`: 等待钱包确认
- `isConfirming`: 交易正在链上确认
- `isConfirmed`: 交易已成功

显示内容包括：

- 状态文本
- 动画图标
- 交易哈希 shortened form（`formatAddress(hash)`）

## 6. 组件交互流程总结

整体流程可以概括为：

1. 用户选择输入 / 输出 token
2. 输入金额发生变化
3. 页面归一化 ETH / WETH 地址并计算最佳池 index
4. 自动请求报价
5. 检查是否需要授权
6. 用户点击交换按钮
7. 提交 swap 交易
8. 页面显示交易状态

## 7. 注意事项

### 7.1 ETH 与 WETH 兼容性

当前页面中对原生 ETH 和 WETH 做了显式兼容处理，但要注意：

- 真实链上资产可能存在多种地址形式
- 如果没有统一归一化，池子匹配会失败，结果就是“未找到可用池子”
- 页面需要统一用 `toComparableAddress` 或别名集合来做比较

### 7.2 allowance 判定必须严谨

这一段逻辑非常关键，原因有三点：

- `allowance` 可能为 undefined
- ERC20 的小数位可能不为 18
- permit 和普通 transferFrom 有不同授权路径

因此，判断是否需要 approval 时需要一并考虑：

- 当前 token 是否支持 permit
- 输入金额是否有效
- allowance 是否小于输入金额对应的 wei

### 7.3 报价响应可能为空或模拟

`getQuote` 返回值可能为：

- 正常报价
- null（业务错误或未找到池子）
- `simulated: true`（模拟报价）

因此 UI 必须对这三种情况都做兼容处理：

- 正常输出显示报价结果
- `null` 时不应直接报错，而应清空输出并展示提示
- 模拟报价时需告知用户市场价格可能存在偏差

### 7.4 `handleMaxAmount` 当前为空实现

页面中已声明：

```ts
const handleMaxAmount = useCallback(() => {}, []);
```

这表示“最大”按钮目前没有真正实现，点击后不会改变 `fromAmount`。如果后续要补充，需要补齐以下逻辑：

- 根据输入币种判断余额来源：ETH / WETH / ERC20
- 减去 gas 费（如原生 ETH）
- 按 decimals 进行转换
- 更新 `fromAmount`，并重新触发报价

### 7.5 路径选择是单池优先策略

当前应用使用：

- `activePairPools` 查出同 token pair 的所有池
- 对池子按 liquidity 排序
- 取流动性最大的一池作为 `primaryPoolIndex`
- 最终 `selectedIndexPath = [primaryPoolIndex]`

这种策略的优点：

- 路径简单，容易确保稳定性
- 交易逻辑更容易跟踪

但也存在风险：

- 若流动性最大池出现较大价格滑差，用户可能并不一定拿到最优路径
- 后续如果支持多池路由，需要考虑更复杂的路径选择策略

## 8. 总结

当前页面的核心设计特点是：

- 通过状态驱动报价和授权判断
- 对 ETH / WETH 做统一归一化处理
- 使用 `useSwap` 对交易组织与提交进行封装
- 对报价和交易状态做了较完整的前端展示和错误处理

开发时应特别注意：

- 代币地址归一化
- allowance 校验
- 报价结果是否为空/模拟
- 不要忽略 `handleMaxAmount` 这种未完成逻辑

如果后续要扩展该页面，建议优先在这几块完善：路由选择、多池策略、最大可用余额和精准滑点控制。
