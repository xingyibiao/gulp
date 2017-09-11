module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
        "node":true,
        "jquery":true
    },
    "extends": "standard",
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        "no-new": 0,
        "one-var": [
            "error", "always"
        ],
        "indent": [
            "error",
            2
        ],
        "linebreak-style": [
            "error",
            "windows"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "never"
        ],
        "eqeqeq": [2, "allow-null"],
        "no-console":0,
        'arrow-parens': 0,
        'generator-star-spacing': 0
    },
    globals: {
        BMap: true,
    },
};