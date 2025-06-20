# backend/models/product.py

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Product(db.Model):
    __tablename__ = 'products'

    id                     = db.Column(db.Integer, primary_key=True)
    supplier               = db.Column(db.String(120), nullable=False)
    product_code           = db.Column(db.String(120), nullable=False)
    variant                = db.Column(db.String(120), nullable=True)
    cost                   = db.Column(db.Float, nullable=False)
    remark                 = db.Column(db.Text, nullable=True)
    proposed_selling_price = db.Column(db.Float, nullable=False)
    date_updated           = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    # one-to-many relationship to ProductImage
    images = db.relationship(
        'ProductImage',
        back_populates='product',
        cascade='all, delete-orphan'
    )

class ProductImage(db.Model):
    __tablename__ = 'product_images'

    id         = db.Column(db.Integer, primary_key=True)
    filename   = db.Column(db.String(256), nullable=False)
    product_id = db.Column(
        db.Integer,
        db.ForeignKey('products.id', ondelete='CASCADE'),
        nullable=False
    )
    product    = db.relationship(
        'Product',
        back_populates='images'
    )
