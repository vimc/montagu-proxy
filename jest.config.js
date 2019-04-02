var config = {
    testResultsProcessor: "jest-teamcity-reporter",
    transform: {
        "^.+\\.jsx?$": "<rootDir>/node_modules/babel-jest"
    },
    testRegex: "(/__tests__/.*|(\\.|/)(test))\\.[jt]sx?$"
};

module.export = config;