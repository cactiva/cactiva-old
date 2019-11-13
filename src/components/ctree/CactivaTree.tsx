import api from "@src/libs/api";
import { Button, Icon, Menu, Popover, SearchInput, Spinner, Text } from "evergreen-ui";
import _ from "lodash";
import { observable } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";
import { useDrop } from "react-dnd-cjs";
import useAsyncEffect from "use-async-effect";
import CactivaDraggable from "../editor/CactivaDraggable";
import "./CactivaTree.scss";

export let tree = observable({ list: {} as any });

export const treeListMeta = observable({
  list: [] as any[],
  source: [],
  expandedDir: [] as any[],
  newShown: false,
  coord: { top: 0, left: 0 },
  keyword: ""
});

export const reloadTreeList = async () => {
  const res = await api.get("ctree/list");
  treeListMeta.source = res.children;
  treeListMeta.list = res.children;
};

export default observer(({ editor }: any) => {
  const selected = editor.path;
  const isLoading =
    ["moving", "duplicating", "renaming", "deleting", "creating"].indexOf(
      editor.status
    ) >= 0;
  useAsyncEffect(reloadTreeList, []);

  useEffect(() => {
    tree.list = {};
    expandSelected(selected, treeListMeta.list, null);
  }, [treeListMeta.list, editor.path]);

  const [{ dragItem, childrenOver }, dropChildrenRef] = useDrop({
    accept: ["element", "directory"],
    drop: async (e: any) => {
      let hover = canDrop(dragItem, { relativePath: "/src" });
      if (hover && childrenOver) {
        editor.status = "moving";
        try {
          await api.get(
            `ctree/move?old=${e.tree.relativePath}&new=/src/${e.tree.name}`
          );
        } catch (e) {
          console.log(e);
        }
        await reloadTreeList();
        editor.status = "ready";
      }
    },
    collect: monitor => {
      return {
        dragItem: monitor.getItem(),
        childrenOver: monitor.isOver({ shallow: true })
      };
    }
  });
  let hover = canDrop(dragItem, { relativePath: "/src" }, childrenOver);
  const onSearch = (e: any) => {
    treeListMeta.keyword = e.nativeEvent.target.value;
    if (treeListMeta.keyword.length === 0) {
      treeListMeta.list = treeListMeta.source;
    } else {
      treeListMeta.list = [];

      const recurse = (list: any[]) => {
        for (let i in list) {
          const item: any = list[i];
          if (item.type === "file") {
            if (
              fuzzyMatch(item.name.toLowerCase(), treeListMeta.keyword.toLowerCase())
            ) {
              treeListMeta.list.push(item);
            }
          } else {
            item.type === "dir";
          }
          {
            recurse(item.children);
          }
        }
      };
      recurse(treeListMeta.source);
    }
  };
  return (
    <div
      className="cactiva-tree"
      onContextMenu={(e:any) => {
        e.preventDefault();
      }}
    >
      <div className="search-box">
        <SearchInput
          className="search"
          placeholder="Search"
          width="100%"
          height={25}
          spellCheck={false}
          onChange={onSearch}
        />

        {treeListMeta.newShown && (
          <div
            onClick={() => {
              treeListMeta.newShown = false;
            }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              zIndex: 11
            }}
          ></div>
        )}
        <Popover
          isShown={treeListMeta.newShown}
          content={<ContentEl editor={editor} />}
        >
          <Button
            className={`search-opt`}
            onMouseDown={() => {
              treeListMeta.newShown = true;
            }}
          >
            {isLoading ? (
              <Spinner size={12} />
            ) : (
                <Icon icon={"plus"} size={11} color={"#aaa"} />
              )}
          </Button>
        </Popover>
      </div>
      <div
        className={`list ${hover ? "hover" : ""} ${isLoading ? "loading" : ""}`}
        ref={dropChildrenRef}
      >
        <div className="list-body">
          {treeListMeta.list.length > 0 ? (
            <Tree
              editor={editor}
              tree={treeListMeta.list}
              selected={selected}
              level={0}
            />
          ) : (
              <Text fontSize={10} marginLeft={10}>
                No item to display.
            </Text>
            )}
          <div style={{ height: 100 }} />
        </div>
      </div>
    </div>
  );
});

