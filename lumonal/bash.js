function bash({ fs: filesystem, ter: terminal }) {
    const { onCommand, onAutoCompleteRequest, setPath } = terminal;
    const {
        read,
        create,
        move,
        copy,
        remove,
        parsePath
    } = filesystem;

    let path = ['/'];

    const ERROR_RESPONSE = {data: "Missing file or directory."};

    const pathStr = () => {
        return path.join("/").replace("//", "/");
    };

    // pathArg could be absolute (starts with '/')
    // or relative (should be combined with path)
    const getRealPath = pathArg => {
        if (pathArg[0] === "/") {
            return pathArg;
        } else {
            return `${pathStr()}/${pathArg}`.replace("//", "/");
        }
    };

    const commands = {
        clear: {
            call: () => {
                return {
                    cmd: "clear"
                };
            },
            info: "Clear the terminal."
        },
        help: {
            call: () => {
                const res = ["Available commands:"];
                for (let cmd in commands) {
                    if ("list" in commands[cmd] && commands[cmd]["list"] === false) continue;
                    res.push(`  ${cmd}: ${commands[cmd].info}`);
                }
                return {
                    data: res.join("\n")
                };
            },
            info: "Show a list of commands."
        },
        ls: {
            call: args => {
                const pathArg = (args.length > 0) ? args[0] : "";
                const realPath = getRealPath(pathArg);
                const readRes = read(realPath);
                if (readRes === false) return ERROR_RESPONSE;
                return {
                    data: readRes.map(name => `  ${name}`).join("\n")
                };
            },
            info: "List the contents of a directory."
        },
        cd: {
            call: args => {
                const pathArg = (args.length > 0) ? args[0] : ".";
                if (pathArg === ".") {
                    return { data: "" };

                } else if (pathArg === "..") {
                    path.pop();

                } else {
                    const realPath = getRealPath(pathArg);

                    const result = parsePath(realPath);
                    if (result === false) return ERROR_RESPONSE;
                    const { parts } = result;

                    path = ['/']; // reset path
                    for (let part of parts) {
                        path.push(part);
                    }
                }
                setPath(pathStr());
                return { cmd: "noop" };
            },
            info: "Change directory."
        },
        cat: {
            call: args => {
                if (args.length < 1) return { data: "" };
                const pathArg = args[0];
                const result = read(getRealPath(pathArg));
                if (result === false) return ERROR_RESPONSE;
                return {
                    data: result
                };
            },
            info: "Print contents of a file."
        },
        touch: {
            call: args => {
                const pathArg = args[0];
                const result = create(getRealPath(pathArg), "");
                if (result === false) return ERROR_RESPONSE;
                return { cmd: "noop" };
            },
            info: "Create a new file."
        },
        mkdir: {
            call: args => {
                const pathArg = args[0];
                const result = create(getRealPath(pathArg), {});
                if (result === false) return ERROR_RESPONSE;
                return { cmd: "noop" };
            },
            info: "Create a directory."
        },
        rm: {
            call: args => {
                const pathArg = args[0];
                const result = remove(getRealPath(pathArg));
                if (result === false) return ERROR_RESPONSE;
                return { cmd: "noop" };
            },
            info: "Remove a file or directory."
        },
        cp: {
            call: args => {
                const pathArg = args[0];
                const destArg = args[1];
                const result = copy(getRealPath(pathArg), getRealPath(destArg));
                if (result === false) return ERROR_RESPONSE;
                return { cmd: "noop" };
            },
            info: "Copy a file or directory."
        },
        mv: {
            call: args => {
                const pathArg = args[0];
                const destArg = args[1];
                const result = move(getRealPath(pathArg), getRealPath(destArg));
                if (result === false) return ERROR_RESPONSE;
                return { cmd: "noop" };
            },
            info: "Move a file or directory."
        },
        echo: {
            call: args => {
                return {
                    data: "not implemented"
                };
            },
            info: "Return the given text."
        },
        macrodata: {
            call: args => {
                const MACRODATA_PATH = "/secret/lumon/severed";
                if (pathStr() === MACRODATA_PATH) {
                    return { cmd: "macrodata" };

                } else {
                    return {
                        data: "Command not found."
                    };
                }
            },
            info: "Launch the macro-data refinement application.",
            list: false
        },
    };

    const registerNewCommand = ({name, call, info}) => {
        if (!(name in commands)) {
            commands[name] = {
                call,
                info
            };
        }
    };

    const parseCommand = cmdStr => {
        const symbols = cmdStr.trim().split(/ +/);
        return {
            cmd: symbols[0],
            args: symbols.slice(1)
        };
    };

    onCommand(cmdStr => {
        const { cmd, args } = parseCommand(cmdStr);
        if (cmd in commands) {
            return commands[cmd].call(args);

        } else {
            return {
                data: "Command not found."
            };

        }
    });

    onAutoCompleteRequest(({cmd: strCmd, offset}) => {
        let left = offset - 1;
        while (true) {
            if (left <= 0 || strCmd[left] === " ") break;
            left -= 1;
        }
        left = (left < 0) ? 0 : left;

        const segment = strCmd.slice(left, offset).trim() ;

        // Consider these symbols
        const symbols = [];

        // Add commands if segment might be a command
        if (segment.indexOf("/") === -1) {
            symbols.push(...Object.keys(commands));
        }

        const path = segment.split("/");
        path.pop();
        const queryPath = (path.length === 0) ? [""] : path;

        const result = read(getRealPath(queryPath.join("/")));
        if (result !== false && typeof(result) !== "string") {
            symbols.push(...result);
        }

        const lastIndex = segment.lastIndexOf("/", offset);
        const prefix = (lastIndex === -1) ? segment: segment.slice(lastIndex + 1);

        for (let symbol of symbols) {
            if (symbol.indexOf(prefix) === 0) {
                return symbol.slice(prefix.length);
            }
        }

        return null;
    });

    return {
        registerNewCommand
    };
}