# Liquidity 页面逻辑说明

本文档整理了流动性页的核心逻辑、页面状态、上下文参数和注意事项，便于后续维护和扩展。

## 1. 页面职责概述

当前页面负责处理“创建或搜索流动性池”的主流程，核心能力包括：

- 选择两个 token
- 选择手续费 tier
- 检查是否存在交易对池
- 若存在池，进入匹配池逻辑
- 若不存在池，允许创建新池
- 在创建/添加流动性阶段展示交易状态和进度

对应页面文件：

- [app/[local]/(metaSwap)/liquidity/page.tsx](app/[local]/(metaSwap)/liquidity/page.tsx)

## 2. 关键状态参数说明

### 2.1 页面级状态

在 `LiquidityPage` 中，定义了以下核心状态：

| 参数 | 类型 | 含义 | 说明 |
| --- | --- | --- | --- |
| `step` | `Step` | 当前页面步骤 | 取值包括 `select`、`searching`、`found`、`notFound`、`addLiquidity` |
| `transactionAction` | `TransactionAction \| null` | 当前交易动作 | 例如 `addLiquidity`、`approve0`、`approve1` |
| `contextValue` | object | 流动性上下文状态 | 保存 pool 检查与 token 相关信息 |

### 2.2 `Step` 类型

```ts
export type Step = 'select' | 'searching' | 'found' | 'notFound' | 'addLiquidity';
```

含义：

- `select`: 选择 token 与 fee tier
- `searching`: 正在检查池是否存在
- `found`: 已找到对应池
- `notFound`: 未找到对应池
- `addLiquidity`: 进入添加流动性步骤

### 2.3 `TransactionAction` 类型

```ts
export type TransactionAction =
  | 'approve0'
  | 'approve1'
  | 'wrap0'
  | 'wrap1'
  | 'createPool'
  | 'addLiquidity'
  | null;
```

含义：

- `approve0` / `approve1`: 对 token0 / token1 进行 approve
- `wrap0` / `wrap1`: 包装原生 token（如 ETH -> WETH）
- `createPool`: 创建新池
- `addLiquidity`: 添加流动性
- `null`: 当前没有交易动作

## 3. 上下文参数说明

`LiquidityContext` 用于跨步骤共享状态，定义于：

- [app/[local]/(metaSwap)/liquidity/context.ts](app/[local]/(metaSwap)/liquidity/context.ts)

### 3.1 `LiquidityContextType`

```ts
interface LiquidityContextType {
  poolExists: boolean;
  isCheckingPool: boolean;
  currentPool: string | null;
  poolIndex: number | null;

  fee: number | null;
  token0: Token | null;
  token1: Token | null;
  chainId: number | null;
  hash: string | null;
  setOtherValues: (otherValues: Partial<LiquidityContextType>) => void;
}
```

字段含义：

| 字段 | 含义 | 说明 |
| --- | --- | --- |
| `poolExists` | 池是否存在 | 用于决定是否进入创建池还是已有池逻辑 |
| `isCheckingPool` | 是否正在查询池状态 | 控制按钮禁用和搜索状态 |
| `currentPool` | 当前匹配到的池地址 | 如找到池则记录它 |
| `poolIndex` | 池索引 | 用于标识池在池列表中的索引 |
| `fee` | fee tier | 当前选中的手续费等级 |
| `token0` / `token1` | 选中的 token | 用于后续 add liquidity 流程 |
| `chainId` | 当前网络 id | 记录交易网络 |
| `hash` | 交易 hash | 交易状态展示时使用 |
| `setOtherValues` | 批量更新上下文 | 用于在各步骤中更新共享状态 |

### 3.2 `initialLiquidity`

```ts
export const initialLiquidity = {
  poolExists: false,
  isCheckingPool: false,
  currentPool: null,
  poolIndex: null,

  fee: null,
  token0: null,
  token1: null,
  chainId: null,
  hash: null,
};
```

这组默认值保证新页面进入时状态为空且安全。

## 4. 页面初始化与状态流转

页面入口通过如下逻辑初始化：

```tsx
const [step, setStep] = useState<Step>('select');
const [transactionAction, setTransactionAction] = useState<TransactionAction | null>('addLiquidity');
const [contextValue, setContextValue] = useState(initialLiquidity);
```

含义：

- 默认进入选择页
- 默认交易动作初始为 `addLiquidity`
- 共享状态初始化为空值

