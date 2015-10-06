#!/usr/bin/env node

(function() {

    "use strict";

    var fs          = require('fs');
    var path        = require('path');
    var program     = require('commander');
    var eventStream = require('event-stream');

    var programInfo = require('../package.json');

    var srcPath     = null;

    // define cli input
    program
        .version(programInfo.version)
        .arguments('<sourcePath>')
        .action((sourcePath) => { srcPath = sourcePath })
        .option('-j, --by-json <pathToJson>', 'path to a .rplcr file')
        .option('-o, --outfile <pathToOutfile>', 'write to this file')
        .option('-f, --from-string <replaceFrom>', 'from this string')
        .option('-t, --to-string <replaceTo>', 'to this string');

    // handle cli input
    program.parse(process.argv);


    /**
     * [createReadStream description]
     * @param  {[type]} srcPath [description]
     * @return {[type]}         [description]
     */
    function createReadStream(srcPath) {

        if (!srcPath) {
            throw new Error('no source given');
        }

        return fs.createReadStream(srcPath);
    }

    /**
     * [replaceItem description]
     * @param  {[type]} stream [description]
     * @param  {[type]} params [description]
     * @return {[type]}        [description]
     */
    function replaceItem(stream, params, opts) {

        params = params || {};
        opts   = opts || {};

        if (!stream) {
            throw new Error('no file stream');
        }

        if (!params.fromString && !params.toString) {
            throw new Error('no replace opts');
        }

        // replace
        stream = stream.pipe(
            eventStream.replace(params.fromString, params.toString)
        );

        if (!opts.silent) {

            // no outfile, print to stdout
            if (!params.outfile) {
                stream.pipe(process.stdout);
            } else {
                // write to file
                stream.pipe(fs.createWriteStream(params.outfile));
            }
        }

        return stream;
    }

    /**
     * [replaceItemByArray description]
     * @param  {[type]} paramArray [description]
     * @return {[type]}            [description]
     */
    function replaceItemByArray(paramArray) {

        paramArray.forEach(
            (paramItem) => {

                var stream  = createReadStream(paramItem.src);
                var outfile = program.outfile;

                var replaceDefLength = paramItem.replaceDefinitions.length - 1;

                paramItem.replaceDefinitions.forEach(
                    (replaceDefinitionItem, pos) => {

                        var fromString = Object.keys(replaceDefinitionItem)[0];
                        var toString   = replaceDefinitionItem[fromString];

                        var replaceOptions = {
                            silent: (replaceDefLength === pos) ? false: true
                        }

                        stream = replaceItem(
                            stream, {
                                'fromString': fromString,
                                'toString'  : toString,
                                'outfile'   : outfile
                            },
                            replaceOptions
                        );
                    }
                )
            }
        );
    }


    /**
     * [getJsonData description]
     * @param  {[type]} pathToJson [description]
     * @return {[type]}            [description]
     */
    function getJsonData(pathToJson) {

        return new Promise(
            (resolve, reject) => {

                if (!pathToJson) {
                    return reject('no json path given');
                }

                fs.readFile(path.normalize(pathToJson), 'UTF8',
                    (err, fileContent) => {
                        if (err) {

                            if (err.code === 'ENOENT') {
                                reject(path.basename(pathToJson) + ' file not exists');
                            } else {
                                reject(err);
                            }
                        }
                        else {
                            if (typeof fileContent === 'string') {
                                fileContent = JSON.parse(fileContent);
                            }

                            resolve(fileContent);
                        }
                    }
                );
            }
        );
    }

    var PromiseArray = [];

    // get json data
    if (program.byJson) {
        PromiseArray.push(
            getJsonData(program.byJson)
        );
    }

    // no srcPath, no jsonPath, try to get .rplcr
    if (srcPath === null && !program.byJson) {
        PromiseArray.push(
            getJsonData(process.cwd() + path.sep + '.rplcr')
        );
    }

    Promise.all(PromiseArray)
        .then((data) => {

            if (data && data.length !== 0) {
                replaceItemByArray(data[0]);
                return;
            }

            replaceItem(
                createReadStream(srcPath), {
                    'fromString': program.fromString,
                    'toString'  : program.toString,
                    'outfile'   : program.outfile
                }
            );
        })
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });

})();
