import os
# import sys

# if sys.platform=='win32':
#     dbpath = "dbs/"
# else:
#     dbpath = "smoke/dbs/"

class Config(object):
    SECRET_KEY = os.environ.get("SECRET_KEY") or '4JwB4==<)0M0U))0M>1"fN~y.Q,'
