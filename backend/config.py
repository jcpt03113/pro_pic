import os
from dotenv import load_dotenv

# Base directory of this file
basedir = os.path.abspath(os.path.dirname(__file__))

# Load environment variables from instance/.env if present
load_dotenv(os.path.join(basedir, 'instance', '.env'))

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "another-super-secret")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = os.path.join(basedir, 'static', 'uploads')
