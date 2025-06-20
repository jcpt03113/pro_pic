# backend/routes/admin_routes.py

import os
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from flask_jwt_extended import jwt_required, get_jwt
from models.product import Product, ProductImage, db

admin_bp = Blueprint('admin_bp', __name__)

ALLOWED_EXT = {'png', 'jpg', 'jpeg', 'gif'}
def allowed_file(fn):
    return '.' in fn and fn.rsplit('.', 1)[1].lower() in ALLOWED_EXT

@admin_bp.route('/products', methods=['POST'])
@jwt_required()
def create_product():
    """Create a new product (with optional multiple images)."""
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({"msg": "Admins only"}), 403

    supplier = request.form.get('supplier')
    product_code = request.form.get('product_code')
    variant = request.form.get('variant')
    cost = float(request.form.get('cost', 0))
    remark = request.form.get('remark')
    proposed = float(request.form.get('proposed_selling_price', 0))

    # Create product record
    prod = Product(
        supplier=supplier,
        product_code=product_code,
        variant=variant,
        cost=cost,
        remark=remark,
        proposed_selling_price=proposed
    )
    db.session.add(prod)
    db.session.flush()  # assign prod.id

    # Save multiple images
    upload_dir = current_app.config['UPLOAD_FOLDER']
    os.makedirs(upload_dir, exist_ok=True)
    for file in request.files.getlist('images'):
        if file and allowed_file(file.filename):
            fname = secure_filename(f"{datetime.utcnow().timestamp()}_{file.filename}")
            file.save(os.path.join(upload_dir, fname))
            db.session.add(ProductImage(filename=fname, product_id=prod.id))

    db.session.commit()
    return jsonify({"message": "Product created", "id": prod.id}), 201

@admin_bp.route('/products/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    """Update an existing product and append new images if provided."""
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({"msg": "Admins only"}), 403

    prod = Product.query.get_or_404(product_id)
    data = request.form
    prod.supplier = data.get('supplier', prod.supplier)
    prod.product_code = data.get('product_code', prod.product_code)
    prod.variant = data.get('variant', prod.variant)
    prod.cost = float(data.get('cost', prod.cost))
    prod.remark = data.get('remark', prod.remark)
    prod.proposed_selling_price = float(
        data.get('proposed_selling_price', prod.proposed_selling_price)
    )

    # Append additional images
    upload_dir = current_app.config['UPLOAD_FOLDER']
    os.makedirs(upload_dir, exist_ok=True)
    for file in request.files.getlist('images'):
        if file and allowed_file(file.filename):
            fname = secure_filename(f"{datetime.utcnow().timestamp()}_{file.filename}")
            file.save(os.path.join(upload_dir, fname))
            db.session.add(ProductImage(filename=fname, product_id=prod.id))

    db.session.commit()
    return jsonify({"message": "Product updated", "id": prod.id}), 200

@admin_bp.route('/products/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    """Delete a product and all its image files."""
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({"msg": "Admins only"}), 403

    prod = Product.query.get_or_404(product_id)
    # remove image files
    for img in prod.images:
        try:
            os.remove(os.path.join(current_app.config['UPLOAD_FOLDER'], img.filename))
        except OSError:
            pass

    db.session.delete(prod)
    db.session.commit()
    return jsonify({"message": "Product deleted"}), 200

@admin_bp.route('/products/bulk-upload', methods=['POST'])
@jwt_required()
def bulk_upload():
    """Bulk import from Excel, inserting every row that isn’t an exact duplicate."""
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({"msg": "Admins only"}), 403

    file = request.files.get('file')
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    import pandas as pd
    df = pd.read_excel(file)

    created = skipped = 0
    for _, row in df.iterrows():
        s    = str(row.get('supplier','')).strip()
        code = str(row.get('product_code','')).strip()
        var  = str(row.get('variant','')).strip()
        cost = float(row.get('cost',0))
        rem  = str(row.get('remark','')).strip()
        prop = float(row.get('proposed_selling_price',0))

        exists = Product.query.filter_by(
            supplier=s,
            product_code=code,
            variant=var,
            cost=cost,
            remark=rem,
            proposed_selling_price=prop
        ).first()
        if exists:
            skipped += 1
            continue

        p = Product(
            supplier=s,
            product_code=code,
            variant=var,
            cost=cost,
            remark=rem,
            proposed_selling_price=prop
        )
        db.session.add(p)
        created += 1

    db.session.commit()
    return jsonify({
        "message": "Bulk upload complete",
        "created": created,
        "skipped_duplicates": skipped
    }), 200
