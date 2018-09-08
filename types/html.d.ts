interface ChildNode {
  after: (...arg: any[]) => void;
}

interface ParentNode {
  append: (...arg: any[]) => void;
}
