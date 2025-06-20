# backend/routes/auth_routes.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    JWTManager,
)

auth_bp = Blueprint('auth_bp', __name__)

# In-memory user "database"
USERS = {
    "admin":   {"password": "Hengheng138*",      "role": "admin"},
    "showroom":{"password": "anzpropic","role": "user"},
}

@auth_bp.route('/login', methods=['POST'])
def login():
    js = request.get_json() or {}
    username = js.get('username', '')
    password = js.get('password', '')
    user = USERS.get(username)

    print(f"[LOGIN DEBUG] username={username}, password={password}, matched_user={user}")

    if not user or user['password'] != password:
        return jsonify({"msg": "Bad credentials"}), 401

    access_token = create_access_token(
        identity=username,
        additional_claims={"role": user['role']}
    )
    return jsonify(access_token=access_token, role=user['role']), 200
