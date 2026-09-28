# MetaPool 页面逻辑说明

本文档整理了当前池列表页面的业务逻辑、状态参数、数据流和注意事项，便于后续维护和扩展。

## 1. 页面职责概述

该页面用于展示当前市场中可用流动性池列表，功能包括：

- 拉取分页池数据
- 展示池对、费率、TVL、APR、流动性
- 支持上一页 / 下一页切换
- 实现表格头部和主体滚动同步
- 支持移动端和桌面端布局适配
- 提供创建新池入口

对应页面文件：

- [app/[local]/(metaSwap)/metapool/page.tsx](app/[local]/(metaSwap)/metapool/page.tsx)

## 2. 关键数据结构

### 2.1 `PoolData`

```ts
interface PoolData {
  pool: string;
  token0: string;
  token1: string;
  token0Symbol: string;
  token1Symbol: string;
  token0Decimals: number;
  token1Decimals: number;
  fee: number;
  feePercent: string;
  liquidity: string;
  sqrtPriceX96: string;
  tick: number;
  tvl: string;
  tvlUSD: number;
  volume24h: string;
  feesUSD: number;
  pair: string;
  index: number;
  token0Balance: string;
  token1Balance: string;
  apr: string;
}
```

字段含义：

| 字段 | 含义 | 说明 |
| --- | --- | --- |
| `pool` | 池地址 | 用作列表 key，也可用于后续跳转详情 |
| `token0` / `token1` | token 地址 | 交易对两侧资产地址 |
| `token0Symbol` / `token1Symbol` | token 符号 | 页面显示的用币符号 |
| `fee` | 池费率值 | 原始费率数值，通常按 10000 进制 |
| `feePercent` | 费率展示文本 | 如 `0.05%` |
| `liquidity` | 流动性数量 | 当前池中流动性估值指标 |
| `tvlUSD` | 总锁仓价值 | 页面展示 TVL 的核心字段 |
| `apr` | 年化收益率 | 页面展示 APR |
| `pair` | 交易对名称 | 例如 `ETH/USDC` |
| `index` | 池索引 | 标识池在某组池中的序号 |

### 2.2 `Pagination`

```ts
interface Pagination {
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
}
```

含义：

- `currentPage`: 当前页码
- `totalPages`: 总页数
- `total`: 当前数据总数
- `pageSize`: 每页条数

## 3. 页面状态参数

页面内部核心状态如下：

| 参数 | 类型 | 含义 | 说明 |
| --- | --- | --- | --- |
| `pools` | `PoolData[]` | 当前页池数据 | fetch 后写入状态 |
| `loading` | boolean | 是否加载中 | 控制骨架屏展示 |
| `error` | string \| null | 错误信息 | 请求失败时展示提示 |
| `totalStats` | object | 汇总统计 | 目前主要用于总池数和总 TVL |
| `pagination` | `Pagination` | 分页信息 | 控制列表分页 |
| `isMobile` | boolean | 是否移动端 | 影响布局和列宽 |

### 3.1 `totalStats` 的字段说明

```ts
const [totalStats, setTotalStats] = useState({
  totalPools: 0,
  totalTVL: 0,
  totalVolume24h: 0,
  totalFeesGenerated: 0,
});
```

各字段含义：

- `totalPools`: 当前查询到的池总数量
- `totalTVL`: 当前页池的总 TVL 合计
- `totalVolume24h`: 24h 成交量统计，当前实现为 `0`
- `totalFeesGenerated`: 费用累计，当前实现为 `0`

## 4. 数据获取流程

核心方法：

