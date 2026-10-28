# backend/test_hash.py
from dotenv import load_dotenv
import os
from passlib.context import CryptContext

load_dotenv(dotenv_path="./.env")  # pastikan path benar

pwd = os.getenv("DEFAULT_ADMIN_PASSWORD", "cardus")
#print("raw repr:", repr(pwd))
#print("bytes length:", len(pwd.encode("utf-8")))

pwd = pwd.strip()
#print("sanitized repr:", repr(pwd))
#print("sanitized length:", len(pwd.encode("utf-8")))

# test hashing
pwdctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
hashed = pwdctx.hash(pwd)
#print("hashed ok:", hashed)
#print("verify ok:", pwdctx.verify(pwd, hashed))
