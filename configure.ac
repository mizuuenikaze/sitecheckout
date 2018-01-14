dnl Process this file with autoconf
AC_INIT([sitecheckout], [1.5.1])
AC_PREREQ(2.69)
AM_INIT_AUTOMAKE([foreign nostdinc])
dnl Program checks
AC_ARG_VAR([PUGLATIZER], [A template engine.])
AC_CHECK_PROG([PUGLATIZER],[puglatizer], [puglatizer], [no])
AM_CONDITIONAL([FOUND_PUGLATIZER], [test "x$PUGLATIZER" != "xno"])
AM_COND_IF([FOUND_PUGLATIZER],,[AC_MSG_ERROR([Required: npm install -g puglatizer])])

AC_ARG_VAR([BROWSERIFY], [A preparer of node js to browser.])
AC_CHECK_PROG([BROWSERIFY],[browserify], [browserify], [no])
AM_CONDITIONAL([FOUND_BROWSERIFY], [test "x$BROWSERIFY" != "xno"])
AM_COND_IF([FOUND_BROWSERIFY],,[AC_MSG_ERROR([Required: npm install -g browserify])])

AC_ARG_VAR([UGLIFYJS], [A munger of js.])
AC_CHECK_PROG([UGLIFYJS],[uglifyjs], [uglifyjs], [no])
AM_CONDITIONAL([FOUND_UGLIFYJS], [test "x$UGLIFYJS" != "xno"])
AM_COND_IF([FOUND_UGLIFYJS],,[AC_MSG_ERROR([Required: npm install -g uglifyjs])])

AC_ARG_VAR([STYLUS], [A css engine.])
AC_CHECK_PROG([STYLUS],[stylus], [stylus], [no])
AM_CONDITIONAL([FOUND_STYLUS], [test "x$STYLUS" != "xno"])
AM_COND_IF([FOUND_STYLUS],,[AC_MSG_ERROR([Required: npm install -g stylus])])

AC_ARG_VAR([CLEANCSS], [A munger of css.])
AC_CHECK_PROG([CLEANCSS],[cleancss], [cleancss], [no])
AM_CONDITIONAL([FOUND_CLEANCSS], [test "x$CLEANCSS" != "xno"])
AM_COND_IF([FOUND_CLEANCSS],,[AC_MSG_ERROR([Required: npm install -g clean-css-cli])])

AC_ARG_VAR([JQ], [A json query tool.])
AC_CHECK_PROG([JQ],[jq], [jq], [no])
AM_CONDITIONAL([FOUND_JQ], [test "x$JQ" != "xno"])
AM_COND_IF([FOUND_JQ],,[AC_MSG_ERROR([Required: jq to process json files])])

AC_PROG_SED

AC_ARG_ENABLE([debug], [ --enable-debug	Development level debug],
[case "${enableval}" in
	yes) debug=true ;;
	no) debug=false ;;
	*) AC_MSG_ERROR([bad value ${enableval} for --enable-debug]) ;;
esac],[debug=false])

AM_CONDITIONAL([DEBUG], [test x$debug = xtrue])

AC_OUTPUT([Makefile])