```ts
const fetchPools = async (page = pagination.currentPage, pageSize = pagination.pageSize) => {
  setLoading(true);
  setError(null);
  try {
    const response = await fetch(`/api/pools?page=${page}&limit=${pageSize}`);
    if (!response.ok) {
      throw new Error('Failed to fetch pools');
    }
    const data = await response.json();
    setPools(data.data || []);
    setPagination((prev) => ({
      ...prev,
      currentPage: data.pagination?.page || page,
      totalPages: data.pagination?.totalPages || 1,
      total: data.pagination?.total || 0,
      pageSize: data.pagination?.limit || pageSize,
    }));
    setTotalStats({
      totalPools: data.pagination?.total || 0,
      totalTVL: (data.data || []).reduce(
        (acc: number, pool: PoolData) => acc + (pool.tvlUSD || 0),
        0
      ),
      totalVolume24h: 0,
      totalFeesGenerated: 0,
    });
  } catch (err) {
    console.error('Error loading pools:', err);
    setError(err instanceof Error ? err.message : '加载失败');
  } finally {
    setLoading(false);
  }
};
```

流程说明：

1. 设置 `loading = true`，清空错误信息
2. 请求 `/api/pools?page=${page}&limit=${pageSize}`
3. 如果响应失败，抛出错误
4. 解析 JSON 中的 `data` 和 `pagination`
5. 将池列表写入 `pools`
6. 更新分页状态
7. 计算本页 TVL 汇总并写入 `totalStats`
8. 在 `finally` 中关闭 loading

## 5. 页面首次加载时机

```ts
useEffect(() => {
  void fetchPools(pagination.currentPage, pagination.pageSize);
}, []);
```

说明：

- 页面首次挂载时执行一次数据拉取
- 当前依赖数组为空，因此只在首次渲染执行
- 之后的分页跳转由点击事件手动调用 `fetchPools(page, pageSize)`

## 6. 表格构成与渲染逻辑

### 6.1 表头

页面表头展示了以下列：

- `#`（如果不是移动端）
- `pair`（交易对）
- `feeRate`（费率）
- `tvl`（总锁仓价值）
- `apr`（年化收益率）
- `liquidity`（流动性）

表头和表体通过滚动同步：

```ts
const syncScroll = (source: HTMLDivElement | null, target: HTMLDivElement | null) => {
  if (!source || !target || source === target) return;
  if (target.dataset.syncing === 'true') return;
  target.scrollLeft = source.scrollLeft;
};
```

目的：

- 让表头和表体在横向滚动时保持一致
- 提升大表格体验

### 6.2 表体

`TableList` 会按照 `data.map` 逐行渲染：

- 按行展示池对头像（token0Symbol 和 token1Symbol 的首字母）
- 基于 `pool.pair` 展示交易对
- `feePercent` 用标签展示
- `tvlUSD` 显示为美元金额
- `apr` 显示为收益率文本
- `liquidity` 通过 `formatNumber` 进行展示

### 6.3 骨架屏

`TableSkeleton` 用于加载中状态，生成固定行数的占位结构，避免页面在 fetch 时出现空白闪烁。

## 7. 分页逻辑

分页组件：

```ts
const TablePagenation = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
```

点击上一页 / 下一页时：

```ts
onPageChange={(page) => {
  setPagination((prev) => ({ ...prev, currentPage: page }));
  void fetchPools(page, pagination.pageSize);
}}
```

说明：

- 当前页数会先更新
- 然后重新请求当前页数据
- `disabled` 状态由 `currentPage === 1` 和 `currentPage === totalPages` 控制

## 8. 关键渲染公式

### 8.1 TVL 展示

```ts
{pool.tvlUSD >= 1000
  ? `$${formatNumber(pool.tvlUSD)}`
  : `$${pool.tvlUSD.toFixed(2)}`}
```

说明：

- 当 TVL 大于等于 1000 时，使用 `formatNumber` 做千分位优化
- 小于 1000 时保留两位小数

### 8.2 流动性展示

```ts
{formatNumber(parseFloat(pool.liquidity))}
```

说明：

- 这里将 `liquidity` 字符串转成 float 再格式化展示
- 假设 `liquidity` 是一个可解析数字字符串

