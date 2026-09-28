# MetaPositions 页面逻辑说明

本文档整理了页面 [app/[local]/(metaSwap)/metapositions/page.tsx](app/[local]/(metaSwap)/metapositions/page.tsx) 的数据流、状态含义以及注意事项，便于后续维护和扩展。

## 1. 页面职责概述

该页面用于展示当前钱包用户的流动性头寸列表与统计信息，核心功能包括：

- 检查钱包是否已连接
- 读取当前用户的 positions 数据
- 展示活跃头寸数、总价值、未领取费用、总收益率
- 当数据为空时展示空状态
- 当加载失败时展示错误状态与重试按钮

页面本身很薄，真正的业务逻辑大部分集中在 hook `usePositions`，页面只负责渲染和状态展示。

## 2. 依赖关系

该页面依赖以下内容：

- `useAccount()`：获取钱包连接状态
- `useTranslations()`：获取国际化文案
- `usePositions()`：拉取并加工用户头寸数据
- `formatNumber()`：格式化金额展示

## 3. 页面主要参数与状态说明

### 3.1 页面内状态

| 参数 | 类型 | 含义 | 说明 |
| --- | --- | --- | --- |
| `t` | function | 国际化方法 | 读取页面文案，如 `swap.myPositions`。 |
| `isConnected` | boolean | 钱包是否连接 | 控制页面是否允许展示用户数据。 |
| `positions` | array | 用户头寸列表 | 来自 `usePositions()` 返回值。 |
| `loading` | boolean | 是否正在获取数据 | 用于显示加载动画。 |
| `error` | string \| null | 错误信息 | 读取失败时展示。 |
| `stats` | object | 汇总统计 | 包含头寸数量、总价值等指标。 |
| `refetch` | function | 手动刷新 | 调用后重新拉取 positions。 |

### 3.2 统计字段说明

`stats` 是页面上四个数据卡片的源数据，字段如下：

| 字段 | 含义 | 说明 |
| --- | --- | --- |
| `activePositions` | 活跃头寸数量 | `status === 'in-range'` 的头寸数量。 |
| `totalValue` | 总价值 | 由所有 position 的 `liquidityValue` 汇总计算得到。 |
| `totalUnclaimedFees` | 未领取费用 | 按 `totalFeesValue` 汇总得到。 |
| `totalReturn` | 总收益率 | 当前实现固定为 `0`，属于占位逻辑。 |

## 4. Hook `usePositions` 的关键参数和返回值

### 4.1 关键输入参数

这个 hook 只依赖于钱包状态：

- `address`: 当前用户钱包地址
- `isConnected`: 当前钱包是否连接

具体在代码中：

```ts
const { address, isConnected } = useAccount();
```

### 4.2 返回值说明

```ts
return {
  positions,
  loading,
  error,
  stats,
  refetch: loadPositions,
};
```

返回字段含义：

| 字段 | 含义 | 说明 |
| --- | --- | --- |
| `positions` | 头寸列表 | 每个元素都是一个 `PositionInfo`。 |
| `loading` | 是否加载中 | 页面用它渲染骨架或加载状态。 |
| `error` | 报错信息 | 失败时展示给用户。 |
| `stats` | 汇总统计 | 给页面四个摘要卡使用。 |
| `refetch` | 刷新方法 | 点击“重新加载”时调用。 |

## 5. `PositionInfo` 结构说明

每个头寸对象都包含以下字段：

| 字段 | 含义 |
| --- | --- |
| `id` | 头寸 ID |
| `owner` | 头寸所有者 |
| `token0` / `token1` | 两个 token 的地址 |
| `index` | 池索引，目前写死为 `0` |
| `fee` | 池手续费，单位通常按 10000 进制 |
| `liquidity` | 流动性数量 |
| `tickLower` / `tickUpper` | 范围下限和上限 |
| `tokensOwed0` / `tokensOwed1` | 未领取的 token 费用 |
| `feeGrowthInside0LastX128` / `feeGrowthInside1LastX128` | 上次费用增长记录 |
| `token0Symbol` / `token1Symbol` | token 标识符 |
| `token0Name` / `token1Name` | token 名称 |
| `pair` | 交易对，如 `ETH/USDC` |
| `feePercent` | 手续费百分比 |
| `liquidityValue` | 流动性价值字符串 |
| `totalFeesValue` | 累积未领取费用值 |
| `status` | 状态：`in-range` 或 `out-of-range` |
| `priceRange` | 价格区间字符串 |

## 6. 数据获取流程

`loadPositions()` 是核心异步入口，流程如下：

1. 如果未连接钱包或无地址，则清空 positions，停止 loading，返回。
2. 设置 `loading = true`。
3. 调用 Supabase 表 `positions` 查询当前用户地址相关数据。
4. 关联查询：
   - `token0_data`
   - `token1_data`
   - `pool_data`
