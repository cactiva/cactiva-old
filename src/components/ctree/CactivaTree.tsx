import api from "@src/libs/api";
import { Icon, SearchInput, Text, Popover, Menu, Button } from "evergreen-ui";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";
import useAsyncEffect from "use-async-effect";
import CactivaDraggable from "../editor/CactivaDraggable";
import "./CactivaTree.scss";
import { useDrop } from "react-dnd-cjs";
import { toJS } from "mobx";

export default observer(({ editor }: any) => {
  const meta = useObservable({
    list: [] as any[],
    source: [],
    newShown: false,
    keyword: ""
  });
  const selected = editor.path;
  useAsyncEffect(async () => {
    const res = await api.get("ctree/list");
    meta.source = res.children;
    meta.list = res.children;
  }, []);

  useEffect(() => {
    expandSelected(selected, meta.list, null);
  }, [meta.list]);

  const [{ dragItem, childrenOver }, dropChildrenRef] = useDrop({
    accept: ["element", "directory"],
    drop: (e: any) => {
      let hover = canDrop(dragItem, { relativePath: "/src" });
      if (hover && childrenOver) {
        console.log(e.tree.relativePath, "/src");
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
                    const newname = prompt("New component name:");
                    if (newname) {
                      console.log(
                        "/src/" +
                          _.startCase(newname.replace(/\W/g, "")) +
                          ".tsx"
                      );
                    }
                  }}
                >
                  New Component
                </Menu.Item>
                <Menu.Item
                  icon="folder-new"
                  onSelect={() => {
                    meta.newShown = false;
                    const newname = prompt("New folder name:");
                    if (newname) {
                      console.log("/src/" + newname.replace(/\W/g, ""));
                    }
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
            <Icon icon={"plus"} size={11} color={"#aaa"} />
          </Button>
        </Popover>
      </div>
      <div className={`list ${hover ? "hover" : ""}`} ref={dropChildrenRef}>
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
      expandSelected(path, e.children, e);
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
  const drop = (dragItem: any) => {
    let hover = canDrop(dragItem, e, dropOver || childrenOver);
    if (hover) {
      console.log(dragItem.tree.relativePath, e.relativePath);
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

                const newname = prompt("New component name:");
                if (newname) {
                  const path = e.relativePath.split("/");
                  if (e.type === "file") {
                    path.pop();
                  }
                  path.push(_.startCase(newname.replace(/\W/g, "")) + ".tsx");
                  console.log(path.join("/"));
                }
              }}
            >
              New Component
            </Menu.Item>
            <Menu.Item
              icon="folder-new"
              onSelect={() => {
                const toggle = _.get(toggleRef, "current");
                toggle();

                const newname = prompt("New folder name:");
                if (newname) {
                  const path = e.relativePath.split("/");
                  if (e.type === "file") {
                    path.pop();
                  }
                  path.push(newname.replace(/\W/g, ""));
                  console.log(path.join("/"));
                }
              }}
            >
              New folder
            </Menu.Item>
            <Menu.Item
              icon="text-highlight"
              onSelect={() => {
                const toggle = _.get(toggleRef, "current");
                toggle();
                const newname =
                  prompt("Rename to:", name) +
                  (e.type === "file" ? ".tsx" : "");
                if (newname && e.name !== newname) {
                  const path = e.relativePath.split("/");
                  if (e.type === "file") {
                    path.pop();
                    path.push(_.startCase(newname.replace(/\W/g, "")) + ".tsx");
                  } else {
                    path.push(newname.replace(/\W/g, ""));
                  }
                  console.log(e.relativePath, path.join("/"));
                }
              }}
            >
              Rename
            </Menu.Item>
            <Menu.Item
              icon="trash"
              intent="danger"
              onSelect={() => {
                const toggle = _.get(toggleRef, "current");
                toggle();
                if (confirm(`Are you sure want to delete ${e.relativePath}?`)) {
                  console.log(e.relativePath);
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