随后，在 `value` 中包装了 `setPoolExists`、`setIsCheckingPool` 与 `setOtherValues`，便于子组件统一更新上下文。

## 5. 页面分支渲染逻辑

页面主结构如下：

```tsx
{step === 'addLiquidity' && (
  <TransactionStatus status="pending" action={transactionAction} />
)}
{step === 'select' && <SelectStep onSetStep={(type: Step) => setStep(type)} />}
{step === 'searching' && <SearchingPool />}
{step === 'found' && <FoundPair onSetStep={(type: Step) => setStep(type)} />}
{step === 'notFound' && (
  <NoPoolFound onSetStep={(type: Step) => setStep(type)} />
)}
{step === 'addLiquidity' && (
  <AddLiquidityStep
    onSetStep={(type: TransactionAction) => setTransactionAction(type)}
  />
)}
```

说明：

- 每一步对应不同的 UI 区块
- `step` 控制页面行为，而不是各个组件各自自己维护状态
- `transactionAction` 用于交易状态组件标识当前是哪一类交易动作

## 6. `SelectStep` 的核心逻辑

### 6.1 状态变量

`SelectStep` 中的重要状态：

| 参数 | 类型 | 含义 |
| --- | --- | --- |
| `selectedToken0Address` | string | token0 地址 |
| `token0` | `Token \| null` | token0 对象 |
| `selectedToken1Address` | string | token1 地址 |
| `token1` | `Token \| null` | token1 对象 |
| `searchError` | string \| null | 搜索池/校验错误 |
| `isCheckingPool` | boolean | 是否正在查询池状态 |

### 6.2 `searchPool` 流程

```ts
const searchPool = useCallback(async () => {
  if (!selectedToken0Address || !selectedToken1Address) {
    setSearchError(t('swap.selectTwoAddress'));
    return;
  }

  if (selectedToken0Address.toLowerCase() === selectedToken1Address.toLowerCase()) {
    setSearchError(t('swap.selectTwoAddress', { type: t('swap.different') }));
    return;
  }
  if (!fee) {
    setSearchError(t('swap.selectFee'));
    return;
  }

  setStep('searching');
  setIsCheckingPool(true);
  setSearchError(null);

  try {
    const response = await fetchPoolStatus();
    applyPoolStatus(response);
    setStep(response.exists ? 'found' : 'notFound');
  } catch (error) {
    setSearchError(error instanceof Error ? error.message : '搜索池子失败');
    setOtherValues({ poolExists: false, currentPool: null, poolIndex: null });
    setStep('notFound');
  } finally {
    setIsCheckingPool(false);
  }
}, [selectedToken0Address, selectedToken1Address, fee, fetchPoolStatus, applyPoolStatus]);
```

说明：

- 先校验两个 token 地址是否存在且不同
- 再校验 fee 是否已选
- 发送 `/api/pools/check` 请求检查池是否存在
- 根据响应进入 `found` 或 `notFound` 步骤

### 6.3 `fetchPoolStatus`

```ts
const fetchPoolStatus = useCallback(async () => {
  const response = await fetch('/api/pools/check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token0: selectedToken0Address,
      token1: selectedToken1Address,
      fee: fee,
    }),
  }).then((res) => res.json());

  if (!response.success) {
    throw new Error(response.error || '搜索池子失败');
  }

  return response;
}, [selectedToken0Address, selectedToken1Address, fee]);
```

请求参数说明：

| 参数 | 含义 |
| --- | --- |
| `token0` | 第一个 token 的地址 |
| `token1` | 第二个 token 的地址 |
| `fee` | 当前选择的手续费 tiers |

返回值示例：

- `success: true`
- `exists: true/false`
- `poolAddress?: string`
- `poolIndex?: number`

### 6.4 `applyPoolStatus`

```ts
const applyPoolStatus = useCallback(
  (response: { exists: boolean; poolAddress?: string; poolIndex?: number }) => {
    if (response.exists) {
      setOtherValues({
        poolExists: true,
        currentPool: response.poolAddress || null,
        poolIndex: response.poolIndex ?? null,
      });
      return;
    }

    setOtherValues({ poolExists: false, currentPool: null, poolIndex: null });
  },
  []
);
```

作用：

- 把查询结果写入全局上下文
- 若池存在，保存 `currentPool` 和 `poolIndex`
- 若池不存在，清空相关状态

## 7. `SearchingPool` 与 `NoPoolFound`

### 7.1 `SearchingPool`

用于显示加载状态：

- `Clock` 旋转图标
- 文案 `swap.searchingPool`