const ContentEl = observer((props: any) => {
  const { editor } = props;
  const onSelectFolder = () => {
    treeListMeta.newShown = false;
    setTimeout(async () => {
      const newname = prompt("New folder name:");
      if (newname) {
        editor.status = "creating";
        try {
          await api.get(
            `ctree/newdir?path=/src/${newname.replace(/[^0-9a-zA-Z]/g, "")}`
          );
        } catch (e) {
          console.log(e);
        }
        await reloadTreeList();
        editor.status = "ready";
      }
    });
  };
  const onSelectComponent = () => {
    treeListMeta.newShown = false;
    setTimeout(async () => {
      const newname = prompt("New component name:");
      if (newname) {
        const path =
          "/src/" + _.startCase(newname).replace(/[^0-9a-zA-Z]/g, "") + ".tsx";
        editor.status = "creating";
        try {
          const newpath = path;
          await api.get(`ctree/newfile?path=${newpath}`);
          editor.load(newpath);
        } catch (e) {
          console.log(e);
        }
        await reloadTreeList();
        editor.status = "ready";
      }
    });
  };
  return (
    <div className="ctree-menu">
      <Menu>
        <Menu.Item icon="new-text-box" onSelect={onSelectComponent}>
          New Component
        </Menu.Item>
        <Menu.Item icon="folder-new" onSelect={onSelectFolder}>
          New folder
        </Menu.Item>
      </Menu>
    </div>
  );
});

const expandSelected = (path: string, list: any, parent: any) => {
  _.map(list, (e: any) => {
    e.relativePath = e.relativePath.replace("./", "/src/");
    e.parent = parent;
    if (path === e.relativePath) {
      let epar = e.parent;
      while (epar) {
        epar.expanded = true;
        epar = epar.parent;
      }
    }

    if (e.type === "dir") {
      if (treeListMeta.expandedDir.indexOf(e.relativePath) >= 0) {
        e.expanded = true;
      }
      expandSelected(path, e.children, e);
    } else {
      tree.list[e.name.substr(0, e.name.length - 4)] = e;
    }
  });
};

const File = ({
  name,
  toggle,
  getRef,
  level,
  editor,
  selected,
  e,
  children
}: any) => {
  const ref = useRef(null as any);
  if (ref && ref.current) {
    getRef(ref.current);
  }
  const onClick = () => {
    localStorage.setItem("cactiva-current-path", e.relativePath);
    editor.load(e.relativePath);
  };

  return (
    <CactivaDraggable
      dragInfo={{
        tree: e
      }}
      cactiva={{
        source: { id: null },
        tag: {
          tagName: e.relativePath,
          mode: "component"
        }
      }}
    >
      <div
        ref={ref}
        onContextMenu={(e: any) => {
          treeListMeta.coord.top = e.pageY;
          treeListMeta.coord.left = e.pageX;
          toggle();
        }}
        onClick={onClick}
        style={{ paddingLeft: level * 10 }}
        className={`item ${selected === e.relativePath ? "selected" : ""}`}
      >
        {children}
      </div>
    </CactivaDraggable>
  );
};

const canDrop = (dragitem: any, e: any, hover = true) => {
  if (dragitem) {
    if (!dragitem.tree) {
      return false;
    } else {
      if (hover) return isDirectorySame(dragitem, e);
    }
  }
  return false;
};

const isDirectorySame = (dragitem: any, e: any) => {
  const tree = dragitem.tree;
  const filePath = tree.relativePath.split("/");
  filePath.pop();
  const path = tree.type === "file" ? filePath.join("/") : tree.relativePath;
  if (path === e.relativePath) {
    return false;
  }
  return true;
};