## 9. 注意事项

### 9.1 `totalVolume24h` 和 `totalFeesGenerated` 当前为 0

代码中：

```ts
setTotalStats({
  totalPools: data.pagination?.total || 0,
  totalTVL: (data.data || []).reduce(
    (acc: number, pool: PoolData) => acc + (pool.tvlUSD || 0),
    0
  ),
  totalVolume24h: 0,
  totalFeesGenerated: 0,
});
```

这意味着：

- 当前页面只统计了池数量和 TVL
- 24h 成交量和费用累计尚未接入真实数据
- 若后续要展示这些数据，需要从接口中扩充字段并更新状态

### 9.2 `fetchPools` 中 `totalStats` 是基于当前页数据汇总

这里的 `totalTVL` 是：

```ts
(data.data || []).reduce((acc, pool) => acc + (pool.tvlUSD || 0), 0)
```

说明：

- 它是当前页而不是全量数据汇总
- 这属于分页场景下的局部统计
- 如果页面需要全量总览，需要接口提供全量统计字段

### 9.3 `pagination.pageSize` 可能被后端返回覆盖

```ts
pageSize: data.pagination?.limit || pageSize,
```

说明：

- 当前页大小使用后端返回值覆盖本地默认值
- 这使接口更灵活，但也意味着前端必须同步信任后端的分页配置

### 9.4 `liquidity` 和 `tvlUSD` 属于展示型数值，不完全等于链上精确值

当前有：

- `liquidity` 直接 parseFloat
- `tvlUSD` 直接用于前端展示

注意：

- 这适合列表展示
- 但不应直接作为链上真实价值结算依据
- 若涉及真实金额或财务报表，应使用更严谨的数值和 Decimal 方案

### 9.5 移动端布局依赖 `useIsMobile()`

页面中多处使用：

```ts
const isMobile = useIsMobile();
```

说明：

- 通过 `isMobile` 调整列宽和 sticky 布局
- 这对流动性池表格这种宽表来说很重要
- 但如果设备检测存在误差，会影响列的展示效果

### 9.6 页面没有显式错误兜底 UI

虽然 `error` 被设置了，但当前页面的主渲染分支中没有单独展示错误容器；它只在 `fetchPools` 里设置了错误文本，但实际渲染逻辑中并未专门处理 `error` 分支。

这意味着：

- 错误通常会在控制台输出
- 但 UI 层没有明确提示给用户
- 后续建议补一个独立的错误块，避免出现“列表一直空白”的状态

## 10. 业务流程总结

从用户打开页面到看到列表，可以总结为：

```text
页面初始化
  -> useIsMobile 判断布局
  -> useEffect 触发 fetchPools
  -> 调用 /api/pools
  -> JSON 返回 data + pagination
  -> 更新 pools / pagination / totalStats
  -> 渲染表头 + 表体 + 分页
```

## 11. 后续建议

为了更适合真实生产环境，建议优先完善以下几点：

1. 补齐真正的 `totalVolume24h` 和 `totalFeesGenerated` 数据
2. 增加 explicit 的错误状态 UI
3. 为 `PoolData` 和 `stats` 做更严格的类型校验
4. 区分“展示值”与“精确值”，避免前端直接使用裸 Number 进行财务展示
5. 对池数据做空列表、异常字段、分页边界的更严谨兜底

## 12. 总结

这个页面的本质是一个“池列表概览页”，它的核心逻辑比较清晰：

- 请求分页池数据
- 更新列表和分页状态
- 按特定列展示交易对、费率、TVL、APR、流动性
- 支持滚动同步和分页切换

当前实现适合展示型页面，但在真实业务产品中，仍建议补齐：

- 更完整的统计字段
- 错误提示 UI
- 更严谨的数值处理
- 更完整的池详情/筛选能力

这份说明可以作为该页面后续功能扩展和维护的参考资料。
