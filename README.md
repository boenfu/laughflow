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

let xxx;

pipe(
merge(),
out(multiResults, (a, b, c) => {})
)

compose

definition
|> addNode(1, 2)
|>

addNode(createBranchesNode())(procedureDefinition)

function addNode() {
return ([definition, context]) => {

}
}

function out(operator, callback) {
return ([definition, context]) => {
let ret = operator([definition, context]);

    context = callback(...ret) ?? context;

    return [ret[0], context];

}
}

editor.edit(
[addNode(createBranchesNode()),
addFlowStart(),
out(del(), (...args) => [
removeNode(),
addNode(),
out(xxx(), () => [

])
]),
addNext(node)]
)

compose()

edit 只 支持 一个 operator，多个自己用 compose 包裹

out(addNode1(1), () => {});

out(addNode1(1), () => {
console.log();

return [
deleteNode1(1),
addNode1(2),
out(deleteNode1(2), a => {
console.log(a);

      return [
        deleteAny(),
        out(deleteAny(), (node, flow) => {
          console.log(node, flow);
        }),
      ];
    }),
    addNode1(3),
    addNode1(4),

];
});

高封装度的函数 ->
粒度细的函数 ->
modifier ->
operator

// 初始化任务就把 start flow 创建好，

plugin ableToBeStart 'broken' | 'ignored'

// next 的时候就调所有插件的
plugin ableToBeDone boolean

// 要更新 task 直接就 update

// 父任务 / 标签 有更新

{super: {
stage: 'done',
node: NodeId
}}

触发一次 next
两次 next 间如无任何资源或相关资源更新，应无变化

// 子任务

// 条件
（控制 ignore 和 broken）

// 分配待接收
(没有接受分配设置 ableToBeStart 是 false)

// 流程项未完成
（ableToBeDone false）

// 未点完成
（ableToBeDone false）

// 审批被拒绝

// flow stage
没有 next 可以执行的

// 获取 进行中的节点，可开始的节点，可完成的节点。

////// 描述

上一个节点完成就会创建下一个的 metadata
任务创建时就会把所有边走一次（有循环的也是只会走第一次），生成 metadata

memorize getter
task metadata data 不变就 cache

ignored 视为完成
broken 视为未开始

flow 里没有能继续就算 done 了

原来的中断 变成 branchesNode 的 flow 的 starts 都 broken， flow 就 done 了 ，branchesNode 也 done 了

节点如果没有 leaf stage 为 done 了就 done
否则 得看 leave

node 的 leafNodes 表示的是 node 走到的第一个未 done 的节点

flow 没有完成时 outputs 没有 metadata 的 outputs，但是 leafNode 的 outputs 是有的

没有实际的 leaf 了，或者说每个节点都有完成和中止的 leaf
渲染时是控制要不要展示

leaf 展示出来 可以在 线上渲染条件
实际 条件就变成四种
进入，展示，完成，中止

{
getTaskAbleToBeStart();
preload();
}

// 需要的图标

1. 分支的
2. 展示叶子的图标
3. 粘贴时替换加号的
