class MarkdownCompilationError {
  msg: string
  type: string
  lineNumber: number
  constructor(msg: string, type: string, lineNumber: number) {
    this.msg = msg;
    this.type = type;
    this.lineNumber = lineNumber;
  }
}

const MarkdownCompiler = {
  getChunks: function (content: string) {
    let rowNumber = 1;
    const rows = content.split("\n");
    const results: { title: string, content: object }[] = [];
    const discriminator = /^\[Unki\]:\s+#\s+[\("]([^):]+)(: ([^)]+))?[\)"]$/;
    const getRow: () => string = () => rows[rowNumber - 1];
    while (rowNumber <= rows.length) {
      const chunkHead = getRow().trim().match(discriminator);
      // 检测到了 Unki chunk 头
      if (chunkHead) {
        // 获取 chunk 信息
        const chunkType = chunkHead[1];
        const chunkTitle = chunkHead[3];
        let chunkContent: any;
        switch (chunkType) {
          case "Flowchart":
            chunkContent = (function () {
              class Element {
                type: string
                content: string
                url: string
                targets: { to: Element, condition: string | undefined }[]
                constructor(type: string, content: string, url: string) {
                  this.type = type;
                  this.content = content;
                  this.url = url;
                  this.targets = new Array();
                }
              }
              const elements: Map<string, Element> = new Map();
              const getFlowchartError: (message: string) => MarkdownCompilationError = function (msg: string) { // 错误生成器
                return new MarkdownCompilationError(msg, "Error while compiling Markdown flowchart", rowNumber);
              };
              const getElement: (elementTag: string) => Element = function (tag: string) { // 获取元素
                const elem = elements.get(tag);
                if (elem) {
                  return elem;
                } else {
                  throw getFlowchartError(`The flowchart element '${tag}' is not defined`);
                }
              };
              const connectElements: (elementTags: string[]) => void = function (seq: string[]) { // 建立元素之间的连接
                for (let i = 1; i < seq.length; i++) {
                  getElement(seq[i - 1]).targets.push({
                    condition: undefined,
                    to: getElement(seq[i])
                  })
                }
              }
              let isFlowing: boolean = false;
              while (rowNumber <= rows.length) {
                // 流程图起始和终止
                if (isFlowing) {
                  if (getRow().trim() == "```") {
                    // 取消流程图状态，并返回结果
                    isFlowing = false;
                    break;
                  }
                } else {
                  if (getRow().trim() == "```flow") {
                    isFlowing = true; // 进入流程图状态
                    rowNumber++;
                    continue;
                  }
                }
                // 解析流程图代码
                if (isFlowing) {
                  const regAdd = /^([^(=>)]+)=>([^:]+)(: ([^(:>)]+))?(:>(.+))?$/;
                  const regIf = /^([^(\())]+)\(([^)]+)\)((->([^(->)]+))+)$/;
                  const regConnect = /^([^(->)]+)(->[^(->)]+)+$/;
                  [regAdd, regIf, regConnect].forEach((r, regIndex) => {
                    const a = getRow().match(r);
                    if (!a) return;
                    switch (regIndex) {
                      case 0: // 添加元素
                        const tag = a[1];
                        const elem = new Element(a[2], a[4], a[6]);
                        try {
                          elements.set(tag, elem);
                        } catch (e) {
                          throw getFlowchartError(`The flowchart element '${tag}' already exists`);
                        }
                        break;
                      case 1: // 条件连接
                        const e0 = getElement(a[1]); // 条件元素 e0
                        const condition = a[2]; // 条件内容 condition
                        const seq1 = a[3].replace("->", "").split("->"); // 之后的直接连接
                        e0.targets.push({ // 进行条件连接
                          condition,
                          to: getElement(seq1[0])
                        });
                        connectElements(seq1); // 完成条件连接之后的普通连接
                        break;
                      case 2: // 直接连接
                        const seq2 = a[0].split("->");
                        connectElements(seq2);
                        break;
                    }
                  });
                }
                rowNumber++;
              }
              return { // 返回值 
                type: "flowchart",
                elements
              };
            })();
            break;
          case "Mindmap":
            chunkContent = (function () {
              class TreeNode {
                content: string
                children: TreeNode[]
                parent: TreeNode | undefined
                constructor(content: string) {
                  this.content = content;
                  this.children = [];
                }
              }
              const err: (message: string) => MarkdownCompilationError = function (msg: string) {
                return new MarkdownCompilationError
                  (msg, "Error while compiling Markdown nested list", rowNumber);
              };
              const nodes: TreeNode[] = [];
              const metaNode = new TreeNode("MetaNode");
              let parentLocation: TreeNode[] = [];
              let lastNode = metaNode;
              let lastLevel = 0;
              nodes.push(metaNode);
              while (rowNumber <= rows.length) {
                // 若匹配到终止行，思维导图终止
                if (getRow().trim().match(/\[End Unki\]:\s+#\s+[\("]Mindmap[\)"]/)) break;
                const r = /^((\s{3})*)[-+*]\s(.+)/;
                const analysis = getRow().match(r);
                // 若匹配到非多级列表项内容，直接跳过
                if (!analysis) continue;
                let level = analysis[1].length / 3 + 1; // 最小值为1，不可能与元节点平级
                const itemText = analysis[3];
                const node = new TreeNode(itemText);
                nodes.push(node);
                if (level > lastLevel) {
                  // 上一元素是本元素的父亲(下移)
                  parentLocation.push(lastNode);
                  // 无论是只下移了一级，还是连续向下跳两级及两级以上的，一律视作下移一级
                  level = lastLevel + 1;
                  // console.log(`节点“${node.content}”是上一节点“${lastNode.content}”的儿子`);
                } else if (lastLevel > level) {
                  // 跳出一个子列表(上推)
                  parentLocation = parentLocation.slice(0, level);
                  // console.log(`节点“${node.content}”是节点“${parentLocation.at(-1).content}”的儿子`);
                } else {
                  // console.log(`节点“${node.content}”与上一节点“${lastNode.content}”平级，是“${parentLocation.at(-1).content}”的儿子`);
                }
                // 建立父子关系
                parentLocation[-1].children.push(node);
                node.parent = parentLocation[-1];
                lastLevel = level;
                lastNode = node;
                rowNumber++;
              }
              return {
                type: "mindmap",
                nodes
              };
            })();
            break;
          default:
            throw new MarkdownCompilationError("Parsing error", `The chunk type "${chunkType}" is not supported`, rowNumber)
        }
        rowNumber++;
        results.push({ title: chunkTitle, content: chunkContent });
      }
    }
    return results;
  }
}

export default MarkdownCompiler;