const Directory = ({
  children,
  getRef,
  toggle,
  level,
  e,
  editor,
  selected
}: any) => {
  const drop = async (dragItem: any) => {
    let hover = canDrop(dragItem, e, dropOver || childrenOver);
    if (hover) {
      editor.status = "moving";
      try {
        await api.get(
          `ctree/move?old=${dragItem.tree.relativePath}&new=${e.relativePath}/${dragItem.tree.name}`
        );
      } catch (e) {
        console.log(e);
      }
      await reloadTreeList();
      editor.status = "ready";
    }
  };
  const [{ dropItem, dropOver }, dropItemRef] = useDrop({
    accept: ["element", "directory"],
    drop,
    collect: monitor => {
      return {
        dropItem: monitor.getItem(),
        dropOver: monitor.isOver({ shallow: true })
      };
    }
  });

  const [{ childrenItem, childrenOver }, dropChildrenRef] = useDrop({
    accept: ["element", "directory"],
    drop,
    collect: monitor => {
      return {
        childrenItem: monitor.getItem(),
        childrenOver: monitor.isOver({ shallow: true })
      };
    }
  });

  const dragitem = dropItem || childrenItem;
  let hover = canDrop(dragitem, e, dropOver || childrenOver);

  const ref = useRef(null as any);
  if (ref && ref.current) {
    dropItemRef(ref.current);
    getRef(ref.current);
  }
  const onClick = () => {
    e.expanded = !e.expanded;
    if (e.expanded) {
      treeListMeta.expandedDir.push(e.relativePath);
    } else {
      const idx = treeListMeta.expandedDir.indexOf(e.relativePath);
      if (idx >= 0) {
        treeListMeta.expandedDir.splice(idx, 1);
      }
    }
  };

  return (
    <CactivaDraggable
      dragInfo={{
        type: "directory",
        tree: e
      }}
      cactiva={{
        source: { id: null },
        tag: {
          tagName: name,
          mode: "component"
        }
      }}
    >
      <div
        ref={ref}
        className={`item ${hover ? "hover" : ""}`}
        style={{ paddingLeft: level * 10 }}
        onClick={onClick}
        onContextMenu={(e: any) => {
          treeListMeta.coord.top = e.pageY;
          treeListMeta.coord.left = e.pageX;
          toggle();
        }}
      >
        {children}
      </div>
      {e.expanded && (
        <div className={`list ${hover ? "hover" : ""}`} ref={dropChildrenRef}>
          <Tree
            editor={editor}
            tree={e.children}
            selected={selected}
            level={level + 1}
          />
        </div>
      )}
    </CactivaDraggable>
  );
};

const Tree = observer(({ editor, tree, selected, level }: any) => {
  return (
    <div>
      {_.sortBy(tree, "type").map((e: any, i: number) => {
        let unsaved = false;
        if (
          editor.sources[e.relativePath] &&
          !editor.sources[e.relativePath].isSaved
        ) {
          unsaved = true;
        }
        const name =
          e.type === "dir" ? e.name : e.name.substr(0, e.name.length - 4);
        const el = (
          <>
            <div className={`icon ${e.type}`}>
              {e.type === "dir" ? (
                <Icon
                  icon={e.expanded ? "folder-open" : "folder-close"}
                  size={10}
                  color="#66788a"
                />
              ) : (
                  <Icon
                    icon="code"
                    size={10}
                    color={unsaved ? "red" : "#66788a"}
                  />
                )}
            </div>
            <Text
              color={unsaved ? "red" : "#333"}
              fontWeight={unsaved ? "bold" : "normal"}
            >
              {name}
            </Text>
          </>
        );

        return (
          <TreeItem
            name={name}
            key={i}
            e={e}
            selected={selected}
            editor={editor}
            level={level}
            el={el}
          />
        );
      })}
    </div>
  );
});

