# backend/routes/user_routes.py

from flask import Blueprint, request, jsonify, url_for, send_file, current_app
from models.product import Product
from sqlalchemy import or_
import pandas as pd
from io import BytesIO

user_bp = Blueprint('user_bp', __name__)

@user_bp.route('/products', methods=['GET'])
def get_products():
    """
    Search products by supplier, product_code, or variant.
    Case-insensitive, partial matches.
    If no query params provided, returns all products.
    """
    supplier = request.args.get('supplier', '').strip()
    code     = request.args.get('product_code', '').strip()
    variant  = request.args.get('variant', '').strip()

    query = Product.query

    # build filters for any non-empty input
    filters = []
    if supplier:
        filters.append(Product.supplier.ilike(f"%{supplier}%"))
    if code:
        filters.append(Product.product_code.ilike(f"%{code}%"))
    if variant:
        filters.append(Product.variant.ilike(f"%{variant}%"))

    if filters:
        # combine with OR: match any of the provided filters
        query = query.filter(or_(*filters))

    results = []
    for p in query.order_by(Product.id).all():
        # gather all image URLs
        image_urls = [
            url_for(
                'static',
                filename=f"uploads/{img.filename}",
                _external=True
            )
            for img in getattr(p, 'images', [])
        ]

        results.append({
            "id": p.id,
            "supplier": p.supplier,
            "product_code": p.product_code,
            "variant": p.variant,
            "cost": p.cost,
            "date_updated": p.date_updated.isoformat(),
            "remark": p.remark,
            "image_urls": image_urls,
            "proposed_selling_price": p.proposed_selling_price
        })

    return jsonify(results), 200


@user_bp.route('/products/export', methods=['GET'])
def export_products():
    """
    Export filtered (or all) products to Excel.
    Query params same as /products.
    """
    supplier = request.args.get('supplier', '').strip()
    code     = request.args.get('product_code', '').strip()
    variant  = request.args.get('variant', '').strip()

    query = Product.query
    if supplier:
        query = query.filter(Product.supplier.ilike(f"%{supplier}%"))
    if code:
        query = query.filter(Product.product_code.ilike(f"%{code}%"))
    if variant:
        query = query.filter(Product.variant.ilike(f"%{variant}%"))

    # Build DataFrame
    rows = []
    for p in query.order_by(Product.id).all():
        rows.append({
            "Supplier": p.supplier,
            "Product Code": p.product_code,
            "Variant": p.variant,
            "Cost": p.cost,
            "Date Updated": p.date_updated,
            "Remark": p.remark,
            "Proposed Selling Price": p.proposed_selling_price
        })
    df = pd.DataFrame(rows)

    # Write to Excel in-memory
    output = BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Products')
    output.seek(0)

    return send_file(
        output,
        as_attachment=True,
        download_name='products_export.xlsx',
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )

