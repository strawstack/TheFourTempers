function filesystem() {

    const system = {
        '/': {
            'home': {
                'richard.dev': {
                    'index.html': "content of index.html a website probably"
                }
            },
            'secret': {
                "sam.txt": "this is the content of sam.txt.\nThis is a second line in sam.txt",
                "lumon": {
                    "severed": {
                        "macrodata": "executable file: type filename at prompt to run."
                    }
                }
            }
        }
    };

    // 'path' is assumed to be absolute
    // returns: object, null, or false
    //   'object' is file data
    //   'null' is noop after a create
    //   'false' means error in traversing filepath
    const parsePath = (path, create, contents) => {
        if (create === undefined) create = false;
        if (contents === undefined) contents = {};
        const parts = path.split("/").filter(name => name !== "");
        const lastPart = parts[parts.length - 1];
        const firstParts = parts.slice(0, parts.length - 1);

        let pointer = system['/'];
        for (let name of firstParts) {
            if (create) {
                pointer[name] = {};
            }

            if (!(name in pointer)) {
                console.log(`File or directory not found with name: ${name}`);
                return false;
            }

            pointer = pointer[name];
        }

        if (create) {
            pointer[lastPart] = contents;
            return null;

        } else {
            if (lastPart !== undefined && !(lastPart in pointer)) {
                console.log(`File or directory not found with name: ${lastPart}`);
                return false;
            }

            const content = (lastPart === undefined) ? pointer : pointer[lastPart];

            const isFile = typeof(content) === "string";

            return {
                path,
                parts,
                name: parts[parts.length - 1],
                isFile,
                content: isFile ? content : Object.keys(content),
                contentObj: content
            };
        }
    };

    const splitPath = parsedPath => {
        const { parts } = parsedPath;
        return {
            nodePath: parts.slice(0, parts.length - 1),
            name: parts[parts.length - 1]
        };
    };

    const read = path => {
        const result = parsePath(path);
        if (result === false) return false;
        const { content } = result;
        return content;
    };

    const create = (path, contents) => {
        if (contents === undefined) contents = {};
        const result = parsePath(path, true, contents);
        if (result === false) return false;
        return null;
    };

    const rename = (path, newname) => {
        const result = parsePath(path);
        if (result === false) return false;
        const { isFile } = result;
        const { nodePath, name } = splitPath(result);

        let parent = system['/'];
        for (let nodeName of nodePath) {
            parent = parent[nodeName];
        }

        const contents = parent[name];
        delete parent[name];

        if (isFile) {
            parent[newname] = contents;

        } else {
            parent[newname] = {...contents};

        }
        return null;
    };

    const remove = path => {
        const result = parsePath(path);
        if (result === false) return false;
        const { nodePath, name } = splitPath(result);

        let parent = system['/'];
        for (let nodeName of nodePath) {
            parent = parent[nodeName];
        }

        delete parent[name];
        return null;
    };

    const copy = (path, newPath) => {
        const result = parsePath(path);
        if (result === false) return false;
        const { contentObj } = result;

        const create_result = create(newPath, contentObj);
        if (create_result === false) return false;

        return null;
    };

    const move = (path, newPath) => {
        const result = parsePath(path);
        if (result === false) return false;
        const { contentObj } = result;

        const create_result = create(newPath, contentObj);
        if (create_result === false) return false;

        const remove_result = remove(path);
        if (remove_result === false) return false;

        return null;
    };

    return {
        read,
        create,
        rename,
        move,
        copy,
        remove,
        parsePath: p => parsePath(p)
    };
}