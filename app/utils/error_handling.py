from fastapi import HTTPException

def raise_error(status_code: int, message: str, error_type: str):
    raise HTTPException(
        status_code=status_code,
        detail={
            "error": {
                "message": message,
                "type": error_type
            }
        }
    ) 