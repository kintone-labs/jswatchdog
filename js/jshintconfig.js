module.exports = {
  enforceall: true,

  // Enforcing options
  bitwise: false,
  camelcase: false,
  eqeqeq: false,
  es3: false,
  immed: false,
  noarg: false,
  nocomma: false, // Confusing behavior
  maxparams: 7,
  maxdepth: 5,
  maxstatements: 50,
  maxcomplexity: 30,
  maxlen: 120,
  singleGroups: false,
  undef: false,
  unused: false,

  // Relaxing options
  asi: true,
  sub: true, // Allow obj['name']

  // Environments
  browser: true,
  devel: true,

  // Disable errors report from ESLint.
  '-W009': true, // The array literal notation [] is preferable.
  '-W010': true // The object literal notation {} is preferable.
};
