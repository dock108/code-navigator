# config.py
# Basic configuration file for the FastAPI app

from pathlib import Path
from dotenv import load_dotenv

# Load .env file if it exists
env_path = Path(__file__).parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)

# Add configuration variables here as needed in the future. 