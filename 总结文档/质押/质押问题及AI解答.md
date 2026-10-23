# 质押项目不理解的

1. pid是如何改变的？

>> pid 是池子的 ID，通常在合约中是一个从 0 开始的整数，用于标识不同的质押池。
>> 它在合约中不会自动改变，而是由管理员通过 addPool 函数增加新的池子时生成新的 pid。
>> 用户在 deposit、unstake、claim、withdraw 等操作时，需要传入对应的 pid 来指定操作的池子。

核心就在这两行：

```sol
Pool[] public pool;
pool.push(Pool({...}))
```

在 MetaNodeStake.sol 里，新增池子走的是 addPool()，里面是这样的思路：

```sol
function addPool(...) external onlyRole(ADMIN_ROLE) {
    pool.push(Pool({
        stTokenAddress: _stTokenAddress,
        poolWeight: _poolWeight,
        lastRewardBlock: block.number,
        accMetaNodePerST: 0,
        stTokenAmount: 0,
        minDepositAmount: _minDepositAmount,
        unstakeLockedBlocks: _unstakeLockedBlocks
    }));
}
```
