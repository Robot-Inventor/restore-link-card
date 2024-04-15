const { exec } = require("child_process");
const chokidar = require("chokidar");
const CopyFilePlugin = require("copy-webpack-plugin");

class RunCommandsPlugin {
    copyManifest(callback) {
        exec("npx ts-node ./script/copyManifest.ts", (err, stdout, stderr) => {
            if (err) {
                console.error(`Error: ${err}`);
            } else {
                console.log(stdout);
            }

            callback();
        });
    }

    apply(compiler) {
        let manifestWatcher;
        let isWatchMode = false;

        compiler.hooks.watchRun.tapAsync("RunCommandsPlugin", (params, callback) => {
            isWatchMode = true;
            if (!manifestWatcher) {
                manifestWatcher = chokidar.watch("src/manifest/**/*.json");
                manifestWatcher.on("change", (path) => {
                    console.log(`Manifest file changed: ${path}`);
                    this.copyManifest(callback);
                });

                this.copyManifest(callback);
            } else {
                callback();
            }
        });

        compiler.hooks.afterEmit.tapAsync("RunCommandsPlugin", (compilation, callback) => {
            this.copyManifest(callback);
        });
    }
}

module.exports = {
    mode: "production",
    entry: {
        "./chrome/js/main.js": "./src/ts/main.ts",
        "./firefox/js/main.js": "./src/ts/main.ts",
        "./chrome/js/loader.js": "./src/ts/loader.ts",
        "./firefox/js/loader.js": "./src/ts/loader.ts"
    },
    output: {
        filename: "[name]",
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader"
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    plugins: [
        new RunCommandsPlugin(),
        new CopyFilePlugin({
            patterns: [
                {
                    context: "./public/",
                    from: "**/*",
                    to: "chrome/"
                },
                {
                    context: "./public/",
                    from: "**/*",
                    to: "firefox/"
                },
                {
                    from: "./*LICENSE",
                    to: "chrome/"
                },
                {
                    from: "./*LICENSE",
                    to: "firefox/"
                }
            ]
        })
    ]
};