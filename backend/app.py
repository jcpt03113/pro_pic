# backend/app.py

import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models.product import db
from routes.admin_routes import admin_bp
from routes.user_routes import user_bp
from routes.auth_routes import auth_bp  # make sure this file exists
from flask_cors import CORS

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

def create_app():
    # Tell Flask that your “static” folder is backend/static
    app = Flask(
        __name__,
        static_folder=os.path.join(os.path.dirname(__file__), 'static'),
        static_url_path='/static'
    )
    app.config.from_object(Config)

    # Ensure the uploads directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Initialize extensions
    db.init_app(app)
    CORS(app)

    # Initialize JWT with the app
    jwt = JWTManager(app)

    # Register Auth blueprint (no auth required to hit /api/auth/login)
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    # Register your API blueprints (these require a valid JWT)
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(user_bp, url_prefix='/api/user')

    # A simple health-check endpoint
    @app.route('/ping')
    def ping():
        return 'pong', 200

    return app

if __name__ == '__main__':
    # Create and configure the app
    app = create_app()
    with app.app_context():
        # Create any missing tables
        db.create_all()

    # Print out all registered routes for debugging
    for rule in app.url_map.iter_rules():
        print(rule)

    # Run the development server
    app.run(debug=True)

    app.run(debug=True, host='0.0.0.0')