5. 对返回的数据执行 `map()` 转成 `PositionInfo`。
6. 计算状态字段：
   - `feePercent`
   - `priceRange`
   - `status`
   - `liquidityValue`
   - `totalFeesValue`
7. 保存到 `positions`。
8. 在 `finally` 中关闭 `loading`。

## 7. 关键计算逻辑说明

### 7.1 `tickToPrice()`

```ts
const tickToPrice = (tick: number): number => {
  return Math.pow(1.0001, tick);
};
```

用途：

- 将 tick 转成一个近似价格值
- 供 `priceRange` 和 `status` 计算使用

注意：

- 这是简化版逻辑，不是精确的 Uniswap V3 价格计算公式
- 如果业务需要更严格的精度，应该使用真实的 tick-to-price 计算逻辑和 Decimal 精度处理

### 7.2 `status` 判断

```ts
const currentTick = Number(position.pool_data?.tick ?? position.tick_lower - 1);
const status =
  currentTick >= position.tick_lower &&
  currentTick <= position.tick_upper &&
  Number(liquidity) > 0
    ? 'in-range'
    : 'out-of-range';
```

含义：

- 如果当前 tick 位于上下限之间，并且流动性大于 0，则视为活跃头寸
- 否则为 out-of-range

注意：

- `pool_data.tick` 来自数据库，如果不完整，代码会退回到 `tick_lower - 1`
- 这个 fallback 可能导致状态被错误判定，需保证池子 tick 数据可靠

### 7.3 `liquidityValue` 与 `totalFeesValue`

当前实现通过字符串解析生成展示值：

```ts
const liquidityValue =
  liquidityNum >= 1000
    ? `$${(liquidityNum / 1000).toFixed(2)}K`
    : `$${liquidityNum.toFixed(2)}`;
```

```ts
const totalFeesNum = Number(tokensOwed0) + Number(tokensOwed1);
const totalFeesValue = `$${totalFeesNum.toFixed(2)}`;
```

注意：

- 这里用的是近似展示值，不是精确的 USD 估值
- 仅适合前端展示，不能直接作为结算或财务计算结果
- 如果 `liquidity` 或 `tokensOwed` 为大数值，Number 会有精度风险

## 8. 页面渲染逻辑说明

### 8.1 顶部统计卡片

页面会根据 `loading` 展示三种状态：

- 正在加载：显示 `Loader2` 动画和 `-`
- 正常：显示 `stats.activePositions`、`stats.totalValue` 等

### 8.2 钱包未连接状态

如果 `isConnected === false`，页面展示：

- 提示“请先连接钱包”
- 空状态说明文本

### 8.3 加载失败状态

如果 `error` 存在：

- 显示错误文本
- 提供 `refetch` 按钮，让用户重新加载

### 8.4 空头寸状态

如果 `positions.length === 0`：

- 显示 “没有头寸” 空页面
- 提供按钮跳转到 `/liquidity` 创建新头寸

## 9. 注意事项

### 9.1 这是前端展示型页面，不是精确金融计算页面

当前 hook 里有不少展示逻辑：

- `totalReturn: 0` 是硬编码占位值
- `liquidityValue` 是近似展示值
- `totalFeesValue` 是近似展示值

这意味着：

- UI 可用于概览
- 不能直接作为严谨的收益、估值或结算依据

### 9.2 `index` 字段目前写死为 0

在 `processedPositions` 中：

```ts
index: 0,
```

这意味着：

- 当前头寸对象没有从链上真实数据中解析池索引
- 如果后续要执行更细粒度的池路由或分析，需要补充真实 `index` 值

### 9.3 `totalReturn` 目前固定为 0

这是一个明显的简化版占位逻辑：

```ts
totalReturn: 0, // 简化版本，实际需要复杂计算
```

后续如果要补真实收益率，需要：

- 结合某个时间窗口内的价格变化
- 结合 token 价值增减
- 结合手续费和流动性变化

### 9.4 `Number` 精度风险

当前代码对大整数、浮点数和币种金额使用了 `Number`，例如：

- `liquidity`
- `tokens_owed0` / `tokens_owed1`
- `fee`、`tick`

注意：

- 这在前端展示场景中可能勉强可用
- 如果金额非常大、精度很高，可能发生精度丢失
- 如果要做真实金额计算，建议改为 `BigInt` 或更严格的 Decimal 方案

### 9.5 数据依赖于 Supabase

页面依赖的 `positions` 数据来自数据库表 `positions`，因此：

- 数据若未同步、字段不完整，页面可能展示为空或状态异常
- `token0_data` / `token1_data` 若缺失，会回退为 `UNK`
- `pool_data` 缺失时，某些字段会退化为默认值

### 9.6 地址匹配逻辑依赖钱包的 `address`

查询条件：

```ts
.filter('owner', 'ilike', address)
```

注意：

- 如果地址格式在链和数据库中不一致，可能会导致查询不到数据
- 若后续支持多链、大小写、checksum 差异，需要统一标准化地址