const TreeItem = observer(({ name, e, selected, editor, level, el }: any) => {
  const toggleRef = useRef(null as any);
  const newComponent = () => {
    const toggle = _.get(toggleRef, "current");
    toggle();
    setTimeout(async () => {
      const newname = prompt("New component name:");
      if (newname) {
        const path = e.relativePath.split("/");
        if (e.type === "file") {
          path.pop();
        }
        path.push(_.startCase(newname).replace(/[^0-9a-zA-Z]/g, "") + ".tsx");

        editor.status = "creating";
        try {
          const newpath = path.join("/");
          await api.get(`ctree/newfile?path=${newpath}`);
          editor.load(newpath);
        } catch (e) {
          console.log(e);
        }
        await reloadTreeList();
        editor.status = "ready";
      }
    });
  };
  const newFolder = () => {
    const toggle = _.get(toggleRef, "current");
    toggle();
    setTimeout(async () => {
      const newname = prompt("New folder name:");
      if (newname) {
        const path = e.relativePath.split("/");
        if (e.type === "file") {
          path.pop();
        }
        path.push(newname.replace(/[^0-9a-zA-Z]/g, ""));
        editor.status = "creating";
        try {
          await api.get(`ctree/newdir?path=${path.join("/")}}`);
        } catch (e) {
          console.log(e);
        }
        await reloadTreeList();
        editor.status = "ready";
      }
    });
  };
  const duplicateFile = () => {
    const toggle = _.get(toggleRef, "current");
    toggle();
    setTimeout(async () => {
      const newname = prompt("Duplicate to:", name + "Copy");
      if (newname) {
        editor.status = "duplicating";
        const path = e.relativePath.split("/");
        path.pop();
        path.push(_.startCase(newname).replace(/[^0-9a-zA-Z]/g, "") + ".tsx");
        try {
          await api.get(
            `ctree/duplicate?path=${e.relativePath}&to=${path.join("/")}`
          );
        } catch (e) {
          console.log(e);
        }
        await reloadTreeList();
        editor.status = "ready";
      }
    });
  };
  const renameFile = () => {
    const toggle = _.get(toggleRef, "current");
    toggle();
    setTimeout(async () => {
      const newname = prompt("Rename to:", name.replace(".tsx", ""));
      if (newname && e.name !== newname) {
        const path = e.relativePath.split("/");
        path.pop();
        if (e.type === "file") {
          path.push(_.startCase(newname).replace(/[^0-9a-zA-Z]/g, "") + ".tsx");
        } else {
          path.push(newname.replace(/[^0-9a-zA-Z]/g, ""));
        }

        editor.status = "renaming";
        try {
          await api.get(
            `ctree/move?old=${e.relativePath}&new=${path.join("/")}`
          );
        } catch (e) {
          console.log(e);
        }
        await reloadTreeList();
        editor.status = "ready";
      }
    });
  };
  const deleteFile = async () => {
    const toggle = _.get(toggleRef, "current");
    toggle();
    if (confirm(`Are you sure want to delete ${e.relativePath}?`)) {
      editor.status = "deleting";
      try {
        await api.get(`ctree/delete?path=${e.relativePath}`);
      } catch (e) {
        console.log(e);
      }
      await reloadTreeList();
      editor.status = "ready";
    }
  };
  return (
    <Popover
      statelessProps={{
        style: {
          top: treeListMeta.coord.top,
          left: treeListMeta.coord.left
        }
      }}
      content={
        <div className="ctree-menu">
          <div className="cactiva-trait-cmenu-heading">
            <Text>{name}</Text>
          </div>
          <Menu>
            <Menu.Item icon="new-text-box" onSelect={newComponent}>
              New Component
            </Menu.Item>
            <Menu.Item icon="folder-new" onSelect={newFolder}>
              New folder
            </Menu.Item>
            <Menu.Divider />
            {e.type === "file" && (
              <Menu.Item icon="duplicate" onSelect={duplicateFile}>
                Duplicate
              </Menu.Item>
            )}
            <Menu.Item icon="text-highlight" onSelect={renameFile}>
              Rename
            </Menu.Item>
            <Menu.Item icon="trash" intent="danger" onSelect={deleteFile}>
              Delete
            </Menu.Item>
            {editor.expo.url && <>
              <Menu.Divider />
              <Menu.Item icon="link" onSelect={() => {
                const toggle = _.get(toggleRef, "current");
                toggle();
                const win = window.open(editor.expo.url + e.relativePath.substr(4, e.relativePath.length - 8), '_blank');
                if (win) win.focus();
              }}>
                Open Web Preview
            </Menu.Item>
            </>}
          </Menu>
        </div>
      }
    >
      {({ toggle, getRef, isShown }: any) => {
        toggleRef.current = toggle;
        return (
          <>
            {e.type === "dir" ? (
              <Directory
                e={e}
                selected={selected}
                editor={editor}
                level={level}
                getRef={getRef}
                toggle={toggle}
              >
                {el}
              </Directory>
            ) : (
                <File
                  name={name}
                  e={e}
                  selected={selected}
                  editor={editor}
                  level={level}
                  getRef={getRef}
                  toggle={toggle}
                >
                  {el}
                </File>
              )}
            {isShown && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  zIndex: 11
                }}
              ></div>
            )}
          </>
        );
      }}
    </Popover>
  );
});

const findLargestSmallest = (a: string, b: string) =>
  a.length > b.length
    ? {
      largest: a,
      smallest: b
    }
    : {
      largest: b,
      smallest: a
    };

export const fuzzyMatch = (strA: string, strB: string, fuzziness = 1) => {
  if (strA === "" || strB === "") {
    return false;
  }

  const { largest, smallest } = findLargestSmallest(strA, strB);
  const maxIters = largest.length - smallest.length;
  const minMatches = smallest.length - fuzziness;

  for (let i = 0; i < maxIters; i++) {
    let matches = 0;
    for (let smIdx = 0; smIdx < smallest.length; smIdx++) {
      if (smallest[smIdx] === largest[smIdx + i]) {
        matches++;
      }
    }
    if (matches > 0 && matches >= minMatches) {
      return true;
    }
  }

  return false;
};
