import os
import sys
import subprocess
import logging

LOG_LEVEL = os.getenv("OPENCODE_LOG_LEVEL", "INFO").upper()
DEFAULT_TIMEOUT_SECONDS = 10

def _setup_logger():
    logging.basicConfig(
        level=LOG_LEVEL,
        format="[%(levelname)s] %(message)s",
    )
    return logging.getLogger("opencode_bridge")

def _test_agent_identity_inheritance(logger):
    """Simula una consulta de un sub-agente para verificar su identidad heredada."""
    context = get_project_context(logger)
    mode_line = [line for line in context.splitlines() if "MAESTRO_MODE=" in line]
    
    print("\n--- TEST DE HERENCIA DE IDENTIDAD ---")
    if mode_line:
        print(f"1. Contexto Recibido: {mode_line[0]}")
        mode = mode_line[0].split("=")[1]
        
        if mode == "KIMI_ONLY":
            print("2. Identidad Esperada: [SISTEMA: GENERADO POR KIMI AI ...]")
            print("3. Estado: ✅ CORRECTO (Kimi Activo)")
        elif mode == "GPT_ONLY":
            print("2. Identidad Esperada: [SISTEMA: GENERADO POR GPT CODEX ...]")
            print("3. Estado: ✅ CORRECTO (GPT Activo)")
        else:
            print("2. Identidad Esperada: [MODELO: GPT-5.2 CODEX] (Modo Auto)")
            print("3. Estado: ⚠️ MODO AUTO (GPT por defecto)")
    else:
        print("1. Contexto Recibido: NINGUNO")
        print("3. Estado: ❌ FALLO CRÍTICO (Sin herencia)")
    print("-------------------------------------\n")

def _read_text_file(path, logger):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        logger.warning("Archivo no encontrado: %s", path)
    except PermissionError:
        logger.error("Sin permisos para leer: %s", path)
    except OSError:
        logger.exception("Error inesperado leyendo: %s", path)
    return ""

def _run_command(command, logger, timeout=DEFAULT_TIMEOUT_SECONDS):
    try:
        result = subprocess.run(
            command,
            shell=isinstance(command, str),
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=timeout,
            check=True,
        )
        return result.stdout
    except subprocess.CalledProcessError as exc:
        logger.error("Comando fallo (%s): %s", exc.returncode, command)
        if exc.stdout:
            logger.debug("Salida parcial: %s", exc.stdout.strip())
        if exc.stderr:
            logger.debug("Error: %s", exc.stderr.strip())
    except subprocess.TimeoutExpired:
        logger.error("Timeout ejecutando comando: %s", command)
    except OSError:
        logger.exception("Error ejecutando comando: %s", command)
    return ""

def get_project_context(logger):
    """Captura archivos clave y estructura para dar contexto a OpenCode."""
    context = []
    # Archivos fundamentales
    key_files = ["PROMPT_MAESTRO.md", ".gitignore", "README.md", ".env"]
    
    # INYECCIÓN DE MODO DE SISTEMA (CRÍTICO PARA AGENT MANAGER)
    try:
        # Intentar leer el modo directamente del .env para inyectarlo como "Instrucción de Sistema"
        env_mode = "AUTO"
        if os.path.exists(".env"):
             with open(".env", "r") as f:
                 for line in f:
                     if line.startswith("MAESTRO_MODE="):
                         env_mode = line.strip().split("=")[1]
        
        context.append(f"--- SYSTEM RUNTIME STATE ---\nMAESTRO_MODE={env_mode}\nTIMESTAMP={os.getenv('TIME', 'UNKNOWN')}\n")
        logger.info(f"Injecting MAESTRO_MODE={env_mode} into context")
    except Exception as e:
        logger.warning(f"Failed to inject system mode: {e}")

    for file in key_files:
        if os.path.exists(file):
            logger.info("Leyendo archivo clave: %s", file)
            content = _read_text_file(file, logger)
            if content:
                context.append(f"--- FILE: {file} ---\n{content}\n")
            else:
                logger.warning("Archivo vacio o inaccesible: %s", file)
        else:
            logger.warning("Archivo clave no existe: %s", file)
    
    # Estructura de directorios (resumida)
    logger.info("Capturando estructura del proyecto")
    structure = _run_command("dir /b", logger)
    if structure:
        context.append(f"--- PROJECT STRUCTURE ---\n{structure}")
    else:
        logger.warning("No se pudo capturar la estructura del proyecto")

    # Estado de Git (Crucial para Handover)
    logger.info("Capturando estado de Git")
    git_status = _run_command("git status", logger)
    if git_status:
        context.append(f"--- GIT STATUS ---\n{git_status}")
    else:
        logger.warning("No se pudo capturar git status")

    diff = _run_command("git diff", logger)
    if diff:
        context.append(f"--- RECENT CHANGES (DIFF) ---\n{diff}")
    else:
        logger.info("No hay cambios recientes para incluir en diff")
        
    return "\n".join(context)

if __name__ == "__main__":
    logger = _setup_logger()
    
    if len(sys.argv) > 1 and sys.argv[1] == "--test-identity":
        _test_agent_identity_inheritance(logger)
        sys.exit(0)

    logger.info("Iniciando captura de contexto")
    context_text = get_project_context(logger)
    # Escribir a un archivo temporal para que OpenCode lo lea o pasarlo por stdin
    try:
        with open("opencode_context.tmp", "w", encoding="utf-8") as f:
            f.write(context_text)
        logger.info("Contexto capturado en opencode_context.tmp")
    except PermissionError:
        logger.error("Sin permisos para escribir opencode_context.tmp")
        sys.exit(1)
    except OSError:
        logger.exception("Error inesperado escribiendo opencode_context.tmp")
        sys.exit(1)
