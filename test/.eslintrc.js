// SEE: http://eslint.org/docs/user-guide/configuring
module.exports = {
  root: true,
  env: {
    mocha: true,
    node: true
  },
  extends: ['standard', 'prettier', 'prettier/standard'],
  plugins: ['import', 'prettier', 'standard'],
  parserOptions: {
    sourceType: 'module'
  },
  rules: {
    'prettier/prettier': 'error'
  },
  parserOptions: {
    sourceType: 'module'
  },
  globals: {
    app: true,
    assert: true,
    baseUrl: true,
    clients: true,
    coll: true,
    dispatch: true,
    expect: true,
    helper: true,
    main: true,
    path: true
  }
}
