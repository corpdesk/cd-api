#!/bin/bash
if [ -f /opt/myrouter/mysqlrouter.pid ]; then
  kill -HUP `cat /opt/myrouter/mysqlrouter.pid`
  rm -f /opt/myrouter/mysqlrouter.pid
fi