import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Carga las variables de entorno desde el archivo .env
load_dotenv()

DATABASE_USER = os.environ.get("DB_USER", "postgres")
DATABASE_PASSWORD = os.environ.get("DB_PASSWORD") # Esto vendrá de Secret Manager
DATABASE_NAME = os.environ.get("DB_NAME", "panaderia")
DATABASE_HOST = "34.27.186.16" # IMPORTANTE: localhost porque Cloud SQL Proxy lo maneja
DATABASE_PORT = os.environ.get("DB_PORT", "5432")

# Cadena de conexión (para PostgreSQL)
DATABASE_URL = f"postgresql://{DATABASE_USER}:{DATABASE_PASSWORD}@{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_NAME}"

# Verifica que DATABASE_URL esté configurada
if not DATABASE_URL:
    raise ValueError("La variable de entorno DATABASE_URL no está configurada. "
                     "Asegúrate de tener un archivo .env con DATABASE_URL o de configurarla en tu entorno.")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependencia para obtener la sesión de la base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
