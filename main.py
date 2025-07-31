from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import os

from database import engine, Base, get_db
import models, schemas

# Crear las tablas en la base de datos si no existen.
# Esto es útil para el desarrollo inicial, pero en un entorno de producción,
# es preferible usar herramientas de migración de bases de datos como Alembic.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="API de Panadería")

# Configuración de CORS
origins = [
    "http://localhost",
    "http://localhost:3000",
    os.environ.get("URL_BACKEND"),
    os.environ.get("URL_FRONTEND")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # Permite los orígenes especificados
    allow_credentials=True,         # Permite credenciales (cookies, encabezados de autorización)
    allow_methods=["*"],            # Permite todos los métodos (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],            # Permite todos los encabezados
)

# Endpoint de prueba
@app.get("/")
async def root():
    return {"message": "Bienvenido a la API de la Panadería"}

# ----------------------------------------------------------------------
# Endpoints para PRODUCTOS
# ----------------------------------------------------------------------

@app.post("/productos/", response_model=schemas.Producto, status_code=status.HTTP_201_CREATED)
def create_producto(producto: schemas.ProductoCreate, db: Session = Depends(get_db)):
    """
    Crea un nuevo producto en la base de datos.
    """
    db_producto = models.Producto(**producto.model_dump())
    db.add(db_producto)
    db.commit()
    db.refresh(db_producto)
    return db_producto

@app.get("/productos/", response_model=List[schemas.Producto])
def read_productos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Lista todos los productos disponibles en la base de datos.
    Soporta paginación con 'skip' y 'limit'.
    """
    productos = db.query(models.Producto).offset(skip).limit(limit).all()
    return productos

@app.get("/productos/{producto_id}", response_model=schemas.Producto)
def read_producto(producto_id: int, db: Session = Depends(get_db)):
    """
    Obtiene un producto específico por su ID.
    """
    db_producto = db.query(models.Producto).filter(models.Producto.id == producto_id).first()
    if db_producto is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    return db_producto


@app.post("/pedidos/", response_model=schemas.Pedido, status_code=status.HTTP_201_CREATED)
def create_pedido(pedido: schemas.PedidoCreate, db: Session = Depends(get_db)):
    """
    Crea un nuevo pedido en la base de datos.
    """
    db_pedido = models.Pedido(**pedido.model_dump())
    db.add(db_pedido)
    db.commit()
    db.refresh(db_pedido)
    return db_pedido

@app.get("/pedidos/", response_model=List[schemas.Pedido])
def read_pedidos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Lista todos los pedidos.
    """
    pedidos = db.query(models.Pedido).offset(skip).limit(limit).all()
    return pedidos
