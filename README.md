# magicflow

Just another awesome magic.

## License

MIT License.

- 勾勾叉叉是流程&任务节点的属性，任务节点没有显式的勾勾叉叉时，以节点 done 作为 勾勾，以节点 terminated 作为 叉叉
  - 单独存在的话，没有显示设置勾勾叉叉的节点被当作任务完成条件去判断时很奇怪
- 遍历所有叶子节点/叶子连接器，根据勾勾叉叉的情况判断任务状态
- entering / ignored

// none = ignored | !entering
// pending-start 代表未执行的可到达
// blocked 代表不可执行，线路 entered，
// in-progress
// done | terminated

// 开始节点：
// 暂停节点：
// 完成节点：
// 获取可开始节点
// 获取进行中节点
// 更新节点内容
// 不满足导致 ignored
// 已进入后变 非 entering
// terminated
//

分支节点
分支

单个分支可以在分支节点内 横向扩展
单个分支（多个节点）内的某个节点想要横向扩展，就要把单个节点变成一个只有一个 branch 的 branchesNode 且 branch 里就一个节点，就满足了能横向扩展的功能

实体
node 和 branchesNode,其中 branchesNode 中每个 branch 是一个 flow

<!-- 整个流程也是一个 flow -->

node next 只能为 branchesNode 或 node

flow 只存了 nexts id

流程有一个根 flow

node：具体执行节点，nexts 中 维护着对某几个 node/branchesNode 的引用（ID）
branchesNode：分支节点，nexts 中 维护着对某几个 node/branchesNode 的引用（ID），flows 中 维护着节点内的 flow 的引用
flow: 维护着对某几个 node/branchesNode 的引用（ID）

flow 的 done 是无可执行节点
branchesNode 的 done 是 所有 flow 都 done

branchesNode 可移动不可复制

// 交互细节

flow 行首没有，直接有个 + ，点了之后 + 变成 两个 node | branchesNode，再次点击创建
行首有的时候 hover flow 右侧线上有 +，同上

// 代码细节

没有明确删除各资源 definition 的方法（如 unlinkNode），实际就不会删除 node definition，所以可能存在流程中 未被任何地方使用的野节点

pure

// procedure 变 procedure modifier

// undo redo 搬 procedure editor

// procedure 仅为对象的相关 getter， 比如 treeNode

// procedure editor 自己组装 modifier，提供把多个 合成一次 undo

// 把 复制粘贴 这种拆成两个 modifier