作用：

- 告诉用户正在核验池是否存在
- 避免点击多次搜索造成重复请求

### 7.2 `NoPoolFound`

当后端判定未找到池时：

- 展示未找到池的提示
- 提示用户创造新池
- 点击按钮进入 `addLiquidity` 流程

```ts
const createNewPool = () => {
  onSetStep('addLiquidity');
};
```

这意味着：

- “未找到池”并不终止整个流程
- 用户可以直接进入创建 Pool 的步骤

## 8. `LiquidityContext` 的更新机制

通过 `setOtherValues` 批量混合更新上下文：

```ts
setOtherValues: (otherValues: Partial<LiquidityContextType>) => {
  setContextValue((prev) => ({ ...prev, ...otherValues }));
}
```

这样做的好处：

- 子组件不需要在每处手写大量状态更新
- 各步骤可以共享当前选择的 token、fee、池状态等信息

注意：

- 这种模式适合中等规模表单流程
- 如果步骤过多，后续建议拆成更明确的 reducer / zustand / form state

## 9. 注意事项

### 9.1 `onSetStep` 和 `transactionAction` 正在被复用

当前页面中：

- `step` 负责切换页面分支
- `transactionAction` 负责标记当前交易动作

这套设计很灵活，但也需要注意：

- 不同步骤可能需要不同动作状态
- 若误设定 `transactionAction`，交易状态组件可能显示错误的动作文案

### 9.2 交易状态组件使用的是 `pending`

页面代码中：

```tsx
{step === 'addLiquidity' && (
  <TransactionStatus status="pending" action={transactionAction} />
)}
```

说明：

- 当前阶段状态写死为 `pending`
- 实际交易状态可能是 `confirmed` 或 `success`，具体还需要由真实交易结果驱动
- 这表示当前页面更偏“UI 流程演示”，而不是完整交易状态管理

### 9.3 搜索池时进行前端校验

代码中会检查：

- 两个地址是否为空
- 地址是否相同
- fee 是否已选择

这类前置校验很重要，因为：

- 防止错误请求
- 避免无效的 `/api/pools/check`
- 提升交互体验

### 9.4 `fetchPoolStatus` 中假设后端返回 `success`

代码要求：

```ts
if (!response.success) {
  throw new Error(response.error || '搜索池子失败');
}
```

因此：

- 后端接口必须统一返回 `success`
- 如果接口字段名称变化，页面会直接被判定为错误
- 建议与后端约定统一结构，避免字段命名漂移

### 9.5 当前流程是“创建池/添加流动性”分流，不是严格的链上状态驱动

页面上的状态转移逻辑相对明晰，但真实链上执行状态仍然是外部组件控制的：

- `TransactionStatus` 只是接收 `status` 和 `action` 进行展示
- 真正的状态变化需要由真实 transaction 结果来驱动

### 9.6 token 选择器和输入框中的地址是分离状态

在 `SelectStep` 中：

- `selectedToken0Address` 是输入框展示值
- `token0` 是可选 token 对象

这两者需要同步更新，否则可能出现：

- 地址已变，但对象状态未更新
- UI 显示和实际数据源不一致

## 10. 总体流程总结

页面整体流程可以概括为：

```text
进入页面
  -> 选择两个 token
  -> 选择 fee tier
  -> 点击搜索池
  -> 请求 /api/pools/check
  -> 存在池 -> 进入 found 流程
  -> 不存在 -> 进入 notFound 流程
  -> 用户确认创建新池 -> 进入 addLiquidity 流程
```

## 11. 后续建议

为了更稳健地维护这个页面，建议优先考虑：

1. 把 `step` 和 `transactionAction` 组合成更明确的状态机
2. 对真实链上交易状态做统一驱动，而不是写死 `pending`
3. 把 `/api/pools/check` 返回结构做标准化，并统一错误处理
4. 把 token / fee / pool 状态拆成 reducer 或 form state，降低耦合
5. 为搜索失败和创建池失败补充更明确的用户提示

## 12. 总结

这个页面的核心思想是：

- 先选择 token + pool 参数
- 再检查池是否存在
- 不存在则进入创建池逻辑
- 存在则继续下一步交互

它的实现已经具备清晰的步骤分流和共享状态管理，但仍建议在真实链上交易环境中进一步完善：

- 交易状态真实驱动
- 错误信息统一化
- 状态机化
- 交易流程更完整的安全校验

这份说明适合作为该页面后续维护和扩展时的参考文档。