## 10. 页面完整执行流程

从用户打开页面到最终展示出头寸数据，可以概括为以下顺序：

```text
打开页面
  -> 读取钱包连接状态
  -> usePositions() 触发数据加载
  -> 查询 Supabase positions 表
  -> 组装 PositionInfo 列表
  -> 计算汇总 stats
  -> 页面根据 loading / error / positions.length 分支渲染
```

实际代码中，最重要的决策点在于：

- 钱包是否连接
- 数据是不是已加载完成
- `positions` 是否为空
- `error` 是否发生
- 用户是看“空状态”还是“错误状态”

## 11. 状态分支设计

页面的渲染分支十分明确，定义如下：

| 条件 | 渲染内容 | 说明 |
| --- | --- | --- |
| `!isConnected` | 提示连接钱包 | 用户未连接钱包时无法查询数据 |
| `error` | 错误区 | 展示失败原因，并给重试动作 |
| `loading` | 加载中 | 渲染 spinner |
| `positions.length === 0` | 空状态 | 提示没有流动性头寸 |
| 其他 | 正常列表/统计结构 | 当前文档中默认没有列表具体渲染，因为页面本身只展示卡片和状态区 |

这类分支设计使页面更适合“概览页”场景，也方便之后扩展成真正的头寸列表页。

## 12. 字段缺失和兜底策略

在 `usePositions` 中存在大量回退逻辑，例如：

```ts
const token0Info = position.token0_data || {
  symbol: 'UNK',
  name: 'Unknown Token',
  decimals: 18,
};
```

这类兜底策略的目的：

- 防止单条记录缺字段导致整个页面崩掉
- 保持页面在异常数据下仍可渲染
- 避免接口返回不完整时直接报错退出

注意：

- 兜底值会让 UI 继续显示，但它可能掩盖真实数据问题
- 需要在日志中明确捕获异常，以方便排查数据库字段不全或查询错误

## 13. 长期维护建议

### 13.1 建议补齐真实收益率

目前：

```ts
totalReturn: 0
```

这明显是占位逻辑。若要正式上线，需要补齐：

- 用户历史收益率
- 按时间段的区间收益
- 按 USD 估值换算的收益

### 13.2 建议修正数字精度问题

当前大量使用 `Number` 和字符串转换：

- `parseFloat(position.liquidityValue.replace(/[$,K]/g, ''))`
- `Number(tokensOwed0) + Number(tokensOwed1)`

此类逻辑在展示层是可用的，但对真实金额和计算不稳妥。建议逐步迁移到：

- `BigInt`：处理链上金额
- `Decimal`/精度库：处理资金展示和估值
- 更可靠的格式化层：与业务字段分离

### 13.3 建议明确“展示值”和“真实值”的边界

页面中现在混合了：

- UI 定义的展示字符串：`$1.23K`
- 近似汇总数值
- 数据库原始字段

建议明确区分：

- `displayValue`：展示用字符串
- `rawValue`：真实数据值
- `estimatedValue`：估算值

这样后续改造和排查会更容易。

### 13.4 建议补充更细的错误诊断

当前 `catch` 只写：

```ts
console.error('获取头寸数据出错:', err);
```

更好的实践是：

- 区分数据库查询错误和数据处理错误
- 针对不同错误显示更友好的提示
- 记录请求参数、地址、链状态和错误堆栈

### 13.5 建议补上“手动刷新”和“自动轮询”策略

当前仅支持：

- 页面首次加载自动获取
- 用户点击 `refetch` 手动刷新

如果在钱包连接后，需要实时观察头寸变化，可以考虑：

- 轮询刷新（例如 15s 或 30s 一次）
- 当交易成功后主动重置状态
- 监听 wallet 连接断开/切换事件

## 14. 适合的后续演进方向

如果这是一个真实的交易平台页面，后续建议沿着以下方向扩展：

1. 真实列表页：头寸卡片、范围展示、编辑、收取费用等操作
2. 详细 headroom 视图：显示 token pair、手续费、tick 区间与收益
3. 可交互操作：增加 `Add Liquidity`、`Remove Liquidity`、`Collect Fees`
4. 更强的风险提示：价格区间接近临界、流动性较低等情况
5. 更强的链上状态识别：把 `status` 计算改为更准确的 on-chain 数据同步判断

## 15. 总结

这个页面目前的定位是：

- 一个钱包状态驱动的头寸概览页
- 以 Supabase 查询为入口
- 通过 `usePositions` 进行清洗和汇总
- 通过页面层根据状态分支进行 UI 展示

它已经具备“可展示、可调试、可扩展”的基本结构，但在真实产品环境中，仍需要补齐：

- 收益率计算
- 精度控制
- 更细的错误兜底
- 更强的链上数据校验

这份说明适用于后续维护、重构和功能扩展时作为上下文参考。
