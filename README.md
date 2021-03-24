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
