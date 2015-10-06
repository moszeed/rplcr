rplcr
===================
replace strings in files, with the cli

## how to get
install from npm

    npm i rplcr

## how to use

    Usage: rplcr [options] <sourcePath>

    Options:

      -h, --help                       output usage information
      -V, --version                    output the version number
      -j, --by-json <pathToJson>       replace by a given
      -o, --outfile <pathToOutfile>    write to this file
      -f, --from-string <replaceFrom>  from this string
      -t, --to-string <replaceTo>      to this string

## examples

change string in .html and save to a new .html file
    rplcr ./test/test.html -f "Test" -t "Test2Test" -o ./test/test2.html
