import React from "react";
import { SearchInput, Button, Icon } from "evergreen-ui";
import { observer, useObservable } from "mobx-react-lite";

export default observer(() => {
    const meta = useObservable({
        list: []
    });
    return <div className="cactiva-dialog-editor">
        <div className="list">
            <div className="search-box">
                <SearchInput
                    className="search"
                    placeholder="Search"
                    width="100%"
                    height={25}
                    spellCheck={false}
                />
                <Button className={`search-opt`}
                > <Icon icon={"plus"} size={11} color={"#aaa"} />
                </Button>
            </div>
            <div className="list-items">
            </div>
        </div>
        <div className="content">

        </div>
    </div>;
})