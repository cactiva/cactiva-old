import api from "@src/libs/api";
import {
  Button,
  Icon,
  Menu,
  Popover,
  SearchInput,
  Text,
  Spinner
} from "evergreen-ui";
import _ from "lodash";
import { observable, toJS } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";
import { useDrop } from "react-dnd-cjs";
import useAsyncEffect from "use-async-effect";
import CactivaDraggable from "../editor/CactivaDraggable";
import "./CactivaTree.scss";

export let tree = observable({ list: {} as any });

const meta = observable({
  list: [] as any[],
  source: [],
  expandedDir: [] as any[],
  newShown: false,
  keyword: ""
});

const reloadList = async () => {
  const res = await api.get("ctree/list");
  meta.source = res.children;
  meta.list = res.children;
};

export default observer(({ editor }: any) => {
  const selected = editor.path;
  const isLoading =
    ["moving", "duplicating", "renaming", "deleting", "creating"].indexOf(
      editor.status
    ) >= 0;
  useAsyncEffect(reloadList, []);

  useEffect(() => {
    tree.list = {};
    expandSelected(selected, meta.list, null);
  }, [meta.list, editor.path]);

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
        await reloadList();
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
  return (
    <div
      className="cactiva-tree"
      onContextMenu={e => {
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
          onChange={(e: any) => {
            meta.keyword = e.nativeEvent.target.value;
            if (meta.keyword.length === 0) {
              meta.list = meta.source;
            } else {
              meta.list = [];

              const recurse = (list: any[]) => {
                for (let i in list) {
                  const item: any = list[i];
                  if (item.type === "file") {
                    if (
                      fuzzyMatch(
                        item.name.toLowerCase(),
                        meta.keyword.toLowerCase()
                      )
                    ) {
                      meta.list.push(item);
                    }
                  } else {
                    item.type === "dir";
                  }
                  {
                    recurse(item.children);
                  }
                }
              };
              recurse(meta.source);
            }
          }}
        />

        {meta.newShown && (
          <div
            onClick={() => {
              meta.newShown = false;
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
          isShown={meta.newShown}
          content={
            <div className="ctree-menu">
              <Menu>
                <Menu.Item
                  icon="new-text-box"
                  onSelect={() => {
                    meta.newShown = false;
                    setTimeout(async () => {
                      const newname = prompt("New component name:");
                      if (newname) {
                        const path =
                          "/src/" +
                          _.startCase(newname).replace(/[^0-9a-zA-Z]/g, "") +
                          ".tsx";
                        editor.status = "creating";
                        try {
                          await api.get(`ctree/newfile?path=${path}`);
                        } catch (e) {
                          console.log(e);
                        }
                        await reloadList();
                        editor.status = "ready";
                      }
                    });
                  }}
                >
                  New Component
                </Menu.Item>
                <Menu.Item
                  icon="folder-new"
                  onSelect={() => {
                    meta.newShown = false;
                    setTimeout(async () => {
                      const newname = prompt("New folder name:");
                      if (newname) {
                        editor.status = "creating";
                        try {
                          await api.get(
                            `ctree/newdir?path=/src/${newname.replace(
                              /[^0-9a-zA-Z]/g,
                              ""
                            )}`
                          );
                        } catch (e) {
                          console.log(e);
                        }
                        await reloadList();
                        editor.status = "ready";
                      }
                    });
                  }}
                >
                  New folder
                </Menu.Item>
              </Menu>
            </div>
          }
        >
          <Button
            className={`search-opt`}
            onMouseDown={() => {
              meta.newShown = true;
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
          {meta.list.length > 0 ? (
            <Tree
              editor={editor}
              tree={meta.list}
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
      if (meta.expandedDir.indexOf(e.relativePath) >= 0) {
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

  return (
    <CactivaDraggable
      dragInfo={{
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
        onContextMenu={() => {
          toggle();
        }}
        onClick={() => {
          localStorage.setItem("cactiva-current-path", e.relativePath);
          editor.load(e.relativePath);
        }}
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
      await reloadList();
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
        onClick={() => {
          e.expanded = !e.expanded;
          if (e.expanded) {
            meta.expandedDir.push(e.relativePath);
          } else {
            const idx = meta.expandedDir.indexOf(e.relativePath);
            if (idx >= 0) {
              meta.expandedDir.splice(idx, 1);
            }
          }
        }}
        onContextMenu={() => {
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
  return (
    <Popover
      content={
        <div className="ctree-menu">
          <div className="cactiva-trait-cmenu-heading">
            <Text>{name}</Text>
          </div>
          <Menu>
            <Menu.Item
              icon="new-text-box"
              onSelect={() => {
                const toggle = _.get(toggleRef, "current");
                toggle();
                setTimeout(async () => {
                  const newname = prompt("New component name:");
                  if (newname) {
                    const path = e.relativePath.split("/");
                    if (e.type === "file") {
                      path.pop();
                    }
                    path.push(
                      _.startCase(newname).replace(/[^0-9a-zA-Z]/g, "") + ".tsx"
                    );

                    editor.status = "creating";
                    try {
                      await api.get(`ctree/newfile?path=${path.join("/")}`);
                    } catch (e) {
                      console.log(e);
                    }
                    await reloadList();
                    editor.status = "ready";
                  }
                });
              }}
            >
              New Component
            </Menu.Item>
            <Menu.Item
              icon="folder-new"
              onSelect={() => {
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
                    await reloadList();
                    editor.status = "ready";
                  }
                });
              }}
            >
              New folder
            </Menu.Item>
            <Menu.Divider />
            {e.type === "file" && (
              <Menu.Item
                icon="duplicate"
                onSelect={() => {
                  const toggle = _.get(toggleRef, "current");
                  toggle();
                  setTimeout(async () => {
                    const newname = prompt("Duplicate to:", name + "Copy");
                    if (newname) {
                      editor.status = "duplicating";
                      const path = e.relativePath.split("/");
                      path.pop();
                      path.push(
                        _.startCase(newname).replace(/[^0-9a-zA-Z]/g, "") +
                          ".tsx"
                      );
                      try {
                        await api.get(
                          `ctree/duplicate?path=${
                            e.relativePath
                          }&to=${path.join("/")}`
                        );
                      } catch (e) {
                        console.log(e);
                      }
                      await reloadList();
                      editor.status = "ready";
                    }
                  });
                }}
              >
                Duplicate
              </Menu.Item>
            )}
            <Menu.Item
              icon="text-highlight"
              onSelect={() => {
                const toggle = _.get(toggleRef, "current");
                toggle();
                setTimeout(async () => {
                  const newname = prompt(
                    "Rename to:",
                    name.replace(".tsx", "")
                  );
                  if (newname && e.name !== newname) {
                    const path = e.relativePath.split("/");
                    path.pop();
                    if (e.type === "file") {
                      path.push(
                        _.startCase(newname).replace(/[^0-9a-zA-Z]/g, "") +
                          ".tsx"
                      );
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
                    await reloadList();
                    editor.status = "ready";
                  }
                });
              }}
            >
              Rename
            </Menu.Item>
            <Menu.Item
              icon="trash"
              intent="danger"
              onSelect={async () => {
                const toggle = _.get(toggleRef, "current");
                toggle();
                if (confirm(`Are you sure want to delete ${e.relativePath}?`)) {
                  editor.status = "deleting";
                  try {
                    await api.get(`ctree/delete?path=${e.relativePath}`);
                  } catch (e) {
                    console.log(e);
                  }
                  await reloadList();
                  editor.status = "ready";
                }
              }}
            >
              Delete
            </Menu.Item>
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

const fuzzyMatch = (strA: string, strB: string, fuzziness = 1) => {
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
