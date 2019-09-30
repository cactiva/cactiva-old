import _ from 'lodash';

export const findElementById = (root: any, id: number): any => {
  if (root.id === id) return root;
  for (let i in root.children) {
    const child = root.children[i];
    if (child && child.props.cactiva) {
      const cfound = findElementById(child.props.cactiva, id);
      if (cfound) return cfound;
    }
  }
};

export const findParentElementById = (root: any, id: number): any => {
  if (root.id === id) return root;
  for (let i in root.children) {
    const child = root.children[i];
    if (child && child.props.cactiva) {
      const cfound = findParentElementById(child.props.cactiva, id);
      if (cfound) return { el: root, idx: i };
    }
  }
};

export const removeElementById = (root: any, id: number): any => {
  const parent = findParentElementById(root, id);
  if (parent) {
    parent.el.children.splice(parent.idx, 1);
    flattenRoot(root);
  }
  return false;
};

const flattenRoot = (root: any) => {
  const result = root.tag.constructor.flatten(root.source);
  for (let i in root.children) {
    const cactiva = _.get(root, `children.${i}.props.cactiva`);
    if (cactiva) {
      result.children[i] = flattenRoot(cactiva);
    } else {
      console.log(root);
    }
  }
  return result;
};

export const isParentOf = (
  root: any,
  parentId: number,
  childId: number
): boolean => {
  if (parentId === childId) return false;

  const parent = findElementById(root, parentId);
  if (parent) {
    const child = findElementById(parent, childId);
    return !!child;
  }
  return false;
};
