(function() {

    "use strict";

    var exec = require('child_process').exec;
    var test = require('tape');

        test('replace by command',
            (t) => {

                exec('node . ./test/test.html -f Test -t Test2', function(err, stdout, stderr) {

                    if (err) t.end(err);
                    else {

                        if (stderr) {
                            t.end(stderr);
                        }

                        t.ok((stdout.indexOf('Test2') !== -1), 'line is changed');
                        t.end();
                    }
                });
            }
        );

        test('replace by .json',
            (t) => {

                exec('node . ./test/test.html -j ./test/.rplcr', function(err, stdout, stderr) {

                    if (err) t.end(err);
                    else {

                        if (stderr) {
                            t.end(stderr);
                        }

                        t.ok((stdout.indexOf('Test7Test') !== -1), 'line is changed');
                        t.end();
                    }
                });
            }
        );

})();
