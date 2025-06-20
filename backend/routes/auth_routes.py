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

(.venv) PS C:\Users\User\PycharmProjects\pro_pic> git add .
git : The term 'git' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the spelling of the name, or if a path was
included, verify that the path is correct and try again.
At line:1 char:1
+ git add .
+ ~~~
    + CategoryInfo          : ObjectNotFound: (git:String) [], CommandNotFoundException
    + FullyQualifiedErrorId : CommandNotFoundException

(.venv) PS C:\Users\User\PycharmProjects\pro_pic> git commit -m "Initial commit"
git : The term 'git' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the spelling of the name, or if a path was
included, verify that the path is correct and try again.
At line:1 char:1
+ git commit -m "Initial commit"
+ ~~~
    + CategoryInfo          : ObjectNotFound: (git:String) [], CommandNotFoundException
    + FullyQualifiedErrorId : CommandNotFoundException

(.venv) PS C:\Users\User\PycharmProjects\pro_pic> git push -u origin main
git : The term 'git' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the spelling of the name, or if a path was
included, verify that the path is correct and try again.
At line:1 char:1
+ git push -u origin main
+ ~~~
    + CategoryInfo          : ObjectNotFound: (git:String) [], CommandNotFoundException
    + FullyQualifiedErrorId : CommandNotFoundException

(.venv) PS C:\Users\User\PycharmProjects\pro_pic>

