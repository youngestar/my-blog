---
title: 算法小记-回溯算法及其模板应用
description: 最近有在学习一些算法题，决定记录一些途中的经验和思考，就以回溯算法作为开头吧
pubDate: 01 23 2026
image: /image/image1.jpg
categories:
  - tech
tags:
  - 算法
  - LeetCode
  - 回溯
  - JavaScript
---

## 前言

最近有在学习基础的算法和做 LeetCode 练习题，做的时候特别能感受到算法的精妙和自己的脑力不足……

有时候做着做着也会产生一些心得，又或是经常观赏[灵神](https://space.bilibili.com/206214)的题解不停赞叹，甚至会有要写简单的系列题解与大家共勉的想法，但最后因发现无人看而宣布剧终。

不过心得记录一下还是值得的，思来想去就先以比较好总结的回溯类型的题目为样例吧，整理一篇相关的笔记。

## 核心思想

我个人看来，回溯本质可以称为：“有组织的穷举”。本身是按一定的顺序对所有的结果进行遍历嘛，小学学的组合数大概也是这样，不过对于计算机来说需要以更聪明和逻辑清晰的方法例举出来。

规范的说法应该称为：“在一棵‘决策树’上进行深度优先遍历”。

## 基础要点

- 使用 DFS 而并非 BFS。
- Push 和 Pop 需要配套进行。
- 判断条件并在合适的时候 Return 结果。
- 经常需要进行去重和剪枝。

## 回溯三部曲(按大佬们的说法)

在解决回溯问题时，可以遵循以下三个步骤来思考：

1.  **确定递归函数的参数和返回值**：通常返回值是 `void`，参数则包括路径 `path` 和选择列表（或 `startIndex`、`used` 数组）。
2.  **确定终止条件**：什么时候到达决策树的叶子节点？什么时候收集结果？
3.  **单层搜索逻辑**：for 循环横向遍历（选择当前层的一个节点），递归纵向遍历（进入下一层），最后回溯（撤销选择）。

## 模板

```js
// 全局/外部变量，用于收集所有满足条件的 path
const result = [];

function backtrack(path, 选择列表) {
  // 1. 结束条件 (Base Case)
  if (满足结束条件) {
    // 注意: 必须深拷贝
    // 因为 path 是引用类型
    result.push([...path]);
    return;
  }

  // 2. 遍历当前的选择列表 (横向遍历兄弟节点)
  for (let i = 0; i < 选择列表.length; i++) {
    const choice = 选择列表[i];

    // 3. 剪枝 (可选)：如果这个选择不合法，直接跳过
    if (!isValid(choice))
      continue;

    // 4. 做选择 (记录到 path 中)
    path.push(choice);

    // 5. 递归深入 (纵向进入下一层决策树)
    // 注意: 实际代码中通常需要传入 startIndex 或状态索引来控制选择列表
    backtrack(path, 更新后的选择列表);

    // 6. 撤销选择 (回溯的核心！)
    // 这一步是为了把状态重置，让循环能干净地处理下一个选择
    path.pop();
  }
}
```

## 两大分支

### 组合 / 子集问题

特点：元素的顺序不重要。

核心：利用 `startIndex` 控制 `for` 循环的起跑线。

```js
// 核心逻辑截取：
// 循环从 startIndex 开始，天生排除了前面的元素，避免乱序重复
for (let i = startIndex; i < nums.length; i++) {
  path.push(nums[i]);
  // 递归下一层：
  // 如果元素不可重复使用：传 i + 1
  // 如果元素可以无限次使用：传 i
  backtrack(path, nums, i + 1);
  path.pop();
}
```

举个栗子

```js
/**
 * LeetCode 78. 子集
 * @param {number[]} nums
 * @return {number[][]}
 */
const subsets = function (nums) {
  const result = [];
  const path = [];

  // 定义回溯函数，接收当前遍历的起始位置
  const backtrack = (startIndex) => {
    // 1. 收集结果：没有任何条件，来到一个节点就收集一个子集
    // 注意：必须使用 [...path] 进行深拷贝
    result.push([...path]);

    // 2. 遍历选择列表：从 startIndex 开始，保证不回头
    for (let i = startIndex; i < nums.length; i++) {
      // 做选择
      path.push(nums[i]);

      // 3. 递归深入：传 i + 1，表示下一个元素不能再选当前的 nums[i] 了
      backtrack(i + 1);

      // 4. 撤销选择：回溯，把刚加进去的元素弹出来，腾出位置给兄弟节点
      path.pop();
    }
  };

  // 从索引 0 开始触发回溯
  backtrack(0);
  return result;
};
```

### 全排列问题

特点：元素的顺序很重要。

核心：每次 `for` 循环都从 0 开始；引入 `used` 数组来记录当前路径用过了哪些坑位。

```js
// 核心逻辑截取：
// 每次都从 0 开始，给所有元素机会
for (let i = 0; i < nums.length; i++) {
  // 剪枝：如果这个元素在当前路径里已经用过了，跳过
  if (used[i])
    continue;

  path.push(nums[i]);
  used[i] = true; // 标记占用

  // 递归下一层，不需要 startIndex 参数
  backtrack(path, nums, used);

  used[i] = false; // 撤销标记
  path.pop();
}
```

举个栗子

```js
/**
 * LeetCode 46. 全排列
 * @param {number[]} nums
 * @return {number[][]}
 */
const permute = function (nums) {
  const result = [];
  const path = [];
  // 用一个布尔数组来记录哪些元素已经被填入 path 中了(本题因为不含重复数字, 用一个 set 也可以哦)
  const used = Array.from({ length: nums.length }).fill(false);

  const backtrack = () => {
    // 1. 结束条件：叶子节点，路径长度等于原数组长度
    if (path.length === nums.length) {
      result.push([...path]);
      return;
    }

    // 2. 遍历选择列表：每次都从 0 开始，寻找所有可能性
    for (let i = 0; i < nums.length; i++) {
      // 3. 剪枝：如果这个坑位的数字在当前路径已经用过了，直接跳过
      if (used[i])
        continue;

      // 做选择
      path.push(nums[i]);
      used[i] = true; // 标记为已使用

      // 4. 递归深入：不需要传 startIndex，因为每次都从头查
      backtrack();

      // 5. 撤销选择：回溯，把状态重置
      used[i] = false; // 解除标记
      path.pop();
    }
  };

  backtrack();
  return result;
};
```

## 复杂度分析

回溯算法本质是穷举，因此时间复杂度通常较高（指数级或阶乘级）。

- **子集/组合问题**：每个元素有两种选择（选或不选），时间复杂度通常为 `O(2^n)`。
- **全排列问题**：`n` 个元素的全排列，时间复杂度通常为 `O(n!)`。

这也是为什么在回溯算法中，“剪枝”操作显得尤为重要。

## 剪枝

概念：在 `for` 循环内部，提前判断出“这条路注定没结果”，然后直接 `continue` 或 `break` (不要 `return`)。

- **可行性剪枝**：例如求和问题，如果当前 `sum` 已经大于 `target`，且数组全为正数，后面的元素肯定也不行，直接 `break`。

- **去重剪枝**：当数组中有重复元素时（例如 `[1, 2, 2]` 求组合），必须先对数组进行排序。然后在循环中判断：`if (i > startIndex && nums[i] === nums[i - 1]) continue;`。这代表“同层树枝上，相同的元素只用一次”，能砍掉大量重复的递归分支。

_实际还得是多做题才行呀_
