dnl Process this file with autoconf
AC_INIT([sitecheckout], [1.1.1])
AC_PREREQ(2.69)
AM_INIT_AUTOMAKE([foreign nostdinc])
dnl Program checks
AC_CHECK_PROG([puglatizer],[puglatizer], [yes], [no])
AM_CONDITIONAL([FOUND_PUGLATIZER], [test "x$puglatizer" = "xyes"])
AM_COND_IF([FOUND_PUGLATIZER],,[AC_MSG_ERROR([Required: npm install -g puglatizer])])

AC_CHECK_PROG([browserify],[browserify], [yes], [no])
AM_CONDITIONAL([FOUND_BROWSERIFY], [test "x$browserify" = "xyes"])
AM_COND_IF([FOUND_BROWSERIFY],,[AC_MSG_ERROR([Required: npm install -g browserify])])

AC_CHECK_PROG([uglifyjs],[uglifyjs], [yes], [no])
AM_CONDITIONAL([FOUND_UGLIFYJS], [test "x$uglifyjs" = "xyes"])
AM_COND_IF([FOUND_UGLIFYJS],,[AC_MSG_ERROR([Required: npm install -g uglifyjs])])

AC_CHECK_PROG([stylus],[stylus], [yes], [no])
AM_CONDITIONAL([FOUND_STYLUS], [test "x$stylus" = "xyes"])
AM_COND_IF([FOUND_STYLUS],,[AC_MSG_ERROR([Required: npm install -g stylus])])

AC_CHECK_PROG([cleancss],[cleancss], [yes], [no])
AM_CONDITIONAL([FOUND_CLEANCSS], [test "x$cleancss" = "xyes"])
AM_COND_IF([FOUND_CLEANCSS],,[AC_MSG_ERROR([Required: npm install -g clean-css-cli])])

AC_CHECK_PROG([jq],[jq], [yes], [no])
AM_CONDITIONAL([FOUND_JQ], [test "x$jq" = "xyes"])
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

