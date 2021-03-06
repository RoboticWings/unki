/**
 * Represents an error that occurs during compilation of unki chunk data.
 * @constructor
 * @param {string} message - The error message
 * @param {string} type - The specific error type
 * @param {string} rowNumber - The number of line where the error occurs
 */
class NoteInputError {
  message: string
  type: string
  rowNumber: number
  constructor(message: string, type: string, rowNumber: number) {
    this.message = message;
    this.type = type;
    this.rowNumber = rowNumber;
  }
}

/**
 * Translates between unki chunk data in markdown format and JS objects. 
 */
const NoteParser = {
  /**
   * Parse markdown note data into a sequence of chunk objects.
   * @param {string} content - Markdown note data 
   * @returns a list of chunk entities
   */
  getChunks: function (content: string) {
    let rowNumber = 1;
    const rows = content.split("\n");
    const results: { title: string, content: object }[] = [];
    const discriminator = /^\[Unki\]:\s+#\s+[\("]([^):]+)(: ([^)]+))?[\)"]$/;
    const getRow: () => string = () => rows[rowNumber - 1];
    while (rowNumber <= rows.length) {
      const chunkHead = getRow().trim().match(discriminator);
      // chunk head detected
      if (chunkHead) {
        // get chunk info
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
              const getFlowchartError: (message: string) => NoteInputError = function (msg: string) { // ???????????????
                return new NoteInputError(msg, "Error while compiling Markdown flowchart", rowNumber);
              };
              const getElement: (elementTag: string) => Element = function (tag: string) { // ????????????
                const elem = elements.get(tag);
                if (elem) {
                  return elem;
                } else {
                  throw getFlowchartError(`The flowchart element '${tag}' is not defined`);
                }
              };
              const connectElements: (elementTags: string[]) => void = function (seq: string[]) { // ???????????????????????????
                for (let i = 1; i < seq.length; i++) {
                  getElement(seq[i - 1]).targets.push({
                    condition: undefined,
                    to: getElement(seq[i])
                  })
                }
              }
              let isFlowing: boolean = false;
              while (rowNumber <= rows.length) {
                // ????????????????????????
                if (isFlowing) {
                  if (getRow().trim() == "```") {
                    // ???????????????????????????????????????
                    isFlowing = false;
                    break;
                  }
                } else {
                  if (getRow().trim() == "```flow") {
                    isFlowing = true; // ?????????????????????
                    rowNumber++;
                    continue;
                  }
                }
                // ?????????????????????
                if (isFlowing) {
                  const regAdd = /^([^(=>)]+)=>([^:]+)(: ([^(:>)]+))?(:>(.+))?$/;
                  const regIf = /^([^(\())]+)\(([^)]+)\)((->([^(->)]+))+)$/;
                  const regConnect = /^([^(->)]+)(->[^(->)]+)+$/;
                  [regAdd, regIf, regConnect].forEach((r, regIndex) => {
                    const a = getRow().match(r);
                    if (!a) return;
                    switch (regIndex) {
                      case 0: // ????????????
                        const tag = a[1];
                        const elem = new Element(a[2], a[4], a[6]);
                        try {
                          elements.set(tag, elem);
                        } catch (e) {
                          throw getFlowchartError(`The flowchart element '${tag}' already exists`);
                        }
                        break;
                      case 1: // ????????????
                        const e0 = getElement(a[1]); // ???????????? e0
                        const condition = a[2]; // ???????????? condition
                        const seq1 = a[3].replace("->", "").split("->"); // ?????????????????????
                        e0.targets.push({ // ??????????????????
                          condition,
                          to: getElement(seq1[0])
                        });
                        connectElements(seq1); // ???????????????????????????????????????
                        break;
                      case 2: // ????????????
                        const seq2 = a[0].split("->");
                        connectElements(seq2);
                        break;
                    }
                  });
                }
                rowNumber++;
              }
              return { // ????????? 
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
              const err: (message: string) => NoteInputError = function (msg: string) {
                return new NoteInputError
                  (msg, "Error while compiling Markdown nested list", rowNumber);
              };
              const nodes: TreeNode[] = [];
              const metaNode = new TreeNode("MetaNode");
              let parentLocation: TreeNode[] = [];
              let lastNode = metaNode;
              let lastLevel = 0;
              nodes.push(metaNode);
              while (rowNumber <= rows.length) {
                // ??????????????????????????????????????????
                if (getRow().trim().match(/\[End Unki\]:\s+#\s+[\("]Mindmap[\)"]/)) break;
                const r = /^((\s{3})*)[-+*]\s(.+)/;
                const analysis = getRow().match(r);
                // ???????????????????????????????????????????????????
                if (!analysis) continue;
                let level = analysis[1].length / 3 + 1; // ????????????1??????????????????????????????
                const itemText = analysis[3];
                const node = new TreeNode(itemText);
                nodes.push(node);
                if (level > lastLevel) {
                  // ?????????????????????????????????(??????)
                  parentLocation.push(lastNode);
                  // ??????????????????????????????????????????????????????????????????????????????????????????????????????
                  level = lastLevel + 1;
                  // console.log(`?????????${node.content}?????????????????????${lastNode.content}????????????`);
                } else if (lastLevel > level) {
                  // ?????????????????????(??????)
                  parentLocation = parentLocation.slice(0, level);
                  // console.log(`?????????${node.content}???????????????${parentLocation.at(-1).content}????????????`);
                } else {
                  // console.log(`?????????${node.content}?????????????????????${lastNode.content}??????????????????${parentLocation.at(-1).content}????????????`);
                }
                // ??????????????????
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
            throw new NoteInputError("Parsing error", `The chunk type "${chunkType}" is not supported`, rowNumber)
        }
        rowNumber++;
        results.push({ title: chunkTitle, content: chunkContent });
      }
    }
    return results;
  }
}

export default NoteParser;